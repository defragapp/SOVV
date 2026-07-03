import { Router, type Request, type Response } from "express";
import Stripe from "stripe";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const secretKey = process.env["STRIPE_SECRET_KEY"];
  if (!secretKey) {
    res.status(500).json({ error: "Stripe is not configured." });
    return;
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2025-05-28.basil" });

  // Build absolute URLs from the incoming request origin so this works in
  // both local dev and production without hardcoding a domain.
  const origin =
    (req.headers["origin"] as string | undefined) ||
    `https://${req.headers["host"] ?? "sovereign.os"}`;

  const successUrl = `${origin}/apps/covenant?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/apps/defrag`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: 1200, // $12.00
            product_data: {
              name: "Sovereign.os Pro",
              description: "Full access to Covenant and Alignment spaces.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Forward any existing user email so Stripe pre-fills the form
      customer_email:
        (req.body as { email?: string } | undefined)?.email ?? undefined,
    });

    if (!session.url) {
      res.status(500).json({ error: "Stripe did not return a checkout URL." });
      return;
    }

    res.json({ url: session.url });
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeAuthenticationError) {
      console.error("[checkout] Stripe auth error — check STRIPE_SECRET_KEY");
      res.status(503).json({ error: "Payment service misconfigured. Please contact support." });
      return;
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] Stripe error:", msg);
    res.status(502).json({ error: "Could not start checkout. Please try again." });
  }
});

export default router;
