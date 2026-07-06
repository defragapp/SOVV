import { sanitizeInput, detectPromptInjection } from "./utils/sanitize.js";
import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { checkFreeLimit } from "./plan.js";
import { getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { selectActiveSignals, buildTimingSignals, formatActiveSignalsForPrompt } from "./active-signals.js";
import { SECURITY_PREFIX } from "./prompts.js";
import { checkGuardrails } from "./output-validator.js";

// ── Defrag a message ──────────────────────────────────────────────────────────
// Paste any text message or conversation snippet — get a pattern read.

const SYSTEM_DEFRAG_MESSAGE = SECURITY_PREFIX + `You are Sovereign.os reading a text message or conversation snippet.

Your job: give a grounded pattern read of what's happening in this message — not a generic interpretation, but a specific read of tone, subtext, and what's likely active beneath the words.

Output ONLY valid JSON in this exact structure:
{
  "tone": "string — the emotional tone of the message in 1 sentence",
  "whatTheyMightMean": "string — what the sender likely means beneath the words",
  "whatMightBeActive": "string — what pattern or dynamic might be running",
  "yourPattern": "string — how the user's Baseline Design might be reading this message",
  "bestNextResponse": "string — one clear next move for the user"
}

Rules:
- Be specific, not generic
- Do not diagnose or pathologize
- Do not expose Baseline Design data directly
- Keep each field to 1-2 sentences
- Output ONLY the JSON object, no markdown, no explanation`;

interface DefragMessageResult {
  tone: string;
  whatTheyMightMean: string;
  whatMightBeActive: string;
  yourPattern: string;
  bestNextResponse: string;
}

export function registerDefragMessageRoute(router: any, getEnv: () => Env) {
  router.post("/api/defrag/message", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Rate limit check — uses session ID (user.id for authenticated users)
    const sid = user.id;
    const limitCheck = await checkFreeLimit(env, sid);
    if (!limitCheck.allowed) {
      return new Response(JSON.stringify({ error: "Daily session limit reached. Upgrade to Pro for unlimited sessions." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    let body: { message: string; context?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!body.message || typeof body.message !== "string" || body.message.trim().length < 2) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Sanitize inputs
    const message = sanitizeInput(body.message.trim().slice(0, 2000));
    const context = body.context ? sanitizeInput(body.context.trim().slice(0, 500)) : "";

    // Injection check
    if (detectPromptInjection(message) || (context && detectPromptInjection(context))) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Get baseline context
    const dataset = await getBaselineDataset(env, sid, user.id);
    let activeSignalsText = "";
    if (dataset) {
      const activeSignals = selectActiveSignals(dataset, {
        message,
        relational: true,
        mode: "situation",
      });
      const timingSignals = buildTimingSignals(dataset);
      activeSignalsText = formatActiveSignalsForPrompt(activeSignals, timingSignals);
    }

    // Build user prompt
    const userPrompt = [
      activeSignalsText ? `ACTIVE SIGNALS:\n${activeSignalsText}` : "",
      `MESSAGE TO READ:\n"${message}"`,
      context ? `CONTEXT:\n${context}` : "",
    ].filter(Boolean).join("\n\n");

    try {
      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        {
          messages: [
            { role: "system" as const, content: SYSTEM_DEFRAG_MESSAGE },
            { role: "user" as const, content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
        }
      );

      const raw = (aiResponse as any).response ?? String(aiResponse);

      // Parse JSON from response
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response");

      const result = JSON.parse(match[0]) as DefragMessageResult;

      // Guardrail check
      const guardrailResult = checkGuardrails(result as unknown as Record<string, unknown>, "defrag");
      if (!guardrailResult.passed) {
        return new Response(JSON.stringify({ error: "Output failed safety check" }), {
          status: 422,
          headers: { "Content-Type": "application/json", ...cors },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[defrag-message] AI error:", e);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });
}