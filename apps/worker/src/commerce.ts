import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { fetchWithTimeout, withLimitedRetry } from "./runtime-resilience.js";

const DEFAULT_GUIDE_PRICE_CENTS = 1000;
const PURCHASE_TTL_SECONDS = 60 * 60 * 24 * 365;

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function handleBaselineGuideCheckout(req: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return json({ error: "unauthorized", message: "Sign in to create a personalized Baseline Guide." }, 401);
  }

  if (!env.STRIPE_SECRET_KEY || !env.APP_URL) {
    return json({ error: "commerce_not_configured" }, 503);
  }

  const natalRecord = await env.KV.get(`natal:${user.id}`);
  if (!natalRecord) {
    return json({
      error: "baseline_required",
      message: "Complete your Baseline Design before purchasing the guide.",
    }, 409);
  }

  const configuredAmount = Number.parseInt(env.BASELINE_GUIDE_PRICE_CENTS ?? "", 10);
  const unitAmount = Number.isFinite(configuredAmount) && configuredAmount >= 500
    ? configuredAmount
    : DEFAULT_GUIDE_PRICE_CENTS;

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(unitAmount));
  params.set("line_items[0][price_data][product_data][name]", "Your Baseline Guide");
  params.set(
    "line_items[0][price_data][product_data][description]",
    "A branded, downloadable personal operating guide generated from your Baseline Design."
  );
  params.set("line_items[0][quantity]", "1");
  params.set("client_reference_id", user.id);
  params.set("customer_email", user.email);
  params.set("payment_intent_data[metadata][userId]", user.id);
  params.set("payment_intent_data[metadata][purchaseType]", "baseline_guide");
  params.set("metadata[userId]", user.id);
  params.set("metadata[purchaseType]", "baseline_guide");
  params.set(
    "success_url",
    `${env.APP_URL}/baseline-guide?purchase=success&session_id={CHECKOUT_SESSION_ID}`
  );
  params.set("cancel_url", `${env.APP_URL}/baseline-guide?purchase=canceled`);
  params.set("automatic_tax[enabled]", "true");

  const response = await withLimitedRetry(
    "stripe_baseline_guide_checkout",
    () => fetchWithTimeout(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `baseline-guide:${user.id}:${new Date().toISOString().slice(0, 10)}`,
        },
        body: params.toString(),
      },
      10_000
    ),
    2,
    10_000
  );

  const payload = await response.json() as Record<string, unknown>;
  if (!response.ok || typeof payload.url !== "string") {
    return json({ error: "checkout_failed" }, 503);
  }

  return json({ url: payload.url });
}

export async function handleBaselineGuideVerify(req: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(req, env.DB);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!env.STRIPE_SECRET_KEY) return json({ error: "commerce_not_configured" }, 503);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) {
    return json({ error: "invalid_session" }, 400);
  }

  const response = await fetchWithTimeout(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
    10_000
  );
  const payload = await response.json() as Record<string, any>;

  const validPurchase = response.ok
    && payload.payment_status === "paid"
    && payload.mode === "payment"
    && payload.client_reference_id === user.id
    && payload.metadata?.purchaseType === "baseline_guide";

  if (!validPurchase) return json({ error: "purchase_not_verified" }, 402);

  const record = {
    userId: user.id,
    sessionId,
    paymentIntentId: typeof payload.payment_intent === "string" ? payload.payment_intent : null,
    amountTotal: typeof payload.amount_total === "number" ? payload.amount_total : null,
    currency: typeof payload.currency === "string" ? payload.currency : "usd",
    purchasedAt: Date.now(),
    status: "paid",
  };

  await env.KV.put(`purchase:baseline-guide:${user.id}`, JSON.stringify(record), {
    expirationTtl: PURCHASE_TTL_SECONDS,
  });

  return json({ verified: true, purchase: record });
}

export async function handleSupportRedirect(env: Env): Promise<Response> {
  const url = env.STRIPE_SUPPORT_LINK_URL;
  if (!url || !url.startsWith("https://buy.stripe.com/")) {
    return json({ error: "support_link_not_configured" }, 404);
  }
  return Response.redirect(url, 302);
}
