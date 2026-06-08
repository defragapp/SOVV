iutodeployment on mport type { Env } from "./types-env.js";
import { getAuthUser, jsonResponse } from "./auth.js";
import { getSessionId, cookieHeader, checkFreeLimit } from "./plan.js";
import { getBaseline, formatBaseline } from "./baseline.js";
import { getPatterns, formatPatternsForPrompt, insertInteraction } from "./db.js";
import { extractPatterns } from "./patterns.js";
import { requireActiveSubscription } from "./billing.js";
import type {
  ExplainRequest,
  ExplainResponse,
  Insight,
  Move,
  PressurePoint,
  Shift,
  Confidence,
  ThreadMeta,
} from "@sovereign/core";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_SELF = `You are Sovereign — a perspective-shift engine, not a therapist.

Help the user see what they couldn't see from inside the moment.

Rules:
- Never diagnose, pathologize, or clinicalize
- Never say "it sounds like" or "I hear that"
- Be direct, specific, and structural
- Name the pattern, not the symptom
- Always provide a concrete move
- If baseline or historical patterns are provided, use them for continuity without naming internal storage

Respond in this exact JSON format only, no markdown, no code fences:
{
  "response": "2-4 sentences reframing what they described",
  "shift": { "label": "Short shift name", "summary": "One sentence explaining the shift" },
  "move": { "label": "Short action name", "description": "Specific concrete next step", "difficulty": "gentle|moderate|direct" },
  "insights": [{ "id": "ins_001", "type": "pattern", "title": "Short title", "detail": "What the pattern is", "source": "baseline" }]
}`;

const SYSTEM_RELATIONAL = `You are Sovereign — a perspective-shift engine for relational dynamics.

When a target person is provided, analyze the structural tension between the user and that person.

Rules:
- Never take sides, never diagnose either person
- Name the dynamic, not the blame
- Show both sides of the tension
- Be structural, not sentimental
- If baseline or historical patterns are provided, use them for continuity without naming internal storage

Respond in this exact JSON format only, no markdown, no code fences:
{
  "response": "2-4 sentences about the dynamic",
  "shift": { "label": "Short shift name", "summary": "One sentence explaining the shift" },
  "pressure_points": [{ "type": "emotional|structural|communication", "label": "Short name", "description": "What the tension is", "yours": "Your side", "theirs": "Their side" }],
  "move": { "label": "Short action name", "description": "Specific concrete next step", "difficulty": "gentle|moderate|direct" },
  "insights": [{ "id": "ins_001", "type": "pattern|dynamic|baseline", "title": "Short title", "detail": "What this reveals", "source": "baseline|comparison|conversation" }]
}`;

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  return value ? JSON.stringify(value) : "";
}

function parseJsonFromText(text: string): Record<string, any> {
  const trimmed = text.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return {};

  try {
    return JSON.parse(match[0]) as Record<string, any>;
  } catch {
    return {};
  }
}

function normalizeShift(input: any): Shift {
  if (input && typeof input.label === "string" && typeof input.summary === "string") {
    return input;
  }
  return { label: "Unclear", summary: "The shift is still forming" };
}

function normalizeMove(input: any): Move {
  if (
    input &&
    typeof input.label === "string" &&
    typeof input.description === "string" &&
    (input.difficulty === "gentle" || input.difficulty === "moderate" || input.difficulty === "direct")
  ) {
    return input;
  }
  return {
    label: "Sit with it",
    description: "Let this settle before acting",
    difficulty: "gentle",
  };
}

function normalizeInsights(input: any): Insight[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => item && typeof item.id === "string")
    .map((item) => ({
      id: item.id,
      type: item.type === "dynamic" || item.type === "baseline" ? item.type : "pattern",
      title: typeof item.title === "string" ? item.title : "Insight",
      detail: typeof item.detail === "string" ? item.detail : "",
      source:
        item.source === "comparison" || item.source === "conversation" || item.source === "baseline"
          ? item.source
          : "conversation",
    }));
}

function normalizePressurePoints(input: any): PressurePoint[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const points = input
    .filter((item) => item && typeof item.label === "string" && typeof item.description === "string")
    .map((item) => ({
      type:
        item.type === "structural" || item.type === "communication" ? item.type : "emotional",
      label: item.label,
      description: item.description,
      yours: typeof item.yours === "string" ? item.yours : undefined,
      theirs: typeof item.theirs === "string" ? item.theirs : undefined,
    }));
  return points.length ? points : undefined;
}

function buildUserPrompt(args: {
  message: string;
  baselineText: string;
  patternText: string;
  targetName?: string | undefined;
  targetBaseline?: unknown;
}) {
  const targetSection = args.targetName
    ? `\nTarget person: ${args.targetName}${args.targetBaseline ? `\nTarget baseline: ${asText(args.targetBaseline)}` : ""}`
    : "";

  const contextSection = [args.baselineText, args.patternText].filter(Boolean).join("\n\n");

  return `${contextSection ? `Context:\n${contextSection}\n\n` : ""}Message:\n${args.message}${targetSection}`;
}

export async function handleExplain(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401, CORS_HEADERS);
  }

  // Subscription gate: require active subscription for workspace access
  const subGate = await requireActiveSubscription(user, req);
  if (subGate) return subGate;

  const sid = await getSessionId(req);

  // Free tier daily usage limit check
  const isPro = user.subscription_status === "active" || user.tier === "pro";
  if (!isPro) {
    const limit = await checkFreeLimit(env, sid);
    if (!limit.allowed) {
      return jsonResponse({
        error: "daily_limit_reached",
        message: "You've reached your free daily limit. Upgrade to Pro for unlimited usage.",
        remaining: 0,
      }, 429, { ...CORS_HEADERS, "set-cookie": cookieHeader(sid) });
    }
  }
  const body = (await req.json().catch(() => ({}))) as Partial<ExplainRequest> & {
    question?: string;
    text?: string;
    mode?: string;
    people?: Array<{ id: string; relation?: string; name?: string }>;
  };

  const message = String(body.message ?? body.question ?? body.text ?? "").trim();
  if (!message) {
    return jsonResponse({ error: "message_required" }, 400, {
      ...CORS_HEADERS,
      "set-cookie": cookieHeader(sid),
    });
  }

  const target = body.target;
  const relational = Boolean(target);
  const mode = (body.mode ?? (relational ? "pair" : "self")) as string;

  if (relational && user.tier === "free") {
    return jsonResponse(
      { error: "Relational analysis requires Pro" },
      403,
      { ...CORS_HEADERS, "set-cookie": cookieHeader(sid) }
    );
  }

  const baseline = await getBaseline(env, sid);
  if (!baseline || !baseline.dob || !baseline.tob?.value || !baseline.pob) {
    return jsonResponse(
      { type: "needs_baseline" },
      200,
      { ...CORS_HEADERS, "set-cookie": cookieHeader(sid) }
    );
  }

  const patterns = await getPatterns(env.DB, sid);
  const baselineText = formatBaseline(baseline);
  const patternText = formatPatternsForPrompt(patterns);
  const targetBaseline =
    relational && target
      ? await env.KV.get(`baseline:${user.id}:person:${target.id}`, "json")
      : null;

  const userPrompt = buildUserPrompt({
    message,
    baselineText,
    patternText,
    targetName: target ? target.relation : undefined,
    targetBaseline,
  });

  const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
  const ai = await env.AI.run(modelId, {
    messages: [
      { role: "system", content: relational ? SYSTEM_RELATIONAL : SYSTEM_SELF },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.35,
    max_tokens: 900,
  });

  const rawText = asText((ai as any).response ?? ai);
  const parsed = parseJsonFromText(rawText);

  const threadMeta: ThreadMeta = {
    baseline_loaded: true,
    ...(target?.id !== undefined ? { target_id: target.id } : {}),
    ...(target?.relation !== undefined ? { target_relation: target.relation } : {}),
    ...(relational ? { target_baseline_loaded: Boolean(targetBaseline) } : {}),
  };

  const pressurePoints = normalizePressurePoints(parsed.pressure_points);

  const result: ExplainResponse = {
    response: typeof parsed.response === "string" ? parsed.response : rawText,
    shift: normalizeShift(parsed.shift),
    ...(pressurePoints !== undefined ? { pressure_points: pressurePoints } : {}),
    move: normalizeMove(parsed.move),
    insights: normalizeInsights(parsed.insights),
    thread_meta: threadMeta,
  };

  const interactionId = `int_${crypto.randomUUID().replace(/-/g, "")}`;
  const confidence: Confidence = result.insights.length
    ? "Medium"
    : "Not enough information";

  await insertInteraction(env.DB, {
    id: interactionId,
    session_id: sid,
    mode,
    question: message,
    text: message,
    people: target ? [{ id: target.id, relation: target.relation, name: target.relation }] : [],
    result: result as unknown as Record<string, unknown>,
    confidence,
  });

  if (env.QUEUE) {
    // Offload pattern extraction to a queue to avoid delaying the response.
    await env.QUEUE.send({ sessionId: sid, interactionId });
  } else {
    // Fallback for local dev or if queue is not configured.
    console.warn("QUEUE binding not found. Running pattern extraction in a non-blocking way, but this may be unreliable.");
    void extractPatterns(env, sid, interactionId);
  }

  return jsonResponse(result, 200, {
    ...CORS_HEADERS,
    "set-cookie": cookieHeader(sid),
  });
}

export async function registerExplainRoute(router: any, getEnv: () => Env) {
  router.post("/api/explain", async (request: Request) => {
    const env = getEnv();
    return handleExplain(request, env);
  });
}