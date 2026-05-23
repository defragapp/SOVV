import { handleExplain } from "./explain.js";
import { extractPatterns, handleGetPatterns, handlePatternVerify } from "./patterns.js";
import { handleChips } from "./chips.js";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.js";
import { handleHistory } from "./history.js";
import { getSessionId, cookieHeader, getPlan } from "./plan.js";
import { handlePatternVerify } from "./patterns.js";
import { getPatterns } from "./db.js";
import { extractPatterns } from "./patterns.js";
const corsHeaders = {
    "Access-Control-Allow-Origin": "https://defrag.app",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
};
export default {
    async fetch(req, env, ctx) {
        if (req.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }
        const url = new URL(req.url);
        if (url.pathname === "/health") {
            return Response.json({ status: "ok", service: "sovereign-api" });
        }
        // One-time utility to initialize Stripe Product/Price
        if (url.pathname === "/api/billing/init-stripe" && req.method === "POST") {
            if (!env.STRIPE_SECRET_KEY) {
                return Response.json({ error: "STRIPE_SECRET_KEY not set" }, { status: 500 });
            }
            const productRes = await fetch('https://api.stripe.com/v1/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ name: 'Sovereign OS Pro' }).toString(),
            });
            const product = await productRes.json();
            if (product.error)
                return Response.json({ error: product.error }, { status: 400 });
            const priceRes = await fetch('https://api.stripe.com/v1/prices', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    product: product.id,
                    currency: 'usd',
                    unit_amount: '900',
                    'recurring[interval]': 'month',
                }).toString(),
            });
            const price = await priceRes.json();
            return Response.json({
                message: "Stripe initialized. Save these IDs to your environment.",
                productId: product.id,
                priceId: price.id
            });
        }
        let response;
        if (url.pathname === "/api/explain" && req.method === "POST") {
            response = await handleExplain(req, env, ctx);
        }
        else if (url.pathname === "/api/chips" && req.method === "GET") {
            response = await handleChips(req, env);
        }
        else if (url.pathname === "/api/baseline" && req.method === "GET") {
            response = await handleGetBaseline(req, env);
        }
        else if (url.pathname === "/api/baseline" && req.method === "POST") {
            response = await handleSaveBaseline(req, env);
        }
        else if (url.pathname === "/api/billing/checkout" && req.method === "POST") {
            response = await handleCheckout(req, env);
        }
        else if (url.pathname === "/api/billing/webhook" && req.method === "POST") {
            response = await handleWebhook(req, env);
        }
        else if (url.pathname === "/api/patterns/verify" && req.method === "POST") {
            response = await handlePatternVerify(req, env);
        }
        else if (url.pathname === "/api/patterns" && req.method === "GET") {
            // ─── Memory API endpoints ───
            try {
                const sid = await getSessionId(req);
                const patterns = await getPatterns(env.DB, sid);
                response = Response.json({ patterns }, { headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" } });
            }
            catch {
                response = Response.json({ patterns: [] });
            }
        }
        else if (url.pathname === "/api/history" && req.method === "GET") {
            response = await handleHistory(req, env);
        }
        else {
            response = new Response("Not found", { status: 404 });
        }
        return withCors(response);
    },
    // ─── Background AI Task Queue Consumer ───
    async queue(batch, env) {
        for (const message of batch.messages) {
            try {
                const { sessionId, interactionId } = message.body;
                await extractPatterns(env, sessionId, interactionId);
                message.ack();
            }
            catch (err) {
                console.error("Queue processing failed for pattern extraction:", err);
                message.retry(); // Requeue the AI task if it failed
            }
        }
    }
};
function withCors(response) {
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
    return newResponse;
}
async function handleFetch(req, env, ctx) {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }
    try {
        const url = new URL(req.url);
        const pathname = url.pathname;
        let response;
        if (pathname === "/health") {
            response = Response.json({ status: "ok", service: "sovereign-api" });
        }
        else if (pathname === "/api/explain" && req.method === "POST") {
            response = await handleExplain(req, env, ctx);
        }
        else if (pathname === "/api/chips" && req.method === "GET") {
            response = await handleChips(req, env);
        }
        else if (pathname === "/api/baseline" && req.method === "GET") {
            response = await handleGetBaseline(req, env);
        }
        else if (pathname === "/api/baseline" && req.method === "POST") {
            response = await handleSaveBaseline(req, env);
        }
        else if (pathname === "/api/patterns/verify" && req.method === "POST") {
            response = await handlePatternVerify(req, env);
        }
        else if (pathname === "/api/patterns" && req.method === "GET") {
            response = await handleGetPatterns(req, env);
        }
        else if (pathname === "/api/history" && req.method === "GET") {
            response = await handleHistory(req, env);
        }
        else if (pathname === "/api/billing/checkout" && req.method === "POST") {
            response = await handleCheckout(req, env);
        }
        else if (pathname === "/api/billing/webhook" && req.method === "POST") {
            response = await handleWebhook(req, env);
        }
        else {
            response = new Response("Not found", { status: 404 });
        }
        return withCors(response);
    }
    catch (err) {
        console.error("Unhandled error:", err);
        return withCors(Response.json({ error: "Internal Server Error", message: err instanceof Error ? err.message : "Unknown error" }, { status: 500 }));
    }
}
async function handleQueue(batch, env, ctx) {
    for (const message of batch.messages) {
        try {
            const { sessionId, interactionId } = message.body;
            await extractPatterns(env, sessionId, interactionId);
            message.ack();
        }
        catch (err) {
            console.error("Queue processing failed:", err);
            message.retry();
        }
    }
}
addEventListener("fetch", (event) => {
    // In Service Worker syntax, env is global, and ctx methods are on the event.
    event.respondWith(handleFetch(event.request, globalThis.env, event));
});
addEventListener("queue", (batch, env, ctx) => {
    ctx.waitUntil(handleQueue(batch, env, ctx));
});
//# sourceMappingURL=index.js.map