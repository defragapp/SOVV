import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { safeJsonParse } from "@sovereign/core";
import { flatChips } from "@sovereign/core";
import { safetyMode, supportResponse } from "./safety.js";
import { SYSTEM_RULES, buildUserPrompt } from "./prompt.js";
import { getSessionId, getPlan, cookieHeader } from "./plan.js";
import { useOne } from "./kv.js";
import { getBaseline, formatBaseline } from "./baseline.js";
import { insertInteraction, getPatterns, formatPatternsForPrompt } from "./db.js";
import { extractPatterns } from "./patterns.js";

async function hash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fallbackResult() {
  return {
    whatsGoingOn: "I may not have enough detail to explain this clearly yet.",
    whyRepeating: "A bit more context would help identify what is repeating.",
    nextStep: "Add what happened right before and right after.",
    frame: "The moment is still forming.",
    pressure: "Insufficient detail to name the pressure.",
    activation: "Internal state unclear.",
    rising: "Observation requires more context.",
    field: "Relational dynamic unknown.",
    shift: "What steadies you requires more detail.",
    opening: "Observe how the story opens.",
    limits: "If there is safety risk or ongoing disrespect, get support first.",
    confidence: "Low",
  };
}

function audioScript(r: Record<string, string>) {
  return `What's happening: ${r.frame}\n\nWhat this is pressing on: ${r.pressure}\n\nWhat's getting activated: ${r.activation}\n\nWhat steadies you: ${r.shift}\n\nWhat opens the story: ${r.opening}`;
}

function videoScenes(r: Record<string, string>) {
  return [
    { type: "messages", title: "What's happening", text: r.frame, seconds: 8 },
    { type: "pattern", title: "What's activated", text: r.activation, seconds: 10 },
    { type: "rewrite", title: "From their side", text: r.field, seconds: 7 },
    { type: "action", title: "What steadies you", text: r.shift, seconds: 8 },
    { type: "confidence", title: "Confidence", text: r.confidence, seconds: 4 },
  ];
}

export async function handleExplain(req: Request, env: Env, ctx: ExecutionContext) {
  const sid = await getSessionId(req);
  const plan = await getPlan(env, sid);
  const freeLimit = Number(env.FREE_DAILY_LIMIT || "15");
  const remainingToday = plan === "free" ? freeLimit : 9999;

  const body = await req.json().catch(() => null);
  const input =
    body && typeof (body as any).question === "string"
      ? {
          mode: (body as any).mode || "self",
          question: (body as any).question,
          text: (body as any).text || "",
          people: (body as any).people || [],
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
        limits: { remainingToday },
      },
      {
        headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
      }
    );
  }

  if (plan === "free") {
    const usage = await useOne(env, sid);
    if (!usage.ok) {
    const rateLimit = await env.RATE_LIMITER.limit({ key: sid });
    if (!rateLimit.success) {
      return Response.json(
        {
          type: "ok",
          requestId: crypto.randomUUID(),
          mode: input.mode,
          result: {
            whatsGoingOn: "You've hit today's free limit.",
            whyRepeating: "This keeps the free tier reliable for everyone.",
            nextStep: "Try again tomorrow or upgrade to Pro.",
            limits: "If you're in immediate risk, use support resources first.",
            confidence: "Not enough information",
            frame: "Limit reached.",
            pressure: "Daily execution capped.",
            activation: "Maintain system integrity.",
            rising: "Expansion paused.",
            field: "Access restricted.",
            shift: "Return tomorrow.",
            opening: "Elevate to Pro.",
          },
          chips: ["Upgrade to Pro", "Try again tomorrow"],
          audio: { title: "Overview", script: "Free limit reached.", format: "overview" },
          video: { format: "vertical", scenes: [] },
          confidence: "Not enough information",
          plan,
          limits: { remainingToday: usage.remaining },
          limits: { remainingToday: rateLimit.remaining },
        },
        { status: 429 }
      );
    }
  }

  if (safetyMode(input.text || "") === "support") {
    const resp = supportResponse();
    return Response.json(resp, {
      headers: { "set-cookie": cookieHeader(sid) },
    });
  }

  const requestId = crypto.randomUUID();

  // ─── AI Response Cache (Cost Optimization) ───
  const cacheKey = `explain:${sid}:${await hash(input.text || "")}`;
  const cached = await env.KV.get(cacheKey);
  if (cached) {
    return Response.json(JSON.parse(cached), { headers: { "set-cookie": cookieHeader(sid) } });
  }

  // ─── Memory Layer: Fetch known patterns ───
  let memoryContext = "";
  try {
    const patterns = await getPatterns(env.DB, sid);
    memoryContext = formatPatternsForPrompt(patterns);
  } catch {
    // D1 not available or table missing — continue without memory
  }

  // Build prompt with memory context injected
  const userPrompt = buildUserPrompt({
    mode: input.mode as any,
    question: input.question || "Explain this",
    text: input.text || "",
    people: input.people || [],
    baselineContext: formatBaseline(baseline),
  });

  const fullUserPrompt = memoryContext
    ? `${memoryContext}\n\n${userPrompt}`
    : userPrompt;

  const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
  const ai = await env.AI.run(modelId, {
    messages: [
      { role: "system", content: SYSTEM_RULES },
      { role: "user", content: fullUserPrompt },
    ],
    temperature: 0.2,
    max_tokens: 350,
  });

  const parsed = safeJsonParse<any>(String(ai.response ?? ""));
  const result = parsed ?? fallbackResult();
  const chips = flatChips(input.mode as any).slice(0, 12);

  const response = {
    type: "ok",
    requestId,
    mode: input.mode,
    result,
    chips,
    audio: { title: "Audio overview", script: audioScript(result), format: "overview" },
    video: { format: "vertical", scenes: videoScenes(result) },
    confidence: result.confidence,
    plan,
    limits: { remainingToday },
  };

  // Store result in cache
  await env.KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 3600 });

  // ─── Memory Layer: Log interaction + extract patterns (background) ───
  ctx.waitUntil(
    (async () => {
      try {
        await insertInteraction(env.DB, {
          id: requestId,
          session_id: sid,
          mode: input.mode,
          question: input.question,
          text: input.text,
          people: input.people,
          result,
          confidence: result.confidence || "Low",
        });

        // Run pattern extraction after logging
        await extractPatterns(env, sid, requestId);
        // Offload durability to Pattern Queue for async processing
        await env.PATTERN_QUEUE.send({ requestId, sid, input, result });
      } catch {
        // Non-critical — don't block or fail the response
      }
    })()
  );

  return Response.json(response, {
    headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
  });
}
