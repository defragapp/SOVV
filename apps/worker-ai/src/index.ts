import { handleEmotionalDrivers } from "./emotional-drivers";
import { generateDefragWithRetry } from "./ai-generator";
import { generateDefragPrompt } from "@sovereign/prompts";
import {
  ServiceUnavailableError,
  logSystemError,
  maxRequestBytes,
  maxResponseBytes,
} from "./runtime-resilience";

export interface Env {
  AI: Ai;
}

let envValidated = false;

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

function validateEnv(env: Env): void {
  if (envValidated) return;
  if (!env.AI) {
    throw new Error("Missing required binding: AI");
  }
  envValidated = true;
}

async function enforceRequestSize(request: Request): Promise<Response | null> {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) {
    return null;
  }

  const headerValue = request.headers.get("content-length");
  const limit = maxRequestBytes();
  if (headerValue) {
    const contentLength = Number(headerValue);
    if (!Number.isNaN(contentLength) && contentLength > limit) {
      return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
  }

  const requestBody = request.clone().body;
  if (requestBody) {
    const reader = requestBody.getReader();
    let bytesRead = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesRead += value.byteLength;
        if (bytesRead > limit) {
          await reader.cancel();
          return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  return null;
}

async function enforceResponseSize(response: Response): Promise<Response> {
  if (response.status === 101 || response.body === null) {
    return response;
  }

  const bytes = (await response.clone().arrayBuffer()).byteLength;
  if (bytes <= maxResponseBytes()) {
    return response;
  }
  logSystemError("response_too_large", { bytes, maxBytes: maxResponseBytes() });
  return Response.json({ ok: false, error: "response_too_large" }, { status: 502 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    validateEnv(env);

    const url = new URL(request.url);
    const oversizedRequest = await enforceRequestSize(request);
    if (oversizedRequest) {
      return withHeaders(oversizedRequest);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    if (url.pathname === "/emotional-drivers" && request.method === "POST") {
      try {
        const response = await handleEmotionalDrivers(request, env);
        return withHeaders(await enforceResponseSize(response));
      } catch (error) {
        if (error instanceof ServiceUnavailableError) {
          return withHeaders(Response.json({ success: false, error: "service_unavailable" }, { status: 503 }));
        }
        if (error instanceof Error && error.message === "timeout") {
          logSystemError("timeout");
          return withHeaders(Response.json({ success: false, error: "service_unavailable" }, { status: 503 }));
        }
        throw error;
      }
    }

    if (url.pathname === "/defrag" && request.method === "POST") {
      try {
        const body = await request.json() as { baseline: string, context?: string };
        const prompt = generateDefragPrompt(body.baseline, body.context);

        const result = await generateDefragWithRetry(env, prompt.system, prompt.user);

        return withHeaders(await enforceResponseSize(Response.json({ ok: true, result })));
      } catch (e: any) {
        if (e instanceof ServiceUnavailableError || e?.message === "timeout") {
          if (e?.message === "timeout") {
            logSystemError("timeout");
          }
          return withHeaders(Response.json({ success: false, error: "service_unavailable" }, { status: 503 }));
        }
        return withHeaders(Response.json({ ok: false, error: e?.message || "ai_error" }, { status: 500 }));
      }
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return withHeaders(
        Response.json({ ok: true, worker: "worker-ai", hardened: true })
      );
    }

    return withHeaders(await enforceResponseSize(new Response("Not found", { status: 404 })));
  },
} satisfies ExportedHandler<Env>;
