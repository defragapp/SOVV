import type { Env } from "./types-env.js"
import { fetchWithTimeout, withLimitedRetry } from "./runtime-resilience.js"

const SUPPORT_PRODUCT_ID = "prod_UdHOjayxvOoWQW"
const MIN_SUPPORT_CENTS = 500
const MAX_SUPPORT_CENTS = 50000

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function handleSupportCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY || !env.APP_URL) {
    return json({ error: "commerce_not_configured" }, 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: "invalid_json" }, 400)
  }

  const amount = typeof body === "object" && body !== null
    ? Number((body as { amount?: unknown }).amount)
    : Number.NaN
  const amountCents = Math.round(amount * 100)

  if (!Number.isFinite(amount) || amountCents < MIN_SUPPORT_CENTS || amountCents > MAX_SUPPORT_CENTS) {
    return json({
      error: "invalid_amount",
      message: "Choose an amount between $5 and $500.",
    }, 400)
  }

  const params = new URLSearchParams()
  params.set("mode", "payment")
  params.set("line_items[0][price_data][currency]", "usd")
  params.set("line_items[0][price_data][unit_amount]", String(amountCents))
  params.set("line_items[0][price_data][product]", SUPPORT_PRODUCT_ID)
  params.set("line_items[0][quantity]", "1")
  params.set("metadata[purchaseType]", "support")
  params.set("payment_intent_data[metadata][purchaseType]", "support")
  params.set("success_url", `${env.APP_URL}/contact?support=success`)
  params.set("cancel_url", `${env.APP_URL}/contact?support=canceled`)
  params.set("billing_address_collection", "auto")

  const response = await withLimitedRetry(
    "stripe_support_checkout",
    () => fetchWithTimeout(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `support:${amountCents}:${crypto.randomUUID()}`,
        },
        body: params.toString(),
      },
      10_000,
    ),
    2,
    10_000,
  )

  const payload = await response.json() as Record<string, unknown>
  if (!response.ok || typeof payload.url !== "string") {
    return json({ error: "checkout_failed" }, 503)
  }

  return json({ url: payload.url })
}
