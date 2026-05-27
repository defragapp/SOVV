import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { safeJsonParse } from "@sovereign/core";
import { flatChips } from "@sovereign/core";
import { safetyMode, supportResponse } from "./safety.ts";
import { SYSTEM_RULES, buildUserPrompt } from "./prompt.ts";
import { getSessionId, getPlan, cookieHeader } from "./plan.ts";
import { useOne } from "./kv.ts";
import { getBaseline, formatBaseline } from "./baseline.ts";
import { verifyAccessJWT } from "./auth.ts";
import { insertInteraction, getPatterns, formatPatternsForPrompt } from "./db.ts";

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

interface ExplainRequestBody {
  mode?: "self" | "situation" | "pair" | "group";
  question?: string;
  text?: string;
  people?: string[];
}

function isValidExplainRequest(body: unknown): body is ExplainRequestBody {
  if (typeof body !== "object" || body === null) return false;
  // This is a basic check. For more complex validation, a library like Zod would be beneficial.
  const req = body as Record<string, unknown>;
  return (typeof req.question === "string" || typeof req.question === "undefined");
}

export async function handleExplain(req: Request, env: Env, ctx: ExecutionContext) {
  const user = await verifyAccessJWT(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sid = await getSessionId(req);
  const plan = await getPlan(env, sid);
  const freeLimit = Number(env.FREE_DAILY_LIMIT || "15");
  const remainingToday = plan === "free" ? freeLimit : 9999;

  const body: unknown = await req.json().catch(() => null);

  if (!isValidExplainRequest(body)) {
    return new Response("Invalid request body.", { status: 400 });
  }

  const input = {
    mode: body.mode || "self",
    question: body.question || "",
    text: body.text || "",
    people: body.people || [],
  };

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
    const rateLimit = env.RATE_LIMITER
      ? await env.RATE_LIMITER.limit({ key: sid })
      : { success: true, remaining: 999 };

    if (!usage.ok || !rateLimit.success) {import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./types-env.js";
import { safeJsonParse, flatChips, BaselineRecord, BASELINE_VERSION } from "@sovereign/core";
import { safetyMode, supportResponse } from "./safety.ts";
import { SYSTEM_RULES, buildUserPrompt } from "./prompt.ts";
import { getSessionId, getPlan, cookieHeader } from "./plan.ts";
import { useOne } from "./kv.ts";
import { getBaseline, formatBaseline } from "./baseline.ts";
import { verifyAccessJWT } from "./auth.ts";
import { insertInteraction, getPatterns, formatPatternsForPrompt } from "./db.ts";

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
  return "What's happening: " + r.frame + "\n\nWhat this is pressing on: " + r.pressure + "\n\nWhat's getting activated: " + r.activation + "\n\nWhat steadies you: " + r.shift;
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

interface ExplainRequestBody {
  mode?: "self" | "situation" | "pair" | "group";
  question?: string;
  text?: string;
  people?: string[];
}

function isValidExplainRequest(body: unknown): body is ExplainRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const req = body as Record<string, unknown>;
  return (typeof req.question === "string" || typeof req.question === "undefined");
}

export async function handleExplain(req: Request, env: Env, ctx: ExecutionContext) {
  const user = await verifyAccessJWT(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sid = await getSessionId(req);
  const plan = await getPlan(env, sid);
  const freeLimit = Number(env.FREE_DAILY_LIMIT || "15");
  const remainingToday = plan === "free" ? freeLimit : 9999;

  const body: unknown = await req.json().catch(() => null);

  if (!isValidExplainRequest(body)) {
    return new Response("Invalid request body.", { status: 400 });
  }

  const input = {
    mode: body.mode || "self",
    question: body.question || "",
    text: body.text || "",
    people: body.people || [],
  };

  const baseline = await getBaseline(env, sid) as BaselineRecord | null;
  const isOutdated = baseline && baseline.version !== BASELINE_VERSION;

  if (!baseline || isOutdated) {
    return Response.json(
      {
        type: "needs_baseline",
        requestId: crypto.randomUUID(),
        mode: input.mode,
        plan,
        message: isOutdated
          ? "Your baseline context needs to be updated for the new version. Visit Settings to refresh your profile."
          : "Hidden baseline context is required. Visit Settings to add your DOB, TOB, and POB.",
        limits: { remainingToday },
      },
      {
        headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
      }
    );
  }

  const patterns = await getPatterns(env, sid);
  const systemPrompt = SYSTEM_RULES;
  const userPrompt = buildUserPrompt({
    ...input,
    baseline: formatBaseline(baseline),
    patterns: formatPatternsForPrompt(patterns),
  });

  const safety = await safetyMode(input.question + " " + input.text);
  if (safety.flagged) {
    return supportResponse(safety.reason);
  }

  const requestId = crypto.randomUUID();
  const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const result = safeJsonParse(response.response, fallbackResult());

  ctx.waitUntil(
    insertInteraction(env, sid, {
      id: requestId,
      userId: user.id,
      input,
      output: result,
      model: "@cf/meta/llama-3-8b-instruct",
    })
  );

  return Response.json(
    {
      ...result,
      type: "explain",
      requestId,
      audioScript: audioScript(result),
      videoScenes: videoScenes(result),
      limits: { remainingToday },
    },
    {
      headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
    }
  );
}
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
          limits: { remainingToday: usage.ok ? rateLimit.remaining : usage.remaining },
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
        // Send message to queue for background processing
        await env.PATTERN_QUEUE.send({ sessionId: sid, interactionId: requestId });
      } catch (err) {
        // Non-critical, but good to log for debugging
        console.error(`Failed to insert interaction or queue pattern extraction for sid: ${sid}`, err);
      }
    })()
  );

  return Response.json(response, {
    headers: { "set-cookie": cookieHeader(sid), "cache-control": "no-store" },
  });
}
