// ─── Background Pattern Extraction ───
// Runs via ctx.waitUntil after the response is sent

import type { D1Database, Ai } from "@cloudflare/workers-types";
import { getRecentInteractions, upsertPattern } from "./db.js";

const PATTERN_SYSTEM_PROMPT = `You are a pattern recognition engine. Analyze the user's recent interactions and identify recurring behavioral or emotional patterns.

Respond ONLY as valid JSON:
{
  "patterns": [
    {
      "type": "trigger" | "dynamic" | "defense" | "repetition" | "growth",
      "content": "One clear sentence describing the pattern",
      "confidence": "High" | "Medium" | "Low"
    }
  ]
}

Rules:
- Only identify patterns that appear across MULTIPLE interactions
- Be specific, not generic
- Do not diagnose or label personality
- Max 3 patterns per extraction
- If no clear patterns exist, return empty array
- Use everyday language, not clinical terms`;

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
    if (interactions.length < 2) return; // Need at least 2 interactions to find patterns

    const interactionSummary = interactions
      .slice(0, 8)
      .map((i, idx) => {
        const result = JSON.parse(i.result || "{}");
        return `Interaction ${idx + 1}:
  Question: ${i.question}
  Context: ${i.text?.slice(0, 200)}
  What's going on: ${result.whatsGoingOn || ""}
  Why it repeats: ${result.whyRepeating || ""}
  Confidence: ${i.confidence}`;
      })
      .join("\n\n");

    const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
    const ai = await env.AI.run(modelId, {
      messages: [
        { role: "system", content: PATTERN_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze these recent interactions for recurring patterns:\n\n${interactionSummary}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const parsed = JSON.parse(String(ai.response ?? "{}"));
    const patterns = parsed?.patterns ?? [];

    for (const p of patterns) {
      if (!p.type || !p.content) continue;
      await upsertPattern(env.DB, {
        id: crypto.randomUUID(),
        session_id: sessionId,
        pattern_type: p.type,
        content: p.content,
        source_interaction_ids: [newInteractionId],
        confidence: p.confidence || "Low",
      });
    }
  } catch (err) {
    // Silent fail — pattern extraction is non-critical
    console.error("Pattern extraction failed:", err);
  }
}
