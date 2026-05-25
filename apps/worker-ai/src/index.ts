import { handleEmotionalDrivers } from "./emotional-drivers";

export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/emotional-drivers" && request.method === "POST") {
      return handleEmotionalDrivers(request);
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ ok: true, worker: "worker-ai" });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
