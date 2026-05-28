// ─── Background Pattern Extraction ───
// Runs via ctx.waitUntil after the response is sent

import type { D1Database, Ai } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { getRecentInteractions, upsertPattern, getPatterns } from "./db.ts";
import { verifyAccessJWT } from "./auth.ts";
import { getSessionId, cookieHeader } from "./plan.ts";

const PATTERN_SYSTEM_PROMPT = `You are a pattern recognition engine. Analyze the user's recent interactions and identify recurring behavioral or emotional patterns.

Respond ONLY as valid JSON:
{
  "patterns": [
    {
      "type": "trigger" | "dynamic" | "defense" | "repetition" | "growth",
      "content": "One clear sentence describing the pattern",
      "confidence": "High" | "Medium" | "Low",
      "matches_known": ""
    }
  ]
}

Rules:
- Only identify patterns that appear across MULTIPLE interactions
- Be specific, not generic
- Do not diagnose or label personality
- Max 3 patterns per extraction
- If no clear patterns exist, return empty array
- Use structural language. Avoid banned terms: trigger, trauma, healing.
- IMPORTANT: If a new pattern closely matches a known pattern listed below, set "matches_known" to the known pattern's content exactly. Otherwise leave "matches_known" empty.`;

export async function extractPatterns(
  env: {
    DB: D1Database;
    AI: Ai;
    AI_MODEL?: string;
  },
  sessionId: string,
  newInteractionId: string
) {
  try {
    const interactions = await getRecentInteractions(env.DB, sessionId, 10);
    const existingPatterns = await getPatterns(env.DB, sessionId);
    const knownPatternsSection = existingPatterns.length
      ? `\n\nKnown patterns to check against (match these instead of creating duplicates):\n${existingPatterns.map(p => `- [${p.pattern_type}, seen ${p.occurrence_count}x] ${p.content}`).join("\n")}`
      : "";

    if (interactions.length < 2) return; // Need at least 2 interactions to find patterns

    const interactionSummary = interactions
      .slice(0, 8)
      .map((i, idx) => {
        return `Interaction ${idx + 1}:
  Question: ${i.question}
  Context: ${i.text?.slice(0, 200)}
  What's going on: ${i.result?.whatsGoingOn || ""}
  Why it repeats: ${i.result?.whyRepeating || ""}
  Frame: ${i.result?.frame || ""}
  Pressing on: ${i.result?.pressure || ""}
  Activation: ${i.result?.activation || ""}
  Rising: ${i.result?.rising || ""}
  Relational Field: ${i.result?.field || ""}
  Shift/Steadying: ${i.result?.shift || ""}
  Confidence: ${i.confidence}`;
      })
      .join("\n\n");

    const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
    const ai = await env.AI.run(modelId, {
      messages: [
        { role: "system", content: PATTERN_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze these recent interactions for recurring patterns:\n\n${interactionSummary}${knownPatternsSection}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const parsed = JSON.parse(String(ai.response ?? "{}"));

    for (const pattern of parsed.patterns) {
      if (!pattern.content || !pattern.type) continue;

      if (pattern.matches_known) {
        await env.DB.prepare(
          "UPDATE patterns SET occurrence_count = occurrence_count + 1, last_seen = ? WHERE session_id = ? AND content = ?"
        ).bind(Date.now(), sessionId, pattern.matches_known).run();
      } else {
        await upsertPattern(env.DB, {
          id: crypto.randomUUID(),
          session_id: sessionId,
          pattern_type: pattern.type,
          content: pattern.content,
          confidence: pattern.confidence || "Medium",
          verified: 0,
          source_interaction_ids: [newInteractionId],
        });
      }
    }
  } catch (err) {
    // Silent fail — pattern extraction is non-critical
    console.error("Pattern extraction failed:", err);
  }
}

export async function handlePatternVerify(req: Request, env: Env): Promise<Response> {
  const user = await verifyAccessJWT(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sid = await getSessionId(req);
  const body = (await req.json().catch(() => ({}))) as { patternId?: string; action?: "confirm" | "dismiss" };

  if (!body.patternId || !body.action) {
    return Response.json({ error: "patternId and action (confirm|dismiss) required" }, { status: 400 });
  }

  const verified = body.action === "confirm" ? 1 : -1;

  await env.DB.prepare(
    "UPDATE patterns SET verified = ?, last_seen = ? WHERE id = ? AND session_id = ?"
  ).bind(verified, Date.now(), body.patternId, sid).run();

  return Response.json(
    { success: true, patternId: body.patternId, verified },
    { headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" } }
  );
}

export async function handleGetPatterns(req: Request, env: Env): Promise<Response> {
  const user = await verifyAccessJWT(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sid = await getSessionId(req);
  const patterns = await getPatterns(env.DB, sid);

  return Response.json(
    { patterns },
    { headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" } }
  );
}

export function registerPatternsRoutes(router: any, getEnv: () => Env) {
  router.get("/api/patterns", async (req: Request) => handleGetPatterns(req, getEnv()));
  router.post("/api/patterns/verify", async (req: Request) => handlePatternVerify(req, getEnv()));
}
