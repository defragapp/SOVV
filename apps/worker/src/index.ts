import type { ExecutionContext, MessageBatch } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { Router } from "itty-router";
import { handleExplain } from "./explain.ts";
import { extractPatterns, handleGetPatterns, handlePatternVerify } from "./patterns.ts";
import { handleChips } from "./chips.ts";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.ts";
import { handleHistory } from "./history.ts";
import { handleCheckout, handleWebhook } from "./billing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://defrag.app",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

function withCors(response: Response): Response {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
  return newResponse;
}

const router = Router();

// Handle CORS preflight requests
router.options("*", () => new Response(null, { status: 204 }));

router.get("/health", () => Response.json({ status: "ok", service: "sovereign-api" }));

router.post("/api/billing/init-stripe", async (req: Request, env: Env) => {
  if (env.DEV_MODE !== "true") {
    return new Response("Not found", { status: 404 });
  }
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
});

router.post("/api/explain", handleExplain);
router.get("/api/chips", handleChips);
router.get("/api/baseline", handleGetBaseline);
router.post("/api/baseline", handleSaveBaseline);
router.post("/api/patterns/verify", handlePatternVerify);
router.get("/api/patterns", handleGetPatterns);
router.get("/api/history", handleHistory);
router.post("/api/billing/checkout", handleCheckout);
router.post("/api/billing/webhook", handleWebhook);

// Fallback for all other routes
router.all("*", () => new Response("Not found", { status: 404 }));

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router
      .handle(req, env, ctx)
      .catch(err => {
        console.error("Unhandled error:", err);
        return Response.json(
          { error: "Internal Server Error", message: err instanceof Error ? err.message : "Unknown error" },
          { status: 500 }
        );
      })
      .then(res => withCors(res));
  },

  async queue(batch: MessageBatch<{ sessionId: string; interactionId: string }>, env: Env, ctx: ExecutionContext): Promise<void> {
    for (const message of batch.messages) {
      try {
        const { sessionId, interactionId } = message.body;
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        console.error("Queue processing failed:", err);
        message.retry();
      }
    }
  }
};
