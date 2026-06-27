// @ts-nocheck
// --- Background Pattern Extraction ---
// Runs via ctx.waitUntil after the response is sent
import type { D1Database, Ai } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { getRecentInteractions, upsertPatterns, getPatterns } from "./db.js";
import { getAuthUser, verifyAccessJWT } from "./auth.js";
import { getSessionId, cookieHeader } from "./plan.js";
import { requireActiveSubscription } from "./billing.js";

export interface Pattern {
  type: "trigger" | "dynamic" | "defense" | "repetition" | "growth";
  content?: string;
  confidence: "High" | "Medium" | "Low";
  matches_known?: string;
}

const PATTERN_SYSTEM_PROMPT = `You are a pattern recognition engine. Analyze the user's recent interactions and identify recurring psychological, emotional, or behavioral patterns. Respond ONLY as valid JSON:

{
  "patterns": [
    {
      "type": "trigger" | "dynamic" | "defense" | "repetition" | "growth",
      "content": "string description",
      "confidence": "High" | "Medium" | "Low",
      "matches_known": "string explanation if it matches previous context"
    }
  ]
}`;

export async function extractPatterns(env: Env, sessionId: string, newInteractionId: string): Promise<void> {
  console.log(`[Queue] Starting pattern extraction for session: ${sessionId}`);

  // 1. Get recent contextual data
  const interactions = await getRecentInteractions(env.DB, sessionId, 15);
  if (interactions.length < 2) {
    console.log("[Queue] Insufficient interactions to calculate recursive behavior.");
    return;
  }

  const existingPatterns = await getPatterns(env.DB, sessionId);

  // 2. Build model payloads
  const contextText = interactions.map(i => `[${i.role.toUpperCase()}]: ${i.content}`).join("\n");
  const baselineText = existingPatterns.length > 0 
    ? `Known persistent cycles:\n${existingPatterns.map(p => `- [${p.key}]: ${p.value}`).join("\n")}`
    : "No persistent behavioral structures logged yet.";

  if (!env.AI) {
    console.error("[Queue] Cloudflare AI binding unavailable.");
    return;
  }

  try {
    const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: PATTERN_SYSTEM_PROMPT },
        { role: "user", content: `${baselineText}\n\nRecent Timeline Data:\n${contextText}` }
      ],
        response_format: { type: "json_object" }
      }, {
        gateway: { id: env.GATEWAY_ID || "sovereign-code-agent" }
    });

    const text = (response as { response?: string }).response || "{}";
    const ai = JSON.parse(text);
    const patterns: Pattern[] = ai.patterns || [];

    // 3. Commit elements atomic to DB via batch
    const patternPayloads = patterns.map((pattern) => ({
      id: `pat_${crypto.randomUUID().replace(/-/g, "")}`,
      session_id: sessionId,
      pattern_type: pattern.type ?? "repetition",
      content: pattern.content ?? "",
      source_interaction_ids: [newInteractionId],
      confidence: pattern.confidence ?? "Low",
      verified: 0,
    }));
    await upsertPatterns(env.DB, patternPayloads);
    console.log(`[Queue] Successfully stored ${patterns.length} isolated tracks.`);
  } catch (err) {
    console.error("[Queue] Inference pipeline execution failure:", err);
    throw err;
  }
}

export function registerPatternsRoutes(router: any, getEnv: () => Env) {
  router.get("/api/patterns", async (request: Request) => {
    const env = getEnv();
    
    // Check session via cookies first
    const user = await getAuthUser(request, env.DB);

    // Subscription gate for workspace route
    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    const cookie = request.headers.get("Cookie") || "";
    let sessionId = "";
    const match = cookie.match(/sid=([a-zA-Z0-9_-]+)/);
    if (match) sessionId = match[1] ?? "";

    if (!sessionId) {
      const { getAuthUser } = await import("./auth.js");
      const user = await getAuthUser(request, env.DB);
      if (user) sessionId = user.id;
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing identity scope" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const activeTracks = await getPatterns(env.DB, sessionId);
      return new Response(JSON.stringify({ patterns: activeTracks }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  });
}