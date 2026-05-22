import type { ExecutionContext, MessageBatch } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { handleExplain } from "./explain.js";
import { handleChips } from "./chips.js";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.js";
import { handleCheckout, handleWebhook } from "./billing.js";
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
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
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
      const product = await productRes.json() as any;
      if (product.error) return Response.json({ error: product.error }, { status: 400 });

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
      const price = await priceRes.json() as any;

      return Response.json({
        message: "Stripe initialized. Save these IDs to your environment.",
        productId: product.id,
        priceId: price.id
      });
    }

    let response: Response;
    if (url.pathname === "/api/explain" && req.method === "POST") {
      response = await handleExplain(req, env, ctx);
    } else if (url.pathname === "/api/chips" && req.method === "GET") {
      response = await handleChips(req, env);
    } else if (url.pathname === "/api/baseline" && req.method === "GET") {
      response = await handleGetBaseline(req, env);
    } else if (url.pathname === "/api/baseline" && req.method === "POST") {
      response = await handleSaveBaseline(req, env);
    } else if (url.pathname === "/api/billing/checkout" && req.method === "POST") {
      response = await handleCheckout(req, env);
    } else if (url.pathname === "/api/billing/webhook" && req.method === "POST") {
      response = await handleWebhook(req, env);
    } else if (url.pathname === "/api/patterns/verify" && req.method === "POST") {
      response = await handlePatternVerify(req, env);
    } else if (url.pathname === "/api/patterns" && req.method === "GET") {
      // ─── Memory API endpoints ───
      try {
        const sid = await getSessionId(req);
        const patterns = await getPatterns(env.DB, sid);
        response = Response.json(
          { patterns },
          { headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" } }
        );
      } catch {
        response = Response.json({ patterns: [] });
      }
    } else if (url.pathname === "/api/history" && req.method === "GET") {
      response = await handleHistory(req, env);
    } else {
      response = new Response("Not found", { status: 404 });
    }

    return withCors(response);
  },

  // ─── Background AI Task Queue Consumer ───
  async queue(batch: MessageBatch<{ sessionId: string; interactionId: string }>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const { sessionId, interactionId } = message.body;
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        console.error("Queue processing failed for pattern extraction:", err);
        message.retry(); // Requeue the AI task if it failed
      }
    }
  }
};

function withCors(response: Response): Response {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
  return newResponse;
}
