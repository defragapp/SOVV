import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { handleExplain } from "./explain.js";
import { handleChips } from "./chips.js";
import { handleGetBaseline, handleSaveBaseline } from "./baseline.js";
import { handleCheckout, handleWebhook } from "./billing.js";
import { handleHistory } from "./history.js";
import { getSessionId, cookieHeader } from "./plan.js";
import { getPatterns } from "./db.js";

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
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
        const sid = await getSessionId(req);
        const patterns = await getPatterns(env.DB, sid);
        return Response.json(
          { patterns },
          { headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" } }
        );
      } catch {
        return Response.json({ patterns: [] });
      }
    }

    if (url.pathname === "/api/history" && req.method === "GET") {
      return handleHistory(req, env);
    }

    return new Response("Not found", { status: 404 });
  },
};
