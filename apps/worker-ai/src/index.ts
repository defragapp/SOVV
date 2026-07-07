import { handleEmotionalDrivers } from "./emotional-drivers";
import { generateDefragWithRetry } from "./ai-generator";
import { generateDefragPrompt } from "@sovereign/prompts";

export interface Env {
  AI: Ai;
}

// ── Allowed origins ──────────────────────────────────────────────────────────
// This worker is called via Cloudflare service binding from sovereign-os-api.
// Direct browser access is not intended. Lock CORS to known app origins only.
const ALLOWED_ORIGINS = new Set([
  "https://defrag.app",
  "https://www.defrag.app",
  "https://app.defrag.app",
  "https://sovereign.defrag.app",
  "https://api.defrag.app",
]);

function getCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin") || "";
  return ALLOWED_ORIGINS.has(origin) ? origin : null;
}

function buildResponseHeaders(request: Request): Record<string, string> {
  const allowedOrigin = getCorsOrigin(request);
  const corsHeaders: Record<string, string> = allowedOrigin
    ? {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
      }
    : {};

  return {
    ...corsHeaders,
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy":
      "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';",
  };
}

function withHeaders(response: Response, request: Request): Response {
  const headers = buildResponseHeaders(request);
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) {
    newResponse.headers.set(key, value);
  }
  return newResponse;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildResponseHeaders(request),
      });
    }

    if (url.pathname === "/emotional-drivers" && request.method === "POST") {
      const response = await handleEmotionalDrivers(request, env);
      return withHeaders(response, request);
    }

    if (url.pathname === "/defrag" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          baseline: string;
          context?: string;
        };
        const prompt = generateDefragPrompt(body.baseline, body.context);
        const result = await generateDefragWithRetry(
          env.AI,
          prompt.system,
          prompt.user
        );
        return withHeaders(Response.json({ ok: true, result }), request);
      } catch (e: any) {
        return withHeaders(
          Response.json({ ok: false, error: e.message }, { status: 500 }),
          request
        );
      }
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return withHeaders(
        Response.json({ ok: true, worker: "worker-ai", hardened: true }),
        request
      );
    }

    return withHeaders(new Response("Not found", { status: 404 }), request);
  },
} satisfies ExportedHandler<Env>;