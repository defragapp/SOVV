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

  try {
    const body = await req.json().catch(() => ({})) as any;
    const { title, content, payload, workspace_source } = body;

    if (typeof title !== "string" || typeof workspace_source !== "string") {
       return new Response("Invalid or missing required fields", { status: 400 });
    }
    if (!["DEFRAG", "COVENANT", "ALIGNMENT"].includes(workspace_source)) {
       return new Response("Invalid workspace source", { status: 400 });
    }

    // Covenant and Alignment saves require Pro subscription
    // Defrag saves are available on free tier
    if (workspace_source !== "DEFRAG") {
      const subGate = await requireActiveSubscription(user, req);
      if (subGate) return subGate;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO library (id, user_id, title, payload, workspace_source, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, user.id, title, payload ? JSON.stringify(payload) : null, workspace_source, now)
    .run();

    return Response.json({ success: true, id });
  } catch (e) {
    console.error("Failed to save to library", String(e));
    return new Response("Internal Server Error", { status: 500 });
  }
}


export async function handleGetLibrary(req: Request, env: Env) {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const workspaceSource = url.searchParams.get("workspace_source");

  try {
    let query: string;
    let bindings: unknown[];

    if (workspaceSource && ["DEFRAG", "COVENANT", "ALIGNMENT"].includes(workspaceSource)) {
      // Filter by space — uses idx_library_user_id_source index
      query = "SELECT * FROM library WHERE user_id = ? AND workspace_source = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
      bindings = [user.id, workspaceSource, limit, offset];
    } else {
      query = "SELECT * FROM library WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
      bindings = [user.id, limit, offset];
    }

    const { results } = await env.DB.prepare(query).bind(...bindings).all();

    return Response.json({ items: results || [] });
  } catch (e) {
    console.error("Failed to fetch library", String(e));
    return Response.json({ items: [] });
  }
}


export async function handleGetLibraryItem(req: Request, env: Env) {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1]; // /api/library/:id

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  try {
    const item = await env.DB.prepare(
      "SELECT * FROM library WHERE id = ? AND user_id = ?"
    )
    .bind(id, user.id)
    .first();

    if (!item) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json(item);
  } catch (e) {
    console.error("Failed to fetch library item", String(e));
    return new Response("Internal error", { status: 500 });
  }
}

export async function handleDeleteLibraryItem(req: Request, env: Env) {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  try {
    // Only delete if the item belongs to this user
    const result = await env.DB.prepare(
      "DELETE FROM library WHERE id = ? AND user_id = ?"
    ).bind(id, user.id).run();

    if (result.meta?.changes === 0) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("Failed to delete library item", String(e));
    return new Response("Internal Server Error", { status: 500 });
  }
}

export function registerHistoryRoute(router: any, getEnv: () => Env) {
  router.get("/api/history", async (req: Request) => {
    const env = getEnv();
    return handleHistory(req, env);
  });

  router.get("/api/library", async (req: Request) => {
    const env = getEnv();
    return handleGetLibrary(req, env);
  });

  router.get("/api/library/:id", async (req: Request) => {
    const env = getEnv();
    return handleGetLibraryItem(req, env);
  });

  router.delete("/api/library/:id", async (req: Request) => {
    const env = getEnv();
    return handleDeleteLibraryItem(req, env);
  });

  router.post("/api/history", async (req: Request) => {
    const env = getEnv();
    return handleSaveToLibrary(req, env);
  });
}
