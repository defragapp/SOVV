import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { resolveEntitlements } from "./entitlements.js";

/**
 * retention.ts
 *
 * Enforces data retention policy:
 *   Free tier  — 30 days history
 *   Pro tier   — unlimited (configurable)
 *
 * Routes:
 *   POST /api/retention/purge   — purge expired records for the authenticated user
 *   GET  /api/retention/status  — return retention policy and record counts
 *
 * Scheduled purge is triggered via Cloudflare Cron (see wrangler.toml).
 * Manual purge is available to the authenticated user at any time.
 */

const FREE_RETENTION_DAYS = 30;

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/**
 * Purge history records older than retentionDays for a specific user.
 * Returns the number of records deleted.
 */
async function purgeUserHistory(env: Env, userId: string, retentionDays: number): Promise<number> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const cutoffIso = new Date(cutoff).toISOString();

  const result = await env.DB.prepare(
    "DELETE FROM history WHERE user_id = ? AND created_at < ? RETURNING id"
  )
    .bind(userId, cutoffIso)
    .all();

  return result.results?.length ?? 0;
}

/**
 * Count history records for a user, split by age.
 */
async function getUserHistoryStats(env: Env, userId: string): Promise<{
  total: number;
  older_than_30_days: number;
  older_than_90_days: number;
}> {
  const now = Date.now();
  const cutoff30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const cutoff90 = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [total, old30, old90] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as n FROM history WHERE user_id = ?").bind(userId).first<{ n: number }>(),
    env.DB.prepare("SELECT COUNT(*) as n FROM history WHERE user_id = ? AND created_at < ?").bind(userId, cutoff30).first<{ n: number }>(),
    env.DB.prepare("SELECT COUNT(*) as n FROM history WHERE user_id = ? AND created_at < ?").bind(userId, cutoff90).first<{ n: number }>(),
  ]);

  return {
    total: total?.n ?? 0,
    older_than_30_days: old30?.n ?? 0,
    older_than_90_days: old90?.n ?? 0,
  };
}

export function registerRetentionRoutes(router: any, getEnv: () => Env) {
  const cors = getCorsHeaders();

  // GET /api/retention/status — return policy and record counts
  router.get("/api/retention/status", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401, cors);

    const entitlements = resolveEntitlements(user);
    const retentionDays = entitlements.canUseLibrary ? null : FREE_RETENTION_DAYS;
    const stats = await getUserHistoryStats(env, user.id);

    return jsonResponse({
      ok: true,
      tier: entitlements.effectiveTier,
      retention_days: retentionDays,
      unlimited: retentionDays === null,
      records: stats,
      eligible_for_purge: !entitlements.canUseLibrary && stats.older_than_30_days > 0,
    }, 200, cors);
  });

  // POST /api/retention/purge — purge expired records for authenticated user
  router.post("/api/retention/purge", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401, cors);

    const entitlements = resolveEntitlements(user);

    // Pro users have unlimited retention — no purge needed
    if (entitlements.canUseLibrary) {
      return jsonResponse({
        ok: true,
        purged: 0,
        message: "Pro tier has unlimited retention. No records purged.",
        tier: entitlements.effectiveTier,
      }, 200, cors);
    }

    const purged = await purgeUserHistory(env, user.id, FREE_RETENTION_DAYS);

    return jsonResponse({
      ok: true,
      purged,
      retention_days: FREE_RETENTION_DAYS,
      message: purged > 0
        ? `Purged ${purged} record(s) older than ${FREE_RETENTION_DAYS} days.`
        : "No records eligible for purge.",
      tier: entitlements.effectiveTier,
    }, 200, cors);
  });
}

/**
 * scheduledRetentionPurge
 *
 * Called by Cloudflare Cron trigger (daily).
 * Purges history older than FREE_RETENTION_DAYS for all free-tier users.
 */
export async function scheduledRetentionPurge(env: Env): Promise<{ purged: number; users: number }> {
  const cutoffIso = new Date(Date.now() - FREE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Delete old history for free-tier users only
  const result = await env.DB.prepare(
    `DELETE FROM history
     WHERE created_at < ?
       AND user_id IN (
         SELECT id FROM users
         WHERE (tier = 'free' OR tier IS NULL)
           AND (subscription_status = 'free' OR subscription_status IS NULL OR subscription_status = 'canceled')
       )
     RETURNING id`
  )
    .bind(cutoffIso)
    .all();

  const purged = result.results?.length ?? 0;

  // Count affected users (approximate)
  const usersResult = await env.DB.prepare(
    `SELECT COUNT(DISTINCT user_id) as n FROM history
     WHERE created_at < ?
       AND user_id IN (SELECT id FROM users WHERE tier = 'free' OR tier IS NULL)`
  )
    .bind(cutoffIso)
    .first<{ n: number }>();

  console.log(JSON.stringify({
    event: "scheduled_retention_purge",
    purged,
    cutoff: cutoffIso,
    timestamp: new Date().toISOString(),
  }));

  return { purged, users: usersResult?.n ?? 0 };
}
