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

  // Subscription gate for workspace route
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

export function registerHistoryRoute(router: any, getEnv: () => Env) {
  router.get("/api/history", async (req: Request) => {
    const env = getEnv();
    return handleHistory(req, env);
  });
}
