// Refactored to use itty-router
import type { ExecutionContext, MessageBatch } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { Router } from "itty-router";
import { registerAuthRoutes } from "./auth"
import { registerExplainRoute } from "./explain-extended"
import { extractPatterns, handleGetPatterns, handlePatternVerify } from "./patterns.ts";
import { handleChips } from "./chips.ts";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.ts";
import { handleHistory } from "./history.ts";
import { handleCheckout, handleWebhook } from "./billing.ts";

interface StripeResponse {
  id: string;
  error?: string;
}

function withCors(response: Response, req?: Request): Response {
  const newResponse = new Response(response.body, response);
  const origin = req?.headers.get("Origin");
  const allowedOrigin = origin && (origin.includes("localhost") || origin.endsWith(".defrag.app")) || origin === "https://defrag.app"
    ? origin
    : "https://defrag.app";

  newResponse.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
  newResponse.headers.set("Access-Control-Allow-Credentials", "true");
  return newResponse;
}

// Initialize itty-router
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
      'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ name: 'Sovereign OS Pro' }).toString(),
  });
