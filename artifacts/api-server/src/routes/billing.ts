import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/** Allowed origins — exact host match only, no prefix attacks. */
function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS) return process.env.ALLOWED_ORIGINS.split(",").map(s => s.trim());
  if (process.env.REPLIT_DEV_DOMAIN) return [`https://${process.env.REPLIT_DEV_DOMAIN}`];
  return ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"];
}

function extractOriginHost(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

function getRequestOrigin(req: Request): string {
  return String(req.headers.origin || "").trim() ||
         extractOriginHost(String(req.headers.referer || "").trim());
}

function isAllowedOrigin(req: Request): boolean {
  const origin = getRequestOrigin(req);
  if (!origin) return false;
  const normalized = extractOriginHost(origin);
  return getAllowedOrigins().some(o => extractOriginHost(o) === normalized);
}

// ── POST /api/billing/checkout ────────────────────────────────────────────────
router.post("/checkout", requireAuth, async (req: Request, res: Response) => {
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: "Origin not allowed" });

  const origin     = extractOriginHost(getRequestOrigin(req));
  const successUrl = `${origin}/apps/covenant?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${origin}/pricing`;

  try {
    const stripe = getStripe();

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user?.email });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, req.userId!));
    }

    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        "subscription",
      line_items:  [{
        price_data: {
          currency:     "usd",
          product_data: { name: "Sovereign.os Pro" },
          recurring:    { interval: "month" },
          unit_amount:  1200,
        },
        quantity: 1,
      }],
      success_url:       successUrl,
      cancel_url:        cancelUrl,
      metadata:          { user_id: req.userId! },
      subscription_data: { metadata: { user_id: req.userId! } },
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("[billing/checkout]", err);
    if (err.message?.includes("STRIPE_SECRET_KEY")) {
      return res.status(503).json({ error: "Payment configuration unavailable" });
    }
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ── POST /api/billing/portal ──────────────────────────────────────────────────
router.post("/portal", requireAuth, async (req: Request, res: Response) => {
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: "Origin not allowed" });

  const origin    = extractOriginHost(getRequestOrigin(req));
  const returnUrl = `${origin}/apps/defrag`;

  try {
    const stripe = getStripe();
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: "No billing account found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   user.stripeCustomerId,
      return_url: returnUrl,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("[billing/portal]", err);
    return res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
