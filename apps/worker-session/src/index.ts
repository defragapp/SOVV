interface Env {
  CONFLICT_SESSION: DurableObjectNamespace;
  AI_SERVICE: Fetcher;
  BASELINE_KV?: KVNamespace;
}

export { ConflictSessionDO } from "./durable-objects/ConflictSessionDO";

let envValidated = false;
const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_RESPONSE_BYTES = 64 * 1024;

function validateEnv(env: Env): void {
  if (envValidated) {
    return;
  }
  if (!env.CONFLICT_SESSION) {
    throw new Error("Missing required binding: CONFLICT_SESSION");
  }
  if (!env.AI_SERVICE) {
    throw new Error("Missing required binding: AI_SERVICE");
  }
  envValidated = true;
}

async function enforceRequestSize(request: Request): Promise<Response | null> {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) {
    return null;
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isNaN(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }
  const bytes = (await request.clone().arrayBuffer()).byteLength;
  if (bytes > MAX_REQUEST_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }
  return null;
}

async function enforceResponseSize(response: Response): Promise<Response> {
  if (response.status === 101 || response.body === null) {
    return response;
  }
  const bytes = (await response.clone().arrayBuffer()).byteLength;
  if (bytes <= MAX_RESPONSE_BYTES) {
    return response;
  }
  console.error(
    JSON.stringify({
      type: "system_error",
      reason: "response_too_large",
      bytes,
      maxBytes: MAX_RESPONSE_BYTES,
      timestamp: Date.now(),
    })
  );
  return Response.json({ error: "response_too_large" }, { status: 502 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    validateEnv(env);
    const url = new URL(request.url);
    const oversizedRequest = await enforceRequestSize(request);
    if (oversizedRequest) {
      return oversizedRequest;
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return enforceResponseSize(Response.json({ ok: true, worker: "worker-session" }));
    }

    // Route: /ws/:sessionId?userId=...
    if (url.pathname.startsWith("/ws")) {
      const sessionId = url.pathname.split("/ws/")[1]?.split("/")[0];
      if (!sessionId) {
        return new Response("Missing sessionId in path", { status: 400 });
      }

      const id = env.CONFLICT_SESSION.idFromName(sessionId);
      const stub = env.CONFLICT_SESSION.get(id);

      // Forward as-is; ConflictSessionDO accepts /ws/:sessionId
      const response = await stub.fetch(request);
      return enforceResponseSize(response);
    }

    return enforceResponseSize(new Response("Not found", { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
