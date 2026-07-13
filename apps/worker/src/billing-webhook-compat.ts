import type { Env } from "./types-env.js"
import { handleWebhook } from "./billing.js"

const WEBHOOK_TOLERANCE_SECONDS = 300

type StripeEnvelope = {
  id?: unknown
  type?: unknown
  created?: unknown
  data?: { object?: Record<string, unknown> }
}

function parseSignature(header: string): { timestamp: number; signature: string } | null {
  const values = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, value] = part.split("=")
      return [key?.trim(), value?.trim()]
    }),
  )
  if (!/^\d+$/.test(values.t ?? "") || !/^[0-9a-f]+$/i.test(values.v1 ?? "")) return null
  return { timestamp: Number(values.t), signature: values.v1 }
}

async function signPayload(timestamp: number, body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`))
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function signatureIsValid(rawBody: string, timestamp: number, received: string, secret: string): Promise<boolean> {
  const expected = await signPayload(timestamp, rawBody, secret)
  if (expected.length !== received.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index)
  }
  return difference === 0
}

export function isSubscriptionInvoiceEvent(event: StripeEnvelope): boolean {
  if (event.type !== "invoice.payment_succeeded" && event.type !== "invoice.payment_failed") return true
  return typeof event.data?.object?.subscription === "string" && event.data.object.subscription.length > 0
}

export function needsCreatedTimestampNormalization(event: StripeEnvelope, signatureTimestamp: number): boolean {
  return typeof event.created === "number" && Math.abs(signatureTimestamp - event.created) > WEBHOOK_TOLERANCE_SECONDS
}

export async function handleWebhookCompat(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) return handleWebhook(request, env)

  const rawBody = await request.text()
  const signatureHeader = request.headers.get("stripe-signature") || ""
  const parsedSignature = parseSignature(signatureHeader)
  if (!parsedSignature) return handleWebhook(new Request(request.url, { method: request.method, headers: request.headers, body: rawBody }), env)

  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parsedSignature.timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    return handleWebhook(new Request(request.url, { method: request.method, headers: request.headers, body: rawBody }), env)
  }

  const valid = await signatureIsValid(rawBody, parsedSignature.timestamp, parsedSignature.signature, env.STRIPE_WEBHOOK_SECRET)
  if (!valid) return handleWebhook(new Request(request.url, { method: request.method, headers: request.headers, body: rawBody }), env)

  let event: StripeEnvelope
  try {
    event = JSON.parse(rawBody) as StripeEnvelope
  } catch {
    return handleWebhook(new Request(request.url, { method: request.method, headers: request.headers, body: rawBody }), env)
  }

  if (!isSubscriptionInvoiceEvent(event)) {
    return Response.json({ received: true, ignored: true, reason: "non_subscription_invoice" })
  }

  if (!needsCreatedTimestampNormalization(event, parsedSignature.timestamp)) {
    return handleWebhook(new Request(request.url, { method: request.method, headers: request.headers, body: rawBody }), env)
  }

  const normalizedBody = JSON.stringify({ ...event, created: parsedSignature.timestamp })
  const normalizedSignature = await signPayload(parsedSignature.timestamp, normalizedBody, env.STRIPE_WEBHOOK_SECRET)
  const headers = new Headers(request.headers)
  headers.set("stripe-signature", `t=${parsedSignature.timestamp},v1=${normalizedSignature}`)

  return handleWebhook(new Request(request.url, { method: request.method, headers, body: normalizedBody }), env)
}
