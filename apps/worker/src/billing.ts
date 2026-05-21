import type { Env } from "./types-env.js";
import { getSessionId, setPlan, cookieHeader } from "./plan.js";

// Stripe webhook signature verification in Workers (no Stripe SDK):
// Stripe signs: "t=timestamp,v1=signature"
// Signed payload: `${timestamp}.${rawBody}`
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
  const sid = await getSessionId(req);

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.APP_URL) {
    return Response.json({ error: "billing_not_configured" }, { status: 500 });
  }

  // Create Checkout Session (Stripe API) using fetch + form encoding.
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${env.APP_URL}/app?upgraded=1`);
  params.set("cancel_url", `${env.APP_URL}/app?canceled=1`);

  // Attach sid so webhook can map to user/session (v1 approach)
  params.set("client_reference_id", sid);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const data = await res.json();
  if (!res.ok || !data?.url) {
    return Response.json({ error: "checkout_failed", details: data }, { status: 400 });
  }

  return Response.json(
    { url: data.url },
    { headers: { "set-cookie": cookieHeader(sid) } }
  );
}

export async function handleWebhook(req: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  const ok = await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(raw);

  // v1: when subscription becomes active, set plan to pro for client_reference_id (sid)
  // Handle checkout.session.completed
  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sid = session?.client_reference_id;
    if (sid) await setPlan(env, sid, "pro");
  }

  // Handle subscription deleted (optional)
  if (event?.type === "customer.subscription.deleted") {
    // If you store mapping subscription->sid later, downgrade here.
  }

  return Response.json({ received: true });
}
