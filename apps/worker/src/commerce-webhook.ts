import type { Env } from "./types-env.js"

type StripeEvent = {
  id?: unknown
  type?: unknown
  data?: { object?: Record<string, any> }
}

export async function fulfillBaselineGuidePurchase(
  event: StripeEvent,
  env: Env,
): Promise<Response | null> {
  if (event.type !== "checkout.session.completed") return null

  const session = event.data?.object
  if (!session || session.metadata?.purchaseType !== "baseline_guide") return null

  const userId = typeof session.client_reference_id === "string"
    ? session.client_reference_id
    : session.metadata?.userId

  if (
    typeof event.id !== "string" ||
    typeof userId !== "string" ||
    session.mode !== "payment" ||
    session.payment_status !== "paid"
  ) {
    return Response.json({ error: "baseline_guide_event_invalid" }, { status: 400 })
  }

  const eventKey = `stripe_event:${event.id}`
  const duplicate = await env.KV.get(eventKey)
  if (duplicate) {
    return Response.json({ received: true, duplicate: true, purchaseType: "baseline_guide" })
  }

  const record = {
    userId,
    sessionId: typeof session.id === "string" ? session.id : null,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    amountTotal: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: typeof session.currency === "string" ? session.currency : "usd",
    purchasedAt: Date.now(),
    status: "paid",
    fulfilledBy: "stripe_webhook",
  }

  await Promise.all([
    env.KV.put(`purchase:baseline-guide:${userId}`, JSON.stringify(record)),
    env.KV.put(eventKey, "baseline_guide", { expirationTtl: 60 * 60 * 24 * 30 }),
  ])

  return Response.json({ received: true, purchaseType: "baseline_guide" })
}
