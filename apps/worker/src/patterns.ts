// ─── Background Pattern Extraction ───
// Runs via ctx.waitUntil after the response is sent

import type { D1Database, Ai } from "@cloudflare/workers-types";
import { getRecentInteractions, upsertPattern } from "./db.js";

const PATTERN_SYSTEM_PROMPT = `You are a pattern recognition engine. Analyze the user's recent interactions and identify recurring behavioral or emotional patterns.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{"patterns":[{"type":"trigger","content":"One clear sentence describing the pattern","confidence":"Medium"}]}

Rules:
- Only identify patterns that appear across MULTIPLE interactions
- Be specific, not generic
- Do not diagnose or label personality
- Max 3 patterns per extraction
- If no clear patterns exist, return {"patterns":[]}
- Use everyday language, not clinical terms
- Pattern types: trigger, dynamic, defense, repetition, growth`;

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
    if (interactions.length < 2) return;

    const interactionSummary = interactions
      .slice(0, 8)
      .map((i, idx) => {
        let result: Record<string, string> = {};
        try { result = JSON.parse(i.result || "{}"); } catch {}
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
      response_format: {
        type: "json_object",
      },
      temperature: 0.3,
      max_tokens: 300,
    });

    // Robust parsing: handle various AI response shapes
    let responseText = "";
    if (typeof ai === "string") {
      responseText = ai;
    } else if (ai && typeof ai === "object") {
      // Workers AI returns { response: "..." } for text models
      responseText = String((ai as any).response || (ai as any).text || JSON.stringify(ai));
    }

    // Strip any markdown code fences if present
    responseText = responseText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

    let parsed: { patterns?: Array<{ type?: string; content?: string; confidence?: string }> } = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { return; }
      } else {
        return;
      }
    }

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
    console.error("Pattern extraction failed:", String(err));
  }
}
