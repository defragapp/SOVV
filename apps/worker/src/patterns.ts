// --- Background Pattern Extraction ---
// Runs via ctx.waitUntil after the response is sent

import type { D1Database, Ai } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { getRecentInteractions, upsertPattern, getPatterns } from "./db.js";
import { verifyAccessJWT } from "./auth.js";
import { getSessionId, cookieHeader } from "./plan.js";

const PATTERN_SYSTEM_PROMPT = `You are a pattern recognition engine. Analyze the user's recent interactions and identify recurring psychological, emotional, or behavioral patterns.

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
- IMPORTANT: If a new pattern closely matches a known pattern listed below, set "matches_known" to the known pattern's content.
`;

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
      ? `\n\nKnown patterns to check against (match these instead of creating duplicates):\n${existingPatterns.map(p => `- ${p.content}`).join("\n")}`
      : "";

    if (interactions.length < 2) return; // Need at least 2 interactions to find patterns

    const interactionsSummary = interactions
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
          content: `Analyze these recent interactions for recurring patterns:\n\n${interactionsSummary}${knownPatternsSection}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const patterns = (ai as any).patterns || [];
    
    for (const pattern of patterns) {
      await upsertPattern(env.DB, {
        id: `pat_${crypto.randomUUID().replace(/-/g, "")}`,
        session_id: sessionId,
        pattern_type: (pattern as any).type ?? "repetition",
        content: (pattern as any).content ?? "",
        source_interaction_ids: [newInteractionId],
        confidence: (pattern as any).confidence ?? "Low",
        verified: 0,
      });
    }

  } catch (error) {
    console.error("Pattern extraction failed:", error);
  }
}

export function registerPatternsRoutes(router: any, getEnv: () => any) {
  router.get("/api/patterns", async (request: Request) => {
    const env = getEnv();
    const sessionId = await getSessionId(request);

    // Auth check
    const authError = await verifyAccessJWT(request, env);
    if (authError) return authError;

    const patterns = await getPatterns(env.DB, sessionId);
    return new Response(JSON.stringify(patterns), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieHeader(sessionId),
      },
    });
  });

  router.post("/api/patterns/verify", async (request: Request) => {
    const env = getEnv();
    const sessionId = await getSessionId(request);

    const authError = await verifyAccessJWT(request, env);
    if (authError) return authError;

    const body = await request.json() as { patternId?: string; action?: string };
    const { patternId, action } = body;
    if (!patternId || !action) {
      return new Response(JSON.stringify({ error: "Missing patternId or action" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const verified = action === "confirm" ? 1 : -1;
    await env.DB.prepare("UPDATE patterns SET verified = ? WHERE id = ?")
      .bind(verified, patternId)
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieHeader(sessionId),
      },
    });
  });
}


