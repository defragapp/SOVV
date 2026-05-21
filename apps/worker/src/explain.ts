import type { Env } from "./types-env.js";
import type { Baseline, ExplainRequest, ExplainResponse, ExplainResult, VideoScene } from "@sovereign/core";
import { safeJsonParse } from "@sovereign/core";
import { safetyMode, supportResponse } from "./safety.js";
import { SYSTEM_RULES, buildUserPrompt } from "./prompt.js";
import { flatChips } from "@sovereign/core";
import { getSessionId, getPlan, cookieHeader } from "./plan.js";
import { useOne } from "./kv.js";
import { getBaseline } from "./baseline.js";

function fallbackResult(): ExplainResult {
  return {
    whatsGoingOn: "I may not have enough detail to explain this clearly yet.",
    whyRepeating: "A bit more context would help identify what is repeating.",
    nextStep: "Add what happened right before and right after.",
    limits: "If there is safety risk or ongoing disrespect, get support first.",
    confidence: "Low"
  };
}

function audioScript(r: ExplainResult): string {
  return `${r.whatsGoingOn}\n\n${r.whyRepeating}\n\nOne better next step:\n${r.nextStep}\n\nConfidence: ${r.confidence}`;
}

function videoScenes(r: ExplainResult): VideoScene[] {
  return [
    { type: "messages", title: "What’s going on", text: r.whatsGoingOn, seconds: 8 },
    { type: "pattern", title: "Why it repeats", text: r.whyRepeating, seconds: 10 },
    { type: "rewrite", title: "Try a calmer line", text: "Say it in one clear sentence without blame.", seconds: 7 },
    { type: "action", title: "One better next step", text: r.nextStep, seconds: 8 },
    { type: "confidence", title: "Confidence", text: r.confidence, seconds: 4 }
  ];
}

function formatBaseline(baseline: Baseline): string {
  const tob = baseline.tob.type === "exact" ? baseline.tob.value : `approximate ${baseline.tob.value}`;
  return `DOB: ${baseline.dob}; TOB: ${tob}; POB: ${baseline.pob}`;
}

export async function handleExplain(req: Request, env: Env): Promise<Response> {
  const sid = await getSessionId(req);
  const plan = await getPlan(env, sid);
  const freeLimit = Number(env.FREE_DAILY_LIMIT || "15");
  const remainingToday = plan === "free" ? freeLimit : 9999;

  const body = (await req.json().catch(() => null)) as ExplainRequest | null;
  const input: ExplainRequest = body && typeof body.question === "string"
    ? {
        mode: body.mode || "self",
        question: body.question,
        text: body.text || "",
        people: body.people || []
      }
    : { mode: "self", question: "", text: "", people: [] };

  const baseline = await getBaseline(env, sid);
  if (!baseline) {
    return Response.json(
      {
        type: "needs_baseline",
        requestId: crypto.randomUUID(),
        mode: input.mode,
        plan,
        message: "Hidden baseline context is required. Visit Settings to add your DOB, TOB, and POB.",
        limits: { remainingToday }
      },
      {
        headers: {
          "set-cookie": cookieHeader(sid),
          "cache-control": "no-store"
        }
      }
    );
  }

  // Enforce free daily usage limit
  if (plan === "free") {
    const usage = await useOne(env, sid);
    if (!usage.ok) {
      return Response.json(
        {
          type: "ok",
          requestId: crypto.randomUUID(),
          mode: input.mode,
          result: {
            whatsGoingOn: "You’ve hit today’s free limit.",
            whyRepeating: "This keeps the free tier reliable for everyone.",
            nextStep: "Try again tomorrow or upgrade to Pro.",
            limits: "If you’re in immediate risk, use support resources first.",
            confidence: "Not enough information"
          },
          chips: ["Upgrade to Pro", "Try again tomorrow"],
          audio: { title: "Overview", script: "Free limit reached.", format: "overview" },
          video: { format: "vertical", scenes: [] },
          confidence: "Not enough information",
          plan,
          limits: { remainingToday: usage.remaining }
        } satisfies ExplainResponse,
        { status: 429 }
      );
    }
  }

  // Safety routing first
  if (safetyMode(input.text || "") === "support") {
    const resp = supportResponse();
    return Response.json(resp, {
      headers: {
        "set-cookie": cookieHeader(sid)
      }
    });
  }

  const requestId = crypto.randomUUID();
  const userPrompt = buildUserPrompt({
    mode: input.mode,
    question: input.question || "Explain this",
    text: input.text || "",
    people: input.people || [],
    baselineContext: formatBaseline(baseline)
  });

  const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
  const ai = await env.AI.run(modelId, {
    messages: [
      { role: "system", content: SYSTEM_RULES },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 350
  });

  const parsed = safeJsonParse<ExplainResult>(String(ai.response ?? ""));
  const result = parsed ?? fallbackResult();
  const chips = flatChips(input.mode).slice(0, 12);

  const response: ExplainResponse = {
    type: "ok",
    requestId,
    mode: input.mode,
    result,
    chips,
    audio: { title: "Audio overview", script: audioScript(result), format: "overview" },
    video: { format: "vertical", scenes: videoScenes(result) },
    confidence: result.confidence,
    plan,
    limits: { remainingToday }
  };

  return Response.json(response, {
    headers: {
      "set-cookie": cookieHeader(sid),
      "cache-control": "no-store"
    }
  });
}
