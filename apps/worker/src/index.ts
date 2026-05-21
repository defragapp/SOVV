import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { handleExplain } from "./explain.js";
import { handleChips } from "./chips.js";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.js";
import { handleCheckout, handleWebhook } from "./billing.js";

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "sovereign-api" });
    }
    if (url.pathname === "/api/explain" && req.method === "POST") {
      return handleExplain(req, env, ctx);
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

    // ─── Memory API endpoints ───
    if (url.pathname === "/api/patterns" && req.method === "GET") {
      try {
        const { getSessionId } = await import("./plan.js");
        const { getPatterns } = await import("./db.js");
        const sid = await getSessionId(req);
        const patterns = await getPatterns(env.DB, sid);
        return Response.json(
          { patterns },
          { headers: { "set-cookie": `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`, "cache-control": "no-store" } }
        );
      } catch {
        return Response.json({ patterns: [] });
      }
    }

    if (url.pathname === "/api/history" && req.method === "GET") {
      try {
        const { getSessionId } = await import("./plan.js");
        const { getRecentInteractions } = await import("./db.js");
        const sid = await getSessionId(req);
        const interactions = await getRecentInteractions(env.DB, sid, 50);
        return Response.json(
          { interactions },
          { headers: { "set-cookie": `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`, "cache-control": "no-store" } }
        );
      } catch {
        return Response.json({ interactions: [] });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
