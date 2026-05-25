interface Env {
  CONFLICT_SESSION: DurableObjectNamespace;
  AI_SERVICE: Fetcher;
  BASELINE_KV?: KVNamespace;
}

export { ConflictSessionDO } from "./durable-objects/ConflictSessionDO";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, worker: "worker-session" });
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
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
