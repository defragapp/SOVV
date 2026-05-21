import type { Env } from "./types-env.js";
import { handleExplain } from "./explain.js";
import { handleChips } from "./chips.js";
import { handleCheckout, handleWebhook } from "./billing.js";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.js";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "sovereign-api" });
    }

    if (url.pathname === "/api/explain" && req.method === "POST") {
      return handleExplain(req, env);
    }

    if (url.pathname === "/api/chips" && req.method === "GET") {
      return handleChips(req, env);
    }

    if (url.pathname === "/api/baseline" && req.method === "GET") {
      return handleGetBaseline(req, env);
    }

    if (url.pathname === "/api/baseline" && req.method === "POST") {
      return handleSaveBaseline(req, env);
    }

    if (url.pathname === "/api/billing/checkout" && req.method === "POST") {
      return handleCheckout(req, env);
    }

    if (url.pathname === "/api/billing/webhook" && req.method === "POST") {
      return handleWebhook(req, env);
    }

    return new Response("Not found", { status: 404 });
  }
};
