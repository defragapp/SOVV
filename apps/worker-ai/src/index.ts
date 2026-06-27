// @ts-nocheck
import { handleEmotionalDrivers } from "./emotional-drivers";

export interface Env {
  AI: Ai;
}

const responseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; connect-src 'self' https://*.workers.dev wss://*.workers.dev; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';",
};

function withHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  Object.entries(responseHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    if (url.pathname === "/emotional-drivers" && request.method === "POST") {
      const response = await handleEmotionalDrivers(request, env);
      return withHeaders(response);
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return withHeaders(
        Response.json({ ok: true, worker: "worker-ai", hardened: true })
      );
    }

    return withHeaders(new Response("Not found", { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
