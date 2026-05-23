import { getSessionId, setPlan, cookieHeader } from "./plan.js";
import { verifyAccessJWT } from "./auth.js";
// Stripe webhook signature verification in Workers (no Stripe SDK):
// Stripe signs: "t=timestamp,v1=signature"
// Signed payload: `${timestamp}.${rawBody}`
// HMAC SHA256 with STRIPE_WEBHOOK_SECRET
async function verifyStripeSignature(rawBody, sigHeader, secret) {
    const parts = sigHeader.split(",").reduce((acc, p) => {
        const [k, v] = p.split("=");
        if (k && v)
            acc[k.trim()] = v.trim();
        return acc;
    }, {});
    const t = parts["t"];
    const v1 = parts["v1"];
    if (!t || !v1)
        return false;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signed = `${t}.${rawBody}`;
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
    const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
    // constant-time compare
    if (hex.length !== v1.length)
        return false;
    let out = 0;
    for (let i = 0; i < hex.length; i++)
        out |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
    return out === 0;
}
export async function handleCheckout(req, env) {
    const user = await verifyAccessJWT(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
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
    // Add metadata with sid for cancellation handling.
    // Note: To also handle email, you would need to update the subscription metadata
    // in the 'checkout.session.completed' webhook with the customer's email.
    params.set("subscription_data[metadata][sid]", sid);
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
    return Response.json({ url: data.url }, { headers: { "set-cookie": cookieHeader(sid) } });
}
export async function handleWebhook(req, env) {
    // Stripe webhooks are verified by signature, not JWT.
    // Do NOT add verifyAccessJWT here.
    if (!env.STRIPE_WEBHOOK_SECRET) {
        return new Response("Missing webhook secret", { status: 500 });
    }
    const sig = req.headers.get("stripe-signature") || "";
    const raw = await req.text();
    const ok = await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!ok)
        return new Response("Invalid signature", { status: 400 });
    const event = JSON.parse(raw);
    // Idempotency check — prevent duplicate processing
    const eventId = event.id;
    if (eventId) {
        const seen = await env.KV.get(`webhook:${eventId}`);
        if (seen)
            return Response.json({ received: true, dedup: true });
        await env.KV.put(`webhook:${eventId}`, "1", { expirationTtl: 86400 });
    }
    // v1: when subscription becomes active, set plan to pro for client_reference_id (sid)
    // Handle checkout.session.completed
    if (event?.type === "checkout.session.completed") {
        const session = event.data?.object;
        // Ensure payment was successful (handles delayed payments & free trials)
        if (session?.payment_status === "paid" || session?.payment_status === "no_payment_required") {
            const sid = session?.client_reference_id;
            if (sid)
                await setPlan(env, sid, "pro");
        }
    }
    // Handle subscription deleted (optional)
    if (event?.type === "customer.subscription.deleted") {
        const subscription = event.data?.object;
        const email = subscription?.metadata?.email;
        const sid = subscription?.metadata?.sid;
        if (email)
            await removeUserFromPaidGroup(email, env);
        if (sid)
            await setPlan(env, sid, "free");
    }
    return Response.json({ received: true });
}
async function updateAccessGroup(email, action, env, retries = 1) {
    const { CF_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, PAID_USERS_GROUP_ID } = env;
    if (!CF_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !PAID_USERS_GROUP_ID) {
        console.error("Missing CF Access config for group update");
        return;
    }
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/access/groups/${PAID_USERS_GROUP_ID}`;
    const headers = {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
    };
    try {
        // Get current group
        const getResp = await fetch(apiUrl, { headers });
        if (!getResp.ok) {
            throw new Error(`GET group failed: ${await getResp.text()}`);
        }
        const groupData = await getResp.json();
        const existingEmails = (groupData.result.include || [])
            .filter((r) => !!r.email?.email)
            .map((r) => r.email.email);
        const userExists = existingEmails.includes(email);
        let updatedInclude;
        if (action === "add") {
            if (userExists)
                return; // User already in group, do nothing.
            updatedInclude = [...(groupData.result.include || []), { email: { email } }];
        }
        else { // remove
            if (!userExists)
                return; // User not in group, do nothing.
            updatedInclude = (groupData.result.include || []).filter((r) => r.email?.email !== email);
        }
        const putResp = await fetch(apiUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({ ...groupData.result, include: updatedInclude }),
        });
        if (!putResp.ok) {
            if (putResp.status === 409 && retries > 0) {
                // Race condition — retry with fresh group data
                return updateAccessGroup(email, action, env, retries - 1);
            }
            throw new Error(`PUT group failed: ${await putResp.text()}`);
        }
        console.log(`${action === "add" ? "Added" : "Removed"} ${email} ${action === "add" ? "to" : "from"} Paid Users group`);
    }
    catch (err) {
        console.error(`Failed to ${action} user ${email} in Access group:`, err instanceof Error ? err.message : String(err));
    }
}
async function addUserToPaidGroup(email, env) {
    await updateAccessGroup(email, "add", env);
}
async function removeUserFromPaidGroup(email, env) {
    await updateAccessGroup(email, "remove", env);
}
//# sourceMappingURL=billing.js.map