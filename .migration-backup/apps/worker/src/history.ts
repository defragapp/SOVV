import type { Env } from "./types-env";
import { getCorsHeaders } from "./cors.js";
import { getSessionId, cookieHeader } from "./plan";
import type { Interaction } from "@sovereign/core";
import { getAuthUser, verifyAccessJWT } from "./auth";
import { mapInteraction, type InteractionRow } from "./db";
import { requireActiveSubscription } from "./billing";
import { logSafetyEvent } from "./safety.js";

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
    logSafetyEvent({
      level: "error",
      event: "history_fetch_failed",
      request: req,
      error_type: "system",
      error: e,
    });
    return Response.json({ interactions: [] });
  }
}

export async function handleSaveToLibrary(req: Request, env: Env) {
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json().catch((error) => {
      logSafetyEvent({
        level: "warn",
        event: "library_save_invalid_json",
        request: req,
        error_type: "validation",
        error,
      });
      return {};
    }) as any;
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
    logSafetyEvent({
      level: "error",
      event: "library_save_failed",
      request: req,
      error_type: "system",
      error: e,
    });
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
  const searchQuery = url.searchParams.get("q")?.trim();

  try {
    let query: string;
    let bindings: (string | number)[];

    if (workspaceSource && ["DEFRAG", "COVENANT", "ALIGNMENT"].includes(workspaceSource)) {
      if (searchQuery) {
        // Filter by space + search title
        query = "SELECT * FROM library WHERE user_id = ? AND workspace_source = ? AND title LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        bindings = [user.id, workspaceSource, `%${searchQuery ?? ""}%`, limit, offset];
      } else {
        // Filter by space only — uses idx_library_user_id_source index
        query = "SELECT * FROM library WHERE user_id = ? AND workspace_source = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        bindings = [user.id, workspaceSource, limit, offset];
      }
    } else if (searchQuery) {
      // Search all spaces
      query = "SELECT * FROM library WHERE user_id = ? AND title LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
      bindings = [user.id, `%${searchQuery ?? ""}%`, limit, offset];
    } else {
      query = "SELECT * FROM library WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
      bindings = [user.id, limit, offset];
    }

    const { results } = await env.DB.prepare(query).bind(...(bindings as any[])).all();

    return Response.json({ items: results || [] });
  } catch (e) {
    logSafetyEvent({
      level: "error",
      event: "library_fetch_failed",
      request: req,
      error_type: "system",
      error: e,
    });
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
    logSafetyEvent({
      level: "error",
      event: "library_item_fetch_failed",
      request: req,
      error_type: "system",
      error: e,
    });
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
    logSafetyEvent({
      level: "error",
      event: "library_item_delete_failed",
      request: req,
      error_type: "system",
      error: e,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function handleGetLibraryStats(req: Request, env: Env) {
  const user = await getAuthUser(req, env.DB);
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const { results } = await env.DB.prepare(
      "SELECT workspace_source, COUNT(*) as count FROM library WHERE user_id = ? GROUP BY workspace_source"
    ).bind(user.id).all();

    const stats: Record<string, number> = { DEFRAG: 0, COVENANT: 0, ALIGNMENT: 0, total: 0 };
    for (const row of (results || []) as any[]) {
      stats[row.workspace_source] = row.count;
      stats.total += row.count;
    }

    return Response.json({ stats }, { headers: getCorsHeaders(req) });
  } catch (e) {
    return Response.json({ stats: { DEFRAG: 0, COVENANT: 0, ALIGNMENT: 0, total: 0 } }, { headers: getCorsHeaders(req) });
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

  router.get("/api/library/stats", async (req: Request) => {
    const env = getEnv();
    return handleGetLibraryStats(req, env);
  });

  router.post("/api/history", async (req: Request) => {
    const env = getEnv();
    return handleSaveToLibrary(req, env);
  });
}
