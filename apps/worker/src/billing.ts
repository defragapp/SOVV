import type { Env } from "./types-env.js";
import { getSessionId, cookieHeader } from "./plan.js";
import { getAuthUser, verifyAccessJWT } from "./auth.js";
import { logSafetyEvent } from "./safety.js";
import { z } from "zod";
import {
  sendWelcomeEmail,
  sendPaymentSucceededEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
  sendTrialEndingEmail,
  sendPaymentOverdueEmail,
} from "./email.js";
import { fetchWithTimeout, withLimitedRetry } from "./runtime-resilience.js";

const WEBHOOK_TOLERANCE_SECONDS = 300;
const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 7;

const StripeWebhookEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  created: z.number().int().nonnegative(),
  data: z.object({
    object: z.record(z.string(), z.unknown()),
  }),
});

const CheckoutSessionCompletedSchema = z.object({
  id: z.string().min(1).optional(),
  customer: z.string().min(1),
  client_reference_id: z.string().min(1),
});

const SubscriptionObjectSchema = z.object({
  id: z.string().min(1),
  customer: z.string().min(1),
  status: z.string().min(1),
  current_period_end: z.number().int().optional(),
});

const InvoiceObjectSchema = z.object({
  customer: z.string().min(1),
  subscription: z.string().min(1).optional(),
  billing_reason: z.string().optional(),
  period_end: z.number().int().optional(),
});
const SubscriptionTrialSchema = z.object({
  id: z.string().min(1),
  customer: z.string().min(1),
  trial_end: z.number().int().optional(),
  status: z.string().min(1),
});


function parseStripeSignatureHeader(sigHeader: string): { timestamp: number; v1: string } | null {
  const rawParts = sigHeader.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const schema = z.object({
    t: z.string().regex(/^\d+$/),
    v1: z.string().regex(/^[0-9a-f]+$/i),
  });
  const parsed = schema.safeParse(rawParts);
  if (!parsed.success) return null;
  return { timestamp: Number(parsed.data.t), v1: parsed.data.v1 };
}

function jsonWithRequestId(body: Record<string, unknown>, status: number, requestId: string): Response {
  return new Response(JSON.stringify({ ...body, requestId }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "x-request-id": requestId,
    },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Stripe webhook signature verification in Workers (no Stripe SDK)
// Stripe signs: "t=timestamp,v1=signature"
// Signed payload: "${timestamp}.${rawBody}"
// HMAC SHA256 with STRIPE_WEBHOOK_SECRET
async function verifyStripeSignature(rawBody: string, timestamp: number, v1: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = `${timestamp}.${rawBody}`;
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
  const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");

  // constant-time compare
  if (hex.length !== v1.length) return false;
  let out = 0;
  for (let i = 0; i < hex.length; i++) out |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return out === 0;
}

async function requireSessionAuth(req: Request, env: Env): Promise<Response | null> {
  const user = await getAuthUser(req, env.DB);
  if (user) return null;
  return verifyAccessJWT(req, env);
}

/**
 * Checks if the authenticated user has an active subscription.
 * Returns a 402 Payment Required response if the subscription is not active
 * and the route is a workspace-protected route.
 */
export async function requireActiveSubscription(
  user: { subscription_status: string; tier: string } | null,
  request: Request,
  requestId?: string
): Promise<Response | null> {
  const reqMeta = requestId ? { requestId } : {};
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized", ...reqMeta }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...(requestId ? { "x-request-id": requestId } : {}) },
    });
  }

  const url = new URL(request.url);

  // Pro-only routes — Covenant and Alignment require active subscription
  const isProRoute = url.pathname.startsWith("/api/covenant") ||
    url.pathname.startsWith("/api/alignment");

  if (!isProRoute) {
    return null; // Not a Pro-only route — let it through (free users can use Defrag)
  }

  const hasActive = user.subscription_status === "active" || user.tier === "pro";
  if (!hasActive) {
    return new Response(JSON.stringify({
      error: "payment_required",
      message: "The Covenant and Alignment spaces require a Pro subscription. Upgrade to access all spaces.",
      ...reqMeta,
    }), {
      status: 402,
      headers: { "Content-Type": "application/json", ...(requestId ? { "x-request-id": requestId } : {}) },
    });
  }

  return null; // Subscription is active — proceed
}

export async function handleCheckout(req: Request, env: Env): Promise<Response> {
  const requestId = crypto.randomUUID();
  const endpoint = "/api/billing/checkout";
  const errorJson = (status: number, error: string, message?: string) =>
    new Response(JSON.stringify({ error, ...(message ? { message } : {}), requestId }), {
      status,
      headers: { "Content-Type": "application/json", "x-request-id": requestId },
    });

  await logSafetyEvent(env, {
    type: "request_lifecycle",
    requestId,
    metadata: { endpoint, stage: "start" },
  });
  const authErr = await requireSessionAuth(req, env);
  if (authErr) {
    await logSafetyEvent(env, {
      type: "request_lifecycle",
      requestId,
      metadata: { endpoint, stage: "auth_failed" },
    });
    return authErr;
  }

  // Get user from session for client_reference_id
  const user = await getAuthUser(req, env.DB);
  const userId = user?.id ?? "unknown";

  const sid = await getSessionId(req);

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.APP_URL) {
      await logSafetyEvent(env, {
        type: "validation_error",
        requestId,
        metadata: { endpoint, reason: "billing_not_configured", userId },
      });
      return errorJson(400, "billing_not_configured", "Checkout is not configured in this environment (STRIPE_SECRET_KEY, STRIPE_PRICE_ID, or APP_URL missing)");
    }
  // Parse optional promo/coupon from request body
  let couponId: string | undefined;
  try {
    const body = await req.clone().json() as { couponId?: string; promo_code?: string };
    couponId = body.couponId || body.promo_code;
  } catch { /* no body */ }

  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${env.APP_URL}/app?upgraded=1`);
  params.set("cancel_url", `${env.APP_URL}/app?canceled=1`);
  // Track checkout start for abandoned checkout recovery
  if (env.KV && userId !== "unknown") {
    const checkoutKey = `checkout:started:${userId}`;
    await env.KV.put(checkoutKey, JSON.stringify({ email: user?.email, startedAt: Date.now() }), {
      expirationTtl: 48 * 60 * 60, // 48 hours
    }).catch(() => {});
  }
  params.set("client_reference_id", userId);
  params.set("subscription_data[metadata][userId]", userId);
  // Trial period: configure in Stripe dashboard when ready
  // Apply Stripe coupon/discount if provided
  if (couponId) {
    params.set("discounts[0][coupon]", couponId);
  } else {
    // Allow Stripe promotion codes (user-entered codes at checkout)
    params.set("allow_promotion_codes", "true");
  }
  // Pre-fill email so Stripe checkout doesn't ask for it again
  if (user?.email) {
    params.set("customer_email", user.email);
  }

  const res = await withLimitedRetry(
    "stripe_checkout_create",
    () =>
      fetchWithTimeout(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        },
        10_000
      ),
    2,
    10_000
  );

  const data = await res.json() as Record<string, unknown>;
  if (!res.ok || typeof data["url"] !== "string") {
    await logSafetyEvent(env, {
      type: "system_error",
      requestId,
      metadata: { endpoint, reason: "checkout_failed", userId },
    });
    return errorJson(503, "checkout_failed");
  }

  await logSafetyEvent(env, {
    type: "request_lifecycle",
    requestId,
    metadata: { endpoint, stage: "end", userId },
  });
  return Response.json(
    { url: data["url"] },
    { headers: { "set-cookie": cookieHeader(sid) } }
  );
}

export async function handleWebhook(req: Request, env: Env): Promise<Response> {
  const requestId = crypto.randomUUID();
  const endpoint = "/api/billing/webhook";
  await logSafetyEvent(env, {
    type: "request_lifecycle",
    requestId,
    metadata: { endpoint, stage: "start" },
  });

  if (!env.STRIPE_WEBHOOK_SECRET) {
    await logSafetyEvent(env, {
      type: "system_error",
      requestId,
      metadata: { reason: "stripe_webhook_secret_missing" },
    });
    return jsonWithRequestId({ error: "webhook_not_configured" }, 500, requestId);
  }

  const signatureHeader = req.headers.get("stripe-signature") || "";
  const signature = parseStripeSignatureHeader(signatureHeader);
  if (!signature) {
    await logSafetyEvent(env, {
      type: "validation_error",
      requestId,
      metadata: { reason: "signature_invalid" },
    });
    return jsonWithRequestId({ error: "invalid_signature" }, 400, requestId);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - signature.timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    await logSafetyEvent(env, {
      type: "validation_error",
      requestId,
      metadata: {
        reason: "timestamp_invalid",
        signatureTimestamp: signature.timestamp,
        nowSeconds,
      },
    });
    return jsonWithRequestId({ error: "timestamp_invalid" }, 400, requestId);
  }

  const rawBody = await req.text();
  const signatureValid = await verifyStripeSignature(rawBody, signature.timestamp, signature.v1, env.STRIPE_WEBHOOK_SECRET);
  if (!signatureValid) {
    await logSafetyEvent(env, {
      type: "validation_error",
      requestId,
      metadata: { reason: "signature_mismatch" },
    });
    return jsonWithRequestId({ error: "invalid_signature" }, 400, requestId);
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    await logSafetyEvent(env, {
      type: "validation_error",
      requestId,
      metadata: { reason: "payload_invalid_json" },
    });
    return jsonWithRequestId({ error: "payload_invalid" }, 400, requestId);
  }
  const payloadValidation = StripeWebhookEnvelopeSchema.safeParse(rawPayload);
  if (payloadValidation.success === false) {
    await logSafetyEvent(env, {
      type: "validation_error",
      requestId,
      metadata: {
        reason: "payload_invalid",
        issues: payloadValidation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
        })),
      },
    });
    return jsonWithRequestId({ error: "payload_invalid" }, 400, requestId);
  }

  const event = payloadValidation.data;
  if (Math.abs(nowSeconds - event.created) > WEBHOOK_TOLERANCE_SECONDS) {
    await logSafetyEvent(env, {
      type: "validation_error",
      requestId,
      metadata: {
        reason: "timestamp_invalid",
        eventCreated: event.created,
        nowSeconds,
      },
    });
    return jsonWithRequestId({ error: "timestamp_invalid" }, 400, requestId);
  }

  const signatureHash = await sha256Hex(signatureHeader);
  const kvEventKey = `stripe_event:${event.id}`;
  const kvSignatureKey = `stripe_sig:${signatureHash}`;
  const [duplicateById, duplicateBySignature] = await Promise.all([
    env.KV.get(kvEventKey),
    env.KV.get(kvSignatureKey),
  ]);
  if (duplicateById || duplicateBySignature) {
    await logSafetyEvent(env, {
      type: "rate_limit_exceeded",
      requestId,
      metadata: {
        reason: "duplicate_event",
        eventId: event.id,
        eventType: event.type,
      },
    });
    return jsonWithRequestId({ received: true, duplicate: true }, 200, requestId);
  }

  try {
    await env.DB.prepare("INSERT INTO stripe_events (id, type, processed_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
      .bind(event.id, event.type)
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE constraint failed")) {
      await logSafetyEvent(env, {
        type: "rate_limit_exceeded",
        requestId,
        metadata: {
          reason: "duplicate_event",
          eventId: event.id,
          eventType: event.type,
        },
      });
      return jsonWithRequestId({ received: true, duplicate: true }, 200, requestId);
    }

    await logSafetyEvent(env, {
      type: "system_error",
      requestId,
      metadata: {
        reason: "idempotency_store_failed",
        eventId: event.id,
        eventType: event.type,
      },
    });
    return jsonWithRequestId({ error: "temporary_failure" }, 503, requestId);
  }

  const emailOpts: { emailBinding?: typeof env.EMAIL; resendApiKey?: string } = {};
  if (env.EMAIL) emailOpts.emailBinding = env.EMAIL;
  if (env.RESEND_API_KEY) emailOpts.resendApiKey = env.RESEND_API_KEY;

  let customerId: string | null = null;
  let userId: string | null = null;
  let billingTransition: string | null = null;

  await logSafetyEvent(env, {
    type: "billing_event",
    requestId,
    metadata: {
      stage: "received",
      eventId: event.id,
      eventType: event.type,
    },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const parsed = CheckoutSessionCompletedSchema.safeParse(event.data.object);
        if (parsed.success === false) {
          await logSafetyEvent(env, {
            type: "validation_error",
            requestId,
            metadata: {
              reason: "payload_invalid",
              eventId: event.id,
              eventType: event.type,
              issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })),
            },
          });
          return jsonWithRequestId({ error: "payload_invalid" }, 400, requestId);
        }

        const session = parsed.data;
        userId = session.client_reference_id;
        customerId = session.customer;
        billingTransition = "subscription_status:active";

        await env.DB.prepare(
          "UPDATE users SET tier = 'pro', subscription_status = 'active', stripe_customer_id = ?, subscription_updated_at = ? WHERE id = ?"
        )
          .bind(session.customer, Date.now(), session.client_reference_id)
          .run();

        if (emailOpts.emailBinding || emailOpts.resendApiKey) {
          const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
            .bind(session.client_reference_id)
            .first<{ email?: string }>();
          if (user?.email) {
            await sendWelcomeEmail(user.email, emailOpts);
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const parsed = SubscriptionObjectSchema.safeParse(event.data.object);
        if (parsed.success === false) {
          await logSafetyEvent(env, {
            type: "validation_error",
            requestId,
            metadata: {
              reason: "payload_invalid",
              eventId: event.id,
              eventType: event.type,
              issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })),
            },
          });
          return jsonWithRequestId({ error: "payload_invalid" }, 400, requestId);
        }

        const subscription = parsed.data;
        customerId = subscription.customer;
        const status = event.type === "customer.subscription.deleted" ? "canceled" : subscription.status;
        billingTransition = `subscription_status:${status}`;

        if (event.type === "customer.subscription.deleted") {
          await env.DB.prepare(
            "UPDATE users SET tier = 'free', subscription_status = 'canceled', stripe_subscription_id = NULL, subscription_updated_at = ? WHERE stripe_customer_id = ?"
          )
            .bind(Date.now(), subscription.customer)
            .run();
        } else {
          const updates = ["subscription_status = ?", "subscription_updated_at = ?"];
          const params: Array<string | number> = [status, Date.now()];

          if (subscription.current_period_end) {
            updates.push("subscription_current_period_end = ?");
            params.push(subscription.current_period_end);
          }

          if (event.type === "customer.subscription.created" || status === "active") {
            updates.push("tier = 'pro'");
            updates.push("stripe_subscription_id = ?");
            params.push(subscription.id);
          }

          params.push(subscription.customer);
          await env.DB.prepare(
            `UPDATE users SET ${updates.join(", ")} WHERE stripe_customer_id = ?`
          )
            .bind(...params)
            .run();
        }

        if ((emailOpts.emailBinding || emailOpts.resendApiKey) && event.type === "customer.subscription.deleted") {
          const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
            .bind(subscription.customer)
            .first<{ email?: string }>();
          if (user?.email) {
            await sendCancellationEmail(user.email, emailOpts);
          }
        }
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const parsed = InvoiceObjectSchema.safeParse(event.data.object);
        if (parsed.success === false) {
          await logSafetyEvent(env, {
            type: "validation_error",
            requestId,
            metadata: {
              reason: "payload_invalid",
              eventId: event.id,
              eventType: event.type,
              issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })),
            },
          });
          return jsonWithRequestId({ error: "payload_invalid" }, 400, requestId);
        }

        const invoice = parsed.data;
        customerId = invoice.customer;
        const status = event.type === "invoice.payment_succeeded" ? "active" : "past_due";
        billingTransition = `subscription_status:${status}`;

        if (event.type === "invoice.payment_succeeded") {
          const updates = [
            "subscription_status = 'active'",
            "tier = 'pro'",
            "subscription_updated_at = ?",
          ];
          const params: Array<string | number> = [Date.now()];

          if (invoice.subscription) {
            updates.push("stripe_subscription_id = ?");
            params.push(invoice.subscription);
          }
          if (invoice.period_end) {
            updates.push("subscription_current_period_end = ?");
            params.push(invoice.period_end);
          }

          params.push(invoice.customer);
          await env.DB.prepare(`UPDATE users SET ${updates.join(", ")} WHERE stripe_customer_id = ?`)
            .bind(...params)
            .run();
        } else {
          await env.DB.prepare(
            "UPDATE users SET subscription_status = 'past_due', subscription_updated_at = ? WHERE stripe_customer_id = ?"
          )
            .bind(Date.now(), invoice.customer)
            .run();
        }

        if (emailOpts.emailBinding || emailOpts.resendApiKey) {
          const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
            .bind(invoice.customer)
            .first<{ email?: string }>();
          if (user?.email) {
            if (event.type === "invoice.payment_succeeded" && invoice.billing_reason === "subscription_cycle") {
              await sendPaymentSucceededEmail(user.email, emailOpts);
            }
            if (event.type === "invoice.payment_failed") {
              await sendPaymentFailedEmail(user.email, emailOpts);
            }
          }
        }
        break;
      }
      case "customer.subscription.trial_will_end": {
        // Trial ending in ~3 days — send reminder email
        const parsed = SubscriptionTrialSchema.safeParse(event.data.object);
        if (!parsed.success) break;
        const sub = parsed.data;
        customerId = sub.customer;
        billingTransition = "trial_will_end";
        if (emailOpts.emailBinding || emailOpts.resendApiKey) {
          const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
            .bind(sub.customer).first<{ email?: string }>();
          if (user?.email) {
            const trialEndDate = sub.trial_end
              ? new Date(sub.trial_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })
              : "soon";
            await sendTrialEndingEmail(user.email, { ...emailOpts, trialEndDate });
          }
        }
        break;
      }
      case "invoice.payment_action_required":
      case "invoice.upcoming": {
        // Upcoming invoice or action required — no DB change needed, just log
        billingTransition = `invoice_event:${event.type}`;
        break;
      }
      case "customer.subscription.paused": {
        // Subscription paused — treat as past_due for entitlement purposes
        const parsed = SubscriptionObjectSchema.safeParse(event.data.object);
        if (!parsed.success) break;
        customerId = parsed.data.customer;
        billingTransition = "subscription_status:paused";
        await env.DB.prepare(
          "UPDATE users SET subscription_status = 'past_due', subscription_updated_at = ? WHERE stripe_customer_id = ?"
        ).bind(Date.now(), parsed.data.customer).run();
        break;
      }
      case "customer.subscription.resumed": {
        // Subscription resumed — restore active
        const parsed = SubscriptionObjectSchema.safeParse(event.data.object);
        if (!parsed.success) break;
        customerId = parsed.data.customer;
        billingTransition = "subscription_status:active";
        await env.DB.prepare(
          "UPDATE users SET subscription_status = 'active', tier = 'pro', subscription_updated_at = ? WHERE stripe_customer_id = ?"
        ).bind(Date.now(), parsed.data.customer).run();
        break;
      }
      case "payment_intent.payment_failed": {
        // Payment intent failed — mark past_due and notify
        const piSchema = z.object({ customer: z.string().min(1).optional() });
        const parsed = piSchema.safeParse(event.data.object);
        if (!parsed.success || !parsed.data.customer) break;
        customerId = parsed.data.customer;
        billingTransition = "payment_intent_failed";
        await env.DB.prepare(
          "UPDATE users SET subscription_status = 'past_due', subscription_updated_at = ? WHERE stripe_customer_id = ?"
        ).bind(Date.now(), parsed.data.customer).run();
        if (emailOpts.emailBinding || emailOpts.resendApiKey) {
          const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
            .bind(parsed.data.customer).first<{ email?: string }>();
          if (user?.email) {
            await sendPaymentOverdueEmail(user.email, emailOpts);
          }
        }
        break;
      }
            default:
        break;
    }

    await Promise.all([
      env.KV.put(kvEventKey, "processed", { expirationTtl: IDEMPOTENCY_TTL_SECONDS }),
      env.KV.put(kvSignatureKey, event.id, { expirationTtl: IDEMPOTENCY_TTL_SECONDS }),
    ]);

    await logSafetyEvent(env, {
      type: "billing_event",
      requestId,
      metadata: {
        stage: "processed",
        eventId: event.id,
        eventType: event.type,
        customerId,
        userId,
        billingTransition,
      },
    });
    return jsonWithRequestId({ received: true }, 200, requestId);
  } catch (error) {
    try {
      await env.DB.prepare("DELETE FROM stripe_events WHERE id = ?").bind(event.id).run();
    } catch (rollbackError) {
      await logSafetyEvent(env, {
        type: "system_error",
        requestId,
        metadata: {
          reason: "webhook_idempotency_rollback_failed",
          eventId: event.id,
          eventType: event.type,
          error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
        },
      });
    }
    await logSafetyEvent(env, {
      type: "system_error",
      requestId,
      metadata: {
        reason: "webhook_processing_failed",
        eventId: event.id,
        eventType: event.type,
        customerId,
        userId,
        billingTransition,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return jsonWithRequestId({ error: "temporary_failure" }, 503, requestId);
  }
}

export async function handlePortal(req: Request, env: Env): Promise<Response> {
  const requestId = crypto.randomUUID();
  const endpoint = "/api/billing/portal";
  const errorJson = (status: number, error: string) =>
    new Response(JSON.stringify({ error, requestId }), {
      status,
      headers: { "Content-Type": "application/json", "x-request-id": requestId },
    });
  await logSafetyEvent(env, {
    type: "request_lifecycle",
    requestId,
    metadata: { endpoint, stage: "start" },
  });
  const authErr = await requireSessionAuth(req, env);
  if (authErr) return authErr;

  const user = await getAuthUser(req, env.DB);

  if (!user) {
    return errorJson(401, "unauthorized");
  }

  if (!user.stripe_customer_id) {
    return errorJson(404, "no_billing_account");
  }

  if (!env.STRIPE_SECRET_KEY || !env.APP_URL) {
    return errorJson(500, "billing_not_configured");
  }

  const params = new URLSearchParams();
  params.set("customer", user.stripe_customer_id);
  params.set("return_url", `${env.APP_URL}/app`);

  const res = await withLimitedRetry(
    "stripe_portal_create",
    () =>
      fetchWithTimeout(
        "https://api.stripe.com/v1/billing_portal/sessions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        },
        10_000
      ),
    2,
    10_000
  );

  const data = await res.json() as Record<string, unknown>;
  if (!res.ok || typeof data["url"] !== "string") {
    return errorJson(503, "portal_failed");
  }

  await logSafetyEvent(env, {
    type: "request_lifecycle",
    requestId,
    metadata: { endpoint, stage: "end", userId: user.id },
  });
  return Response.json({ url: data["url"] });
}

export function registerBillingRoutes(router: any, getEnv: () => Env) {
  router.post("/api/billing/checkout", async (req: Request) => handleCheckout(req, getEnv()));
  router.post("/api/billing/webhook", async (req: Request) => handleWebhook(req, getEnv()));
  router.post("/api/billing/portal", async (req: Request) => handlePortal(req, getEnv()));
}