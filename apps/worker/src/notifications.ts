import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { SECURITY_PREFIX } from "./prompts.js";

// ── Notifications: weekly summary + session of the week ───────────────────────

const SYSTEM_WEEKLY_SUMMARY = SECURITY_PREFIX + `You are Sovereign.os generating a weekly pattern summary.

Given a list of recent sessions, generate a brief, grounded weekly summary.

Output ONLY valid JSON:
{
  "subject": "string — email subject line (max 60 chars)",
  "headline": "string — 1 sentence summary of the week",
  "patterns": ["string", "string"],
  "sessionOfWeek": {
    "title": "string — session title",
    "keyInsight": "string — the most significant insight",
    "bestNextResponse": "string"
  },
  "nextFocus": "string — one thing to bring to a session this week",
  "closingLine": "string — brief, grounded closing (1 sentence)"
}`;

const SYSTEM_SESSION_OF_WEEK = SECURITY_PREFIX + `You are Sovereign.os identifying the most significant session from the past week.

Given a list of recent sessions, identify which one had the most significant pattern recognition or insight.

Output ONLY valid JSON:
{
  "sessionIndex": 0,
  "title": "string — a brief title for this session",
  "keyInsight": "string — the most significant insight from this session",
  "prompt": "string — a re-engagement prompt to bring the user back (1 sentence)"
}`;

interface SessionOfWeekResponse {
  session: {
    id: string;
    space: string;
    title: string;
    keyInsight: string;
    bestNextResponse: string;
    createdAt: string;
  } | null;
  prompt: string;
  lastActiveAt: string | null;
}

export function registerNotificationRoutes(router: any, getEnv: () => Env) {
  // GET /api/notifications/session-of-week
  router.get("/api/notifications/session-of-week", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let sessions: Array<{
      id: string;
      space: string;
      active_pattern: string;
      whats_active: string;
      best_next_response: string;
      created_at: string;
    }> = [];
    let lastActiveAt: string | null = null;

    try {
      const result = await env.DB.prepare(
        `SELECT id, space, active_pattern, whats_active, best_next_response, created_at
         FROM archive_entries
         WHERE user_id = ? AND created_at >= ?
         ORDER BY created_at DESC LIMIT 10`
      ).bind(user.id, cutoff).all<typeof sessions[0]>();
      sessions = result.results || [];

      const lastResult = await env.DB.prepare(
        `SELECT MAX(created_at) as last_active FROM usage_events WHERE user_id = ?`
      ).bind(user.id).first<{ last_active: string }>();
      lastActiveAt = lastResult?.last_active || null;
    } catch {
      // Tables may not exist
    }

    if (sessions.length === 0) {
      const response: SessionOfWeekResponse = {
        session: null,
        prompt: "Return to Sovereign.os — your patterns are waiting.",
        lastActiveAt,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    try {
      const sessionSummary = sessions.map((s, i) => {
        const date = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `Session ${i} (${date}, ${s.space}): ${s.active_pattern}. ${s.whats_active}`;
      }).join("\n");

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        {
          messages: [
            { role: "system" as const, content: SYSTEM_SESSION_OF_WEEK },
            { role: "user" as const, content: sessionSummary },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }
      );

      const raw = (aiResponse as any).response ?? String(aiResponse);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");

      const aiResult = JSON.parse(match[0]) as {
        sessionIndex: number;
        title: string;
        keyInsight: string;
        prompt: string;
      };

      const idx = Math.max(0, Math.min(Number(aiResult.sessionIndex) || 0, sessions.length - 1));
      const picked = sessions[idx];

      const response: SessionOfWeekResponse = {
        session: {
          id: picked.id,
          space: picked.space,
          title: aiResult.title || picked.active_pattern,
          keyInsight: aiResult.keyInsight || picked.whats_active,
          bestNextResponse: picked.best_next_response,
          createdAt: picked.created_at,
        },
        prompt: aiResult.prompt || "Something from last week worth returning to.",
        lastActiveAt,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[session-of-week] AI error:", e);
      // Fallback: return most recent session without AI title
      const picked = sessions[0];
      const response: SessionOfWeekResponse = {
        session: {
          id: picked.id,
          space: picked.space,
          title: picked.active_pattern,
          keyInsight: picked.whats_active,
          bestNextResponse: picked.best_next_response,
          createdAt: picked.created_at,
        },
        prompt: "Something from last week worth returning to.",
        lastActiveAt,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });

  // GET /api/notifications/weekly-summary — preview for current user
  router.get("/api/notifications/weekly-summary", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let sessions: Array<{ space: string; active_pattern: string; whats_active: string; created_at: string }> = [];

    try {
      const result = await env.DB.prepare(
        `SELECT space, active_pattern, whats_active, created_at
         FROM archive_entries
         WHERE user_id = ? AND created_at >= ?
         ORDER BY created_at DESC LIMIT 20`
      ).bind(user.id, cutoff).all<typeof sessions[0]>();
      sessions = result.results || [];
    } catch {
      // ignore
    }

    if (sessions.length === 0) {
      return new Response(JSON.stringify({
        subject: "Your week with Sovereign.os",
        headline: "No sessions this week — come back when you're ready.",
        patterns: [],
        sessionOfWeek: null,
        nextFocus: "Bring the next moment that's hard to read.",
        closingLine: "The pattern is still there when you return.",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    try {
      const sessionSummary = sessions.map((s, i) => {
        const date = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `Session ${i + 1} (${date}, ${s.space}): ${s.active_pattern}. ${s.whats_active}`;
      }).join("\n");

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        {
          messages: [
            { role: "system" as const, content: SYSTEM_WEEKLY_SUMMARY },
            { role: "user" as const, content: `This week's sessions (${sessions.length} total):\n\n${sessionSummary}` },
          ],
          temperature: 0.3,
          max_tokens: 600,
        }
      );

      const raw = (aiResponse as any).response ?? String(aiResponse);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");

      return new Response(match[0], {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[weekly-summary] AI error:", e);
      return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });

  // POST /api/notifications/weekly-summary — admin trigger
  router.post("/api/notifications/weekly-summary", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (env.QUEUE) {
      await env.QUEUE.send({ type: "weekly-summary", triggeredBy: user.id, triggeredAt: new Date().toISOString() });
      return new Response(JSON.stringify({ success: true, message: "Weekly summary queued" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    return new Response(JSON.stringify({ error: "Queue not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...cors },
    });
  });
}