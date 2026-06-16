import type { Env } from "./types-env.js";
import { getSessionId, cookieHeader } from "./plan.js";
import { getAuthUser, verifyAccessJWT } from "./auth.js";
import {
  sendWelcomeEmail,
  sendPaymentSucceededEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
} from "./email.js";

// Stripe webhook signature verification in Workers (no Stripe SDK)
// Stripe signs: "t=timestamp,v1=signature"
// Signed payload: "${timestamp}.${rawBody}"
// HMAC SHA256 with STRIPE_WEBHOOK_SECRET
async function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = `${t}.${rawBody}`;
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
export async function requireActiveSubscription(user: { subscription_status: string; tier: string } | null, request: Request): Promise<Response | null> {
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
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
    }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null; // Subscription is active — proceed
}

export async function handleCheckout(req: Request, env: Env): Promise<Response> {
  const authErr = await requireSessionAuth(req, env);
  if (authErr) return authErr;

  // Get user from session for client_reference_id
  const user = await getAuthUser(req, env.DB);
  const userId = user?.id ?? "unknown";

  const sid = await getSessionId(req);

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.APP_URL) {
      return Response.json({ error: "Checkout is not configured in this environment (STRIPE_SECRET_KEY, STRIPE_PRICE_ID, or APP_URL missing)" }, { status: 400 });
    }
    if (false) {
    return Response.json({ error: "billing_not_configured" }, { status: 500 });
  }

  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${env.APP_URL}/app?upgraded=1`);
  params.set("cancel_url", `${env.APP_URL}/app?canceled=1`);
  params.set("client_reference_id", userId);
  params.set("subscription_data[metadata][userId]", userId);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json() as Record<string, unknown>;
  if (!res.ok || typeof data["url"] !== "string") {
    return Response.json({ error: "checkout_failed" }, { status: 400 });
  }

  return Response.json(
    { url: data["url"] },
    { headers: { "set-cookie": cookieHeader(sid) } }
  );
}

export async function handleWebhook(req: Request, env: Env): Promise<Response> {
  // Stripe webhooks verified by signature only — no JWT auth here
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  const ok = await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(raw);

  // Idempotency
  const eventId = event.id;
  const existing = await env.KV.get(`stripe_event:${eventId}`);
  if (existing) return new Response("OK (already processed)");
  await env.KV.put(`stripe_event:${eventId}`, "processed", { expirationTtl: 86400 });

  const emailOpts: { emailBinding?: typeof env.EMAIL; resendApiKey?: string } = {};
  if (env.EMAIL) emailOpts.emailBinding = env.EMAIL;
  if (env.RESEND_API_KEY) emailOpts.resendApiKey = env.RESEND_API_KEY;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const stripeCustomerId = session.customer;
      if (userId && stripeCustomerId) {
        // Set tier to 'pro' AND subscription_status to 'active' on checkout
        await env.DB.prepare(
          "UPDATE users SET tier = 'pro', subscription_status = 'active', stripe_customer_id = ?, subscription_updated_at = ? WHERE id = ?"
        )
          .bind(stripeCustomerId, Date.now(), userId).run();
        if (emailOpts.emailBinding || emailOpts.resendApiKey) {
          const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
            .bind(userId).first<{ email?: string }>();
          if (user?.email) {
            await sendWelcomeEmail(user.email, emailOpts).catch(() => {});
          }
        }
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const billingReason = invoice.billing_reason;
      const stripeCustomerId = invoice.customer;
      const subscriptionId = invoice.subscription;
      const periodEnd = invoice.period_end;

      // Update subscription status to 'active' on successful payment
      if (stripeCustomerId) {
        const updates = [
          "subscription_status = 'active'",
          "tier = 'pro'",
          "subscription_updated_at = ?",
        ];
        const params: any[] = [Date.now()];

        if (subscriptionId) {
          updates.push("stripe_subscription_id = ?");
          params.push(subscriptionId);
        }
        if (periodEnd) {
          updates.push("subscription_current_period_end = ?");
          params.push(periodEnd);
        }

        params.push(stripeCustomerId);
        await env.DB.prepare(
          `UPDATE users SET ${updates.join(", ")} WHERE stripe_customer_id = ?`
        ).bind(...params).run();
      }

      if ((emailOpts.emailBinding || emailOpts.resendApiKey) && billingReason === "subscription_cycle") {
        const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
          .bind(stripeCustomerId).first<{ email?: string }>();
        if (user?.email) {
          await sendPaymentSucceededEmail(user.email, emailOpts).catch(() => {});
        }
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const stripeCustomerId = invoice.customer;
      // Set subscription_status to 'past_due' on payment failure
      if (stripeCustomerId) {
        await env.DB.prepare(
          "UPDATE users SET subscription_status = 'past_due', subscription_updated_at = ? WHERE stripe_customer_id = ?"
        )
          .bind(Date.now(), stripeCustomerId).run();
      }
      if (emailOpts.emailBinding || emailOpts.resendApiKey) {
        const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
          .bind(stripeCustomerId).first<{ email?: string }>();
        if (user?.email) {
          await sendPaymentFailedEmail(user.email, emailOpts).catch(() => {});
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;
      // Set subscription_status to 'canceled' and tier to 'free' on deletion
      await env.DB.prepare(
        "UPDATE users SET tier = 'free', subscription_status = 'canceled', stripe_subscription_id = NULL, subscription_updated_at = ? WHERE stripe_customer_id = ?"
      )
        .bind(Date.now(), stripeCustomerId).run();
      if (emailOpts.emailBinding || emailOpts.resendApiKey) {
        const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
          .bind(stripeCustomerId).first<{ email?: string }>();
        if (user?.email) {
          await sendCancellationEmail(user.email, emailOpts).catch(() => {});
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;
      const status = subscription.status; // 'active', 'past_due', 'canceled', 'incomplete', etc.
      const periodEnd = subscription.current_period_end;

      if (stripeCustomerId && status) {
        const updates = ["subscription_status = ?", "subscription_updated_at = ?"];
        const params: any[] = [status, Date.now()];

        if (periodEnd) {
          updates.push("subscription_current_period_end = ?");
          params.push(periodEnd);
        }

        // If subscription becomes active again, ensure tier is 'pro'
        if (status === "active") {
          updates.push("tier = 'pro'");
        }

        params.push(stripeCustomerId);
        await env.DB.prepare(
          `UPDATE users SET ${updates.join(", ")} WHERE stripe_customer_id = ?`
        ).bind(...params).run();
      }
      break;
    }
  }

  return new Response("OK");
}

export async function handlePortal(req: Request, env: Env): Promise<Response> {
  const authErr = await requireSessionAuth(req, env);
  if (authErr) return authErr;

  const user = await getAuthUser(req, env.DB);

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user.stripe_customer_id) {
    return Response.json({ error: "no_billing_account" }, { status: 404 });
  }

  if (!env.STRIPE_SECRET_KEY || !env.APP_URL) {
    return Response.json({ error: "billing_not_configured" }, { status: 500 });
  }

  const params = new URLSearchParams();
  params.set("customer", user.stripe_customer_id);
  params.set("return_url", `${env.APP_URL}/app`);

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json() as Record<string, unknown>;
  if (!res.ok || typeof data["url"] !== "string") {
    return Response.json({ error: "portal_failed" }, { status: 400 });
  }

  return Response.json({ url: data["url"] });
}

export function registerBillingRoutes(router: any, getEnv: () => Env) {
  router.post("/api/billing/checkout", async (req: Request) => handleCheckout(req, getEnv()));
  router.post("/api/billing/webhook", async (req: Request) => handleWebhook(req, getEnv()));
  router.post("/api/billing/portal", async (req: Request) => handlePortal(req, getEnv()));
}