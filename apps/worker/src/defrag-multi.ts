import { sanitizeInput, detectPromptInjection } from "./utils/sanitize.js";
import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { checkFreeLimit } from "./plan.js";
import { getBaselineDataset } from "./baseline.js";
import { selectActiveSignals, buildTimingSignals, formatActiveSignalsForPrompt } from "./active-signals.js";
import { SECURITY_PREFIX } from "./prompts.js";
import { checkGuardrails } from "./output-validator.js";

// ── Multi-person Defrag ───────────────────────────────────────────────────────
// Compare patterns across 3+ people simultaneously.

const SYSTEM_DEFRAG_MULTI = SECURITY_PREFIX + `You are Sovereign.os running a multi-person pattern analysis.

Your job: read the dynamics between multiple people in a shared situation — identifying what each person likely has active, how the group dynamic forms, and what the user's best next move is.

Output ONLY valid JSON in this exact structure:
{
  "people": [
    {
      "name": "string",
      "role": "string",
      "activePattern": "string — what's likely active for this person",
      "likelyResponse": "string — how they're likely responding",
      "needBeneath": "string — what they likely need beneath the surface"
    }
  ],
  "groupDynamic": "string — what's forming between all these people",
  "sharedPattern": "string — the pattern that runs through the whole system",
  "bestNextMove": "string — the user's clearest next move given all of this"
}

Rules:
- Be specific to the people and situation described
- Do not diagnose or pathologize
- Do not expose Baseline Design data directly
- Keep each field to 1-2 sentences
- Output ONLY the JSON object, no markdown, no explanation
- The people array must match the input people in order`;

interface PersonInput {
  name: string;
  role?: string;
  notes?: string;
}

interface MultiPersonResult {
  people: Array<{
    name: string;
    role: string;
    activePattern: string;
    likelyResponse: string;
    needBeneath: string;
  }>;
  groupDynamic: string;
  sharedPattern: string;
  bestNextMove: string;
}

export function registerDefragMultiRoute(router: any, getEnv: () => Env) {
  router.post("/api/defrag/multi", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Rate limit check
    const sid = user.id;
    const limitCheck = await checkFreeLimit(env, sid);
    if (!limitCheck.allowed) {
      return new Response(JSON.stringify({ error: "Daily session limit reached. Upgrade to Pro for unlimited sessions." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    let body: { situation: string; people: PersonInput[]; includeBaseline?: boolean };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!body.situation || typeof body.situation !== "string") {
      return new Response(JSON.stringify({ error: "situation is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!Array.isArray(body.people) || body.people.length < 2) {
      return new Response(JSON.stringify({ error: "At least 2 people required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (body.people.length > 8) {
      return new Response(JSON.stringify({ error: "Maximum 8 people" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Sanitize
    const situation = sanitizeInput(body.situation.trim().slice(0, 3000));
    if (detectPromptInjection(situation)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const people = body.people.map((p) => ({
      name: sanitizeInput((p.name || "").trim().slice(0, 100)),
      role: sanitizeInput((p.role || "").trim().slice(0, 100)),
      notes: sanitizeInput((p.notes || "").trim().slice(0, 500)),
    })).filter((p) => p.name.length > 0);

    // Get baseline context
    let activeSignalsText = "";
    if (body.includeBaseline !== false) {
      const dataset = await getBaselineDataset(env, sid, user.id);
      if (dataset) {
        const activeSignals = selectActiveSignals(dataset, {
          message: situation,
          relational: true,
          mode: "group",
        });
        const timingSignals = buildTimingSignals(dataset);
        activeSignalsText = formatActiveSignalsForPrompt(activeSignals, timingSignals);
      }
    }

    // Build people description
    const peopleDesc = people.map((p, i) =>
      `Person ${i + 1}: ${p.name}${p.role ? ` (${p.role})` : ""}${p.notes ? `\nContext: ${p.notes}` : ""}`
    ).join("\n\n");

    const userPrompt = [
      activeSignalsText ? `YOUR BASELINE SIGNALS:\n${activeSignalsText}` : "",
      `SITUATION:\n${situation}`,
      `PEOPLE INVOLVED:\n${peopleDesc}`,
    ].filter(Boolean).join("\n\n");

    try {
      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        {
          messages: [
            { role: "system" as const, content: SYSTEM_DEFRAG_MULTI },
            { role: "user" as const, content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }
      );

      const raw = (aiResponse as any).response ?? String(aiResponse);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response");

      const result = JSON.parse(match[0]) as MultiPersonResult;

      // Ensure people array matches input count
      if (!Array.isArray(result.people)) result.people = [];
      while (result.people.length < people.length) {
        const idx = result.people.length;
        result.people.push({
          name: people[idx]?.name || "Unknown",
          role: people[idx]?.role || "",
          activePattern: "Pattern unclear",
          likelyResponse: "Response unclear",
          needBeneath: "Need unclear",
        });
      }

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
      console.error("[defrag-multi] AI error:", e);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });
}