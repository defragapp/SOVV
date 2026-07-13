import type { Env } from "./types-env.js"
import { handleWebhook } from "./billing.js"

const WEBHOOK_TOLERANCE_SECONDS = 300

type StripeEnvelope = {
  id?: unknown
  type?: unknown
  created?: unknown
  data?: { object?: Record<string, unknown> }
}

type ValidationResult = { valid: true } | { valid: false; reason: string }

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

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

export function validateKnownLifecycleEvent(event: StripeEnvelope): ValidationResult {
  if (!hasString(event.id) || !hasString(event.type) || typeof event.created !== "number" || !event.data?.object) {
    return { valid: false, reason: "invalid_envelope" }
  }

  const object = event.data.object
  if (event.type === "checkout.session.completed") {
    return hasString(object.customer) && hasString(object.client_reference_id)
      ? { valid: true }
      : { valid: false, reason: "invalid_checkout_session" }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    return hasString(object.id) && hasString(object.customer) && hasString(object.status)
      ? { valid: true }
      : { valid: false, reason: "invalid_subscription" }
  }

  if (event.type === "invoice.payment_succeeded" || event.type === "invoice.payment_failed") {
    return hasString(object.customer)
      ? { valid: true }
      : { valid: false, reason: "invalid_invoice" }
  }

  return { valid: true }
}

export function isSubscriptionInvoiceEvent(event: StripeEnvelope): boolean {
  if (event.type !== "invoice.payment_succeeded" && event.type !== "invoice.payment_failed") return true
  return hasString(event.data?.object?.subscription)
}

export function needsCreatedTimestampNormalization(event: StripeEnvelope, signatureTimestamp: number): boolean {
  return typeof event.created === "number" && Math.abs(signatureTimestamp - event.created) > WEBHOOK_TOLERANCE_SECONDS
}

function recreateRequest(request: Request, body: string, headers = request.headers): Request {
  return new Request(request.url, { method: request.method, headers, body })
}

export async function handleWebhookCompat(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) return handleWebhook(request, env)

  const rawBody = await request.text()
  const signatureHeader = request.headers.get("stripe-signature") || ""
  const parsedSignature = parseSignature(signatureHeader)
  if (!parsedSignature) return handleWebhook(recreateRequest(request, rawBody), env)

  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parsedSignature.timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    return handleWebhook(recreateRequest(request, rawBody), env)
  }

  const validSignature = await signatureIsValid(
    rawBody,
    parsedSignature.timestamp,
    parsedSignature.signature,
    env.STRIPE_WEBHOOK_SECRET,
  )
  if (!validSignature) return handleWebhook(recreateRequest(request, rawBody), env)

  let event: StripeEnvelope
  try {
    event = JSON.parse(rawBody) as StripeEnvelope
  } catch {
    return handleWebhook(recreateRequest(request, rawBody), env)
  }

  const validation = validateKnownLifecycleEvent(event)
  if (!validation.valid) {
    return Response.json({ error: "payload_invalid", reason: validation.reason }, { status: 400 })
  }

  if (!isSubscriptionInvoiceEvent(event)) {
    return Response.json({ received: true, ignored: true, reason: "non_subscription_invoice" })
  }

  if (!needsCreatedTimestampNormalization(event, parsedSignature.timestamp)) {
    return handleWebhook(recreateRequest(request, rawBody), env)
  }

  const normalizedBody = JSON.stringify({ ...event, created: parsedSignature.timestamp })
  const normalizedSignature = await signPayload(parsedSignature.timestamp, normalizedBody, env.STRIPE_WEBHOOK_SECRET)
  const headers = new Headers(request.headers)
  headers.set("stripe-signature", `t=${parsedSignature.timestamp},v1=${normalizedSignature}`)

  return handleWebhook(recreateRequest(request, normalizedBody, headers), env)
}
