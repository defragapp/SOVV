import type { Env } from "./types-env.js";
import { getSessionId, cookieHeader } from "./plan.js";
import { verifyAccessJWT } from "./auth.js";
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

export async function handleCheckout(req: Request, env: Env): Promise<Response> {
  const authErr = await verifyAccessJWT(req, env);
  if (authErr) return authErr;

  // Get user from session for client_reference_id
  const { getAuthUser } = await import("./auth.js");
  const user = await getAuthUser(req, env.DB);
  const userId = user?.id ?? "unknown";

  const sid = await getSessionId(req);

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.APP_URL) {
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

  // Idempotency — prevent duplicate processing
  const eventId = event.id;
  const existing = await env.KV.get(`stripe_event:${eventId}`);
  if (existing) return new Response("OK (already processed)");
  await env.KV.put(`stripe_event:${eventId}`, "processed", { expirationTtl: 86400 });

  

      if (env.RESEND_API_KEY) {
        const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
          .bind(userId).first<{ email: string }>();
        if (user?.email) {
          await sendWelcomeEmail(env.RESEND_API_KEY, user.email).catch(() => {});
        }
      }
    }
  }

  

      // Only send renewal email — welcome covers first payment
      if (env.RESEND_API_KEY && billingReason === "subscription_cycle") {
        const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
          .bind(stripeCustomerId).first<{ email: string }>();
        if (user?.email) {
          await sendPaymentSucceededEmail(env.RESEND_API_KEY, user.email).catch(() => {});
        }
      }
    }
  }

  

      if (env.RESEND_API_KEY) {
        const user = await env.DB.prepare("SELECT email FROM users WHERE stripe_customer_id = ?")
          .bind(stripeCustomerId).first<{ email: string }>();
        if (user?.email) {
          await sendPaymentFailedEmail(env.RESEND_API_KEY, user.email).catch(() => {});
        }
      }
    }
  }

  

  

    if (env.RESEND_API_KEY) {
      const lookupVal = userId ?? stripeCustomerId;
      const col = userId ? "id" : "stripe_customer_id";
      const user = await env.DB.prepare(`SELECT email FROM users WHERE ${col} = ?`)
        .bind(lookupVal).first<{ email: string }>();
      if (user?.email) {
        await sendCancellationEmail(env.RESEND_API_KEY, user.email).catch(() => {});
      }
    }
  }

  return new Response("OK");
}

export function registerBillingRoutes(router: any, getEnv: () => Env) {
  router.post("/api/billing/checkout", async (req: Request) => handleCheckout(req, getEnv()));
  router.post("/api/billing/webhook", async (req: Request) => handleWebhook(req, getEnv()));
}