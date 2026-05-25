// Updating routes...// Refactored to use itty-router
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
