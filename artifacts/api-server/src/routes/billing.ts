import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/rate-limit";
import { extractOriginHost, getAllowedOrigins } from "../lib/origins";

const router = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const checkoutLimiter = createRateLimiter({
  keyPrefix: "billing-checkout",
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many checkout attempts. Please try again later.",
});

const confirmLimiter = createRateLimiter({
  keyPrefix: "billing-confirm",
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many confirmation requests. Please try again later.",
});

const portalLimiter = createRateLimiter({
  keyPrefix: "billing-portal",
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many billing portal requests. Please try again later.",
});

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
router.post("/checkout", requireAuth, checkoutLimiter, async (req: Request, res: Response) => {
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: "Origin not allowed" });

  const rawPriceId = req.body?.priceId;
  const priceId = typeof rawPriceId === "string" ? rawPriceId.trim() : "";
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

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency:     "usd",
            product_data: { name: "Sovereign.os Pro" },
            recurring:    { interval: "month" },
            unit_amount:  1200,
          },
          quantity: 1,
        }];

    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        "subscription",
      line_items:  lineItems,
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

// ── GET /api/billing/confirm ──────────────────────────────────────────────────
router.get("/confirm", requireAuth, confirmLimiter, async (req: Request, res: Response) => {
  const sessionId = typeof req.query.session_id === "string" ? req.query.session_id.trim() : "";
  if (!sessionId) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const stripe = getStripe();
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    });

    if (session.mode !== "subscription") {
      return res.status(409).json({ error: "Checkout session mode is invalid" });
    }

    if (session.status !== "complete") {
      return res.status(409).json({ error: "Checkout session is not complete" });
    }

    const userId = session.metadata?.user_id;
    if (!userId || userId !== req.userId) {
      return res.status(403).json({ error: "Session does not belong to the current user" });
    }

    if (session.payment_status !== "paid") {
      return res.status(409).json({ error: "Checkout has not completed payment" });
    }

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    const alreadyConfirmed =
      user.tier === "pro" &&
      (!subscriptionId || user.stripeSubscriptionId === subscriptionId);

    if (alreadyConfirmed) {
      return res.json({ ok: true });
    }

    await db.update(users).set({
      tier: "pro",
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscriptionId ?? undefined,
    }).where(eq(users.id, req.userId!));

    return res.json({ ok: true });
  } catch (err) {
    console.error("[billing/confirm]", err);
    return res.status(500).json({ error: "Failed to confirm checkout session" });
  }
});

// ── POST /api/billing/portal ──────────────────────────────────────────────────
router.post("/portal", requireAuth, portalLimiter, async (req: Request, res: Response) => {
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
