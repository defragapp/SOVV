import type { Env } from "./types-env";
import { getSessionId, cookieHeader } from "./plan";
import type { Interaction } from "@sovereign/core";
import { getAuthUser, verifyAccessJWT } from "./auth";
import { mapInteraction, type InteractionRow } from "./db";
import { requireActiveSubscription } from "./billing";

async function requireSessionAuth(req: Request, env: Env): Promise<Response | null> {
  const user = await getAuthUser(req, env.DB);
  if (user) return null;
  return verifyAccessJWT(req, env);
}

export async function handleHistory(req: Request, env: Env) {
  const authResponse = await requireSessionAuth(req, env);
  if (authResponse) {
    return authResponse;
  }

  const user = await getAuthUser(req, env.DB);

  // Subscription gate for space route
  const subGate = await requireActiveSubscription(user, req);
  if (subGate) return subGate;

  const sid = await getSessionId(req);
  if (!sid) {
    return Response.json({ interactions: [] });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM interactions WHERE session_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(sid, limit, offset)
    .all<InteractionRow>();

    const interactions = (results ?? []).map(mapInteraction);

    return Response.json({ interactions }, {
      headers: { "set-cookie": cookieHeader(sid) }
    });
  } catch (e) {
    console.error("Failed to fetch history", String(e));
    return Response.json({ interactions: [] });
  }
}

export async function handleSaveToLibrary(req: Request, env: Env) {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Subscription gate for space route
  const subGate = await requireActiveSubscription(user, req);
  if (subGate) return subGate;

  try {
    const body = await req.json().catch(() => ({})) as any;
    const { title, content, workspace_source } = body;

    if (typeof title !== "string" || typeof content !== "string" || typeof workspace_source !== "string") {
       return new Response("Invalid or missing required fields", { status: 400 });
    }
    if (workspace_source !== "DEFRAG" && workspace_source !== "COVENANT") {
       return new Response("Invalid workspace source", { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO library (id, user_id, title, content, workspace_source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, user.id, title, content, workspace_source, now, now)
    .run();

    return Response.json({ success: true, id });
  } catch (e) {
    console.error("Failed to save to library", String(e));
    return new Response("Internal Server Error", { status: 500 });
  }
}

export function registerHistoryRoute(router: any, getEnv: () => Env) {
  router.get("/api/history", async (req: Request) => {
    const env = getEnv();
    return handleHistory(req, env);
  });

  router.post("/api/history", async (req: Request) => {
    const env = getEnv();
    return handleSaveToLibrary(req, env);
  });
}
