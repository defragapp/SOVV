export interface Env {
  AGENT_STATE: DurableObjectNamespace<AgentState>;
}

export class AgentState extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      return Response.json({ ok: true, service: "sovereign-control" });
    }
    return new Response("Method Not Allowed", { status: 405 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "sovereign-control" });
    }

    const id = env.AGENT_STATE.idFromName("default");
    const stub = env.AGENT_STATE.get(id);
    return stub.fetch(request);
  }
};
