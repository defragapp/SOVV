import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// ── POST /api/stripe/webhook ──────────────────────────────────────────────────
// Raw body — registered BEFORE express.json() in app.ts.
router.post("/", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Stripe not configured" });

  const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig     = req.headers["stripe-signature"];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;
  const isDev   = process.env.NODE_ENV !== "production";

  let event: Stripe.Event;
  try {
    if (secret && sig) {
      // Production: verify signature
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
    } else if (isDev && !secret) {
      // Development only: allow unsigned (no STRIPE_WEBHOOK_SECRET set)
      console.warn("[webhook] DEV MODE — accepting unsigned webhook payload");
      event = JSON.parse((req.body as Buffer).toString()) as Stripe.Event;
    } else {
      // Production without secret configured, or missing signature — reject
      const reason = !secret ? "STRIPE_WEBHOOK_SECRET not set" : "stripe-signature header missing";
      console.error("[webhook] rejected:", reason);
      return res.status(400).json({ error: "Webhook signature required" });
    }
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err.message);
    return res.status(400).json({ error: "Webhook signature invalid" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId  = session.metadata?.user_id;
        const custId  = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subId   = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (userId) {
          await db.update(users).set({
            tier: "pro",
            stripeCustomerId:     custId ?? undefined,
            stripeSubscriptionId: subId  ?? undefined,
          }).where(eq(users.id, userId));
          console.log(`[webhook] user ${userId} upgraded to pro`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub    = event.data.object as Stripe.Subscription;
        const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (custId) {
          await db.update(users).set({ tier: "free", stripeSubscriptionId: null }).where(eq(users.stripeCustomerId, custId));
          console.log(`[webhook] customer ${custId} downgraded to free`);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub    = event.data.object as Stripe.Subscription;
        const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (custId) {
          const tier = sub.status === "active" ? "pro" : "free";
          await db.update(users).set({ tier }).where(eq(users.stripeCustomerId, custId));
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return res.status(500).json({ error: "Handler error" });
  }

  return res.json({ received: true });
});

export default router;
