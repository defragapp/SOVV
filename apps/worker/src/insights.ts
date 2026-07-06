import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { SECURITY_PREFIX } from "./prompts.js";

// ── Cross-session insights ────────────────────────────────────────────────────
// Aggregates patterns across sessions to show what's recurring, shifting, resolved.

const SYSTEM_INSIGHTS = SECURITY_PREFIX + `You are Sovereign.os generating a cross-session pattern summary.

Given a list of recent session summaries, identify:
1. Patterns that are recurring (appearing in multiple sessions)
2. Patterns that are shifting (changing in intensity or form)
3. Patterns that appear resolved (not appearing in recent sessions)

Output ONLY valid JSON:
{
  "recurring": [
    { "pattern": "string", "frequency": "string", "note": "string" }
  ],
  "shifting": [
    { "pattern": "string", "direction": "string", "note": "string" }
  ],
  "resolved": [
    { "pattern": "string", "lastSeen": "string", "note": "string" }
  ],
  "summary": "string — 1-2 sentence overall summary of what's moving",
  "nextFocus": "string — the one thing most worth bringing to a session next"
}

Rules:
- Be specific, not generic
- Do not diagnose
- Keep each field concise
- Output ONLY the JSON object`;

interface InsightPattern {
  pattern: string;
  frequency?: string;
  direction?: string;
  lastSeen?: string;
  note: string;
}

interface InsightsResult {
  recurring: InsightPattern[];
  shifting: InsightPattern[];
  resolved: InsightPattern[];
  summary: string;
  nextFocus: string;
  generatedAt: string;
  sessionCount: number;
  lookbackDays: number;
}

const EMPTY_RESULT = (days: number, count: number): InsightsResult => ({
  recurring: [],
  shifting: [],
  resolved: [],
  summary: count === 0
    ? "Not enough sessions to generate insights yet."
    : "Not enough sessions in this window to generate insights.",
  nextFocus: "Complete a few more sessions to start seeing cross-session patterns.",
  generatedAt: new Date().toISOString(),
  sessionCount: count,
  lookbackDays: days,
});

export function registerInsightsRoute(router: any, getEnv: () => Env) {
  router.get("/api/insights", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const url = new URL(request.url);
    const space = url.searchParams.get("space") || "all";
    const days = Math.min(Number(url.searchParams.get("days") || "30"), 365);
    const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 20);

    // Fetch recent archive entries from D1
    let sessions: Array<{ active_pattern: string; whats_active: string; created_at: string; space: string }> = [];

    try {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      let result;
      if (space !== "all") {
        result = await env.DB.prepare(
          `SELECT active_pattern, whats_active, created_at, space
           FROM archive_entries
           WHERE user_id = ? AND created_at >= ? AND space = ?
           ORDER BY created_at DESC LIMIT 50`
        ).bind(user.id, cutoff, space).all<typeof sessions[0]>();
      } else {
        result = await env.DB.prepare(
          `SELECT active_pattern, whats_active, created_at, space
           FROM archive_entries
           WHERE user_id = ? AND created_at >= ?
           ORDER BY created_at DESC LIMIT 50`
        ).bind(user.id, cutoff).all<typeof sessions[0]>();
      }

      sessions = result.results || [];
    } catch {
      return new Response(JSON.stringify(EMPTY_RESULT(days, 0)), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (sessions.length < 3) {
      return new Response(JSON.stringify(EMPTY_RESULT(days, sessions.length)), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Build session summary for AI
    const sessionSummary = sessions.map((s, i) => {
      const date = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `Session ${i + 1} (${date}, ${s.space}): ${s.active_pattern}. ${s.whats_active}`;
    }).join("\n");

    try {
      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        {
          messages: [
            { role: "system" as const, content: SYSTEM_INSIGHTS },
            { role: "user" as const, content: `Recent sessions (${sessions.length} total, last ${days} days):\n\n${sessionSummary}` },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }
      );

      const raw = (aiResponse as any).response ?? String(aiResponse);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");

      const aiResult = JSON.parse(match[0]);

      const result: InsightsResult = {
        recurring: (aiResult.recurring || []).slice(0, limit),
        shifting: (aiResult.shifting || []).slice(0, limit),
        resolved: (aiResult.resolved || []).slice(0, limit),
        summary: aiResult.summary || "",
        nextFocus: aiResult.nextFocus || "",
        generatedAt: new Date().toISOString(),
        sessionCount: sessions.length,
        lookbackDays: days,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[insights] AI error:", e);
      return new Response(JSON.stringify({ error: "Failed to generate insights" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });
}