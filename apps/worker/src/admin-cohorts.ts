import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";

// ── Admin cohort segmentation ─────────────────────────────────────────────────
// Segment users by signup date, tier, and usage patterns.

interface CohortUser {
  id: string;
  email: string;
  tier: string;
  created_at: string;
  session_count: number;
  last_active: string | null;
}

interface CohortResponse {
  cohort: {
    from: string;
    to: string;
    tier: string;
    minSessions: number;
  };
  total: number;
  page: number;
  perPage: number;
  users: CohortUser[];
  summary: {
    freeCount: number;
    proCount: number;
    avgSessions: number;
    activeThisWeek: number;
  };
}

async function isAdmin(user: any): Promise<boolean> {
  return user?.role === "admin" || user?.role === "owner";
}

export function registerAdminCohortsRoute(router: any, getEnv: () => Env) {
  router.get("/api/admin/cohorts", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!(await isAdmin(user))) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const url = new URL(request.url);
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const tier = url.searchParams.get("tier") || "all";
    const minSessions = Math.max(0, Number(url.searchParams.get("min_sessions") || "0"));
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get("per_page") || "50")));
    const offset = (page - 1) * perPage;

    try {
      // Build WHERE clauses
      const conditions: string[] = [];
      const bindings: (string | number)[] = [];

      if (from) {
        conditions.push("u.created_at >= ?");
        bindings.push(from);
      }
      if (to) {
        conditions.push("u.created_at <= ?");
        bindings.push(to + "T23:59:59Z");
      }
      if (tier !== "all") {
        conditions.push("u.tier = ?");
        bindings.push(tier);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Main query with session count
      const query = `
        SELECT
          u.id,
          u.email,
          u.tier,
          u.created_at,
          COUNT(DISTINCT ue.id) as session_count,
          MAX(ue.created_at) as last_active
        FROM users u
        LEFT JOIN usage_events ue ON ue.user_id = u.id
        ${whereClause}
        GROUP BY u.id
        HAVING session_count >= ?
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const result = await env.DB.prepare(query)
        .bind(...bindings, minSessions, perPage, offset)
        .all<CohortUser & { session_count: number; last_active: string | null }>();

      const users = result.results || [];

      // Summary stats
      const summaryQuery = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN u.tier = 'free' THEN 1 ELSE 0 END) as free_count,
          SUM(CASE WHEN u.tier != 'free' THEN 1 ELSE 0 END) as pro_count,
          AVG(session_count) as avg_sessions,
          SUM(CASE WHEN last_active >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as active_week
        FROM (
          SELECT u.id, u.tier, COUNT(ue.id) as session_count, MAX(ue.created_at) as last_active
          FROM users u
          LEFT JOIN usage_events ue ON ue.user_id = u.id
          ${whereClause}
          GROUP BY u.id
          HAVING session_count >= ?
        )
      `;

      const summary = await env.DB.prepare(summaryQuery)
        .bind(...bindings, minSessions)
        .first<{ total: number; free_count: number; pro_count: number; avg_sessions: number; active_week: number }>();

      const response: CohortResponse = {
        cohort: { from, to, tier, minSessions },
        total: summary?.total || 0,
        page,
        perPage,
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          tier: u.tier,
          created_at: u.created_at,
          session_count: u.session_count || 0,
          last_active: u.last_active || null,
        })),
        summary: {
          freeCount: summary?.free_count || 0,
          proCount: summary?.pro_count || 0,
          avgSessions: Math.round((summary?.avg_sessions || 0) * 10) / 10,
          activeThisWeek: summary?.active_week || 0,
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[admin-cohorts] DB error:", e);
      return new Response(JSON.stringify({ error: "Failed to fetch cohorts" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });
}