import type { Env } from "./types-env.js"
import { SYSTEM_DEFRAG, SYSTEM_DEFRAG_RELATIONAL } from "./prompts.js"
import { getFeatureFlags } from "./featureFlags.js"
import { validateAndScore, buildRetryPrompt, parseAIOutput, checkGuardrails } from "./output-validator.js"
import { loadMemoryContext, formatMemoryForPrompt } from "./memory.js"
import { suggestNextSpace, formatFlowSuggestion } from "./flow.js";
import { getAuthUser, jsonResponse } from "./auth.js";
import { checkAiRateLimit } from "./middleware/ai-rate-limit.js";
import { resolveEntitlements, requireEntitlement } from "./entitlements.js";
import { emitMetric } from "./analytics.js";
import { getSessionId, cookieHeader, checkFreeLimit } from "./plan.js";
import { getBaseline, formatBaseline, getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { getCurrentSkySnapshot } from "./baseline-compiler.js";
import { getPatterns, formatPatternsForPrompt, insertInteraction } from "./db.js";
import { extractPatterns } from "./patterns.js";
import {
  selectActiveSignals,
  buildBaselineSignature,
  buildTimingSignals,
  buildOverlaySignals,
  buildRailData,
  formatActiveSignalsForPrompt,
} from "./active-signals.js";

/**
 * CRITICAL SYSTEM RULE
 *
 * Full baseline compute is never used directly in prompts or UI.
 * All reasoning must pass through the active signal selection layer.
 *
 * If this rule breaks, the system will drift back into:
 * - framework dumping
 * - prompt hallucination
 * - inconsistent outputs
 */
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

import { getCorsHeaders } from "./cors.js";


// SYSTEM_SELF and SYSTEM_RELATIONAL removed — use SYSTEM_DEFRAG / SYSTEM_DEFRAG_RELATIONAL from prompts.ts

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

export function normalizeShift(input: any): Shift {
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

export function normalizeInsights(input: any): Insight[] {
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
  activeSignalsText?: string;
  targetName?: string | undefined;
  targetBaseline?: unknown;
}) {
  const targetSection = args.targetName
    ? `\nTarget person: ${args.targetName}${args.targetBaseline ? `\nTarget baseline: ${asText(args.targetBaseline)}` : ""}`
    : "";

  const contextSection = [
    args.activeSignalsText,
    args.baselineText,
    args.patternText,
  ].filter(Boolean).join("\n\n");

  return `${contextSection ? `Context:\n${contextSection}\n\n` : ""}Message:\n${args.message}${targetSection}`;
}

export async function handleExplain(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // Auth check
  const user = await getAuthUser(req, env.DB);
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401, getCorsHeaders(req));
  }

  const sid = await getSessionId(req);
  const entitlements = resolveEntitlements(user);
  const isPro = entitlements.effectiveTier === "pro";

  // Per-user AI rate limit (per-minute + burst protection)
  if (env.KV) {
    const rateLimitResponse = await checkAiRateLimit({ kv: env.KV, request: req, userId: user.id, isPro });
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Free tier daily usage limit check
  if (!isPro) {
    const limit = await checkFreeLimit(env, sid);
    if (!limit.allowed) {
      return jsonResponse({
        error: "daily_limit_reached",
        message: "You've reached your free daily limit. Upgrade to Pro for unlimited usage.",
        remaining: 0,
      }, 429, { ...getCorsHeaders(req), "set-cookie": cookieHeader(sid) });
    }
  }
  const body = (await req.json().catch(() => ({}))) as Partial<ExplainRequest> & {
    question?: string;
    text?: string;
    mode?: string;
    people?: Array<{ id: string; relation?: string; name?: string }>;
  };

  const message = String(body.message ?? body.question ?? body.text ?? "").trim();
  
  // Minimum input quality gate: require at least 10 words for meaningful pattern analysis
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  if (!message) {
    return jsonResponse({ error: "message_required" }, 400, {
      ...getCorsHeaders(req),
      "set-cookie": cookieHeader(sid),
    });
  }
  
  // Short input guard: very short inputs produce low-quality pattern analysis
  if (wordCount < 5) {
    return jsonResponse(
      { 
        error: "input_too_short",
        message: "Please describe the situation in a bit more detail — at least a sentence or two gives the system enough to work with.",
        type: "input_too_short"
      },
      400,
      { ...getCorsHeaders(req), "set-cookie": cookieHeader(sid) }
    );
  }

  const target = body.target;
  const relational = Boolean(target);
  const mode = (body.mode ?? (relational ? "pair" : "self")) as string;

  // Relational mode requires Pro subscription (uses entitlements)
  if (relational) {
    const relGate = requireEntitlement(entitlements, "canInvite");
    if (relGate) return relGate;
  }

  if (relational && entitlements.effectiveTier === "free") {
    return jsonResponse(
      { error: "Relational analysis requires Pro" },
      403,
      { ...getCorsHeaders(req), "set-cookie": cookieHeader(sid) }
    );
  }

  const baseline = await getBaseline(env, sid);
  if (!baseline || !baseline.dob || !baseline.tob?.value || !baseline.pob) {
    return jsonResponse(
      { type: "needs_baseline" },
      200,
      { ...getCorsHeaders(req), "set-cookie": cookieHeader(sid) }
    );
  }

  const patterns = await getPatterns(env.DB, sid);
  // Use computed dataset if available, fallback to raw baseline format
  const baselineText = await getBaselineForAI(env, sid, "defrag").catch(() => formatBaseline(baseline));
  const patternText = formatPatternsForPrompt(patterns);

  // Load memory context — recurring patterns from past sessions
  const memoryContext = await loadMemoryContext(env, user.id).catch(() => null);
  const memoryText = memoryContext ? formatMemoryForPrompt(memoryContext) : "";
  const targetBaseline =
    relational && target
      ? await env.KV.get(`baseline:${user.id}:person:${target.id}`, "json")
      : null;

  // ── Active signal selection ───────────────────────────────────────────────
  // Derive reduced behavioral signals from full compute.
  // Only active signals reach the AI — full compute stays server-side.
  const dataset = await getBaselineDataset(env, sid, user.id).catch(() => null);
  let activeSignalsText = "";
  let railData = null;
  let signatureLine = "";

  if (dataset?.status === "ready") {
    const activeSignals = selectActiveSignals(dataset, {
      message,
      relational,
      mode: (mode as any) ?? (relational ? "pair" : "self"),
    });

    // Fetch live sky positions for current timing context
    // Uses user's birth location as proxy for current location
    // Cached in KV for 6 hours to avoid excessive API calls
    const userLat = dataset.input.latitude ?? 0;
    const userLng = dataset.input.longitude ?? 0;
    const liveSky = (userLat !== 0 || userLng !== 0)
      ? await getCurrentSkySnapshot(env, userLat, userLng).catch(() => null)
      : null;

    const timingSignals = buildTimingSignals(dataset, liveSky);
    const signature = buildBaselineSignature(dataset);
    const overlaySignals = relational
      ? buildOverlaySignals(activeSignals)
      : undefined;

    activeSignalsText = formatActiveSignalsForPrompt(activeSignals, timingSignals, overlaySignals);
    railData = buildRailData(activeSignals, timingSignals, signature, overlaySignals);
    signatureLine = signature.line;
  }

  const userPrompt = buildUserPrompt({
    message,
    baselineText,
    patternText: [patternText, memoryText].filter(Boolean).join("\n\n"),
    activeSignalsText: activeSignalsText || undefined,
    targetName: target ? target.relation : undefined,
    targetBaseline,
  });

  const modelId = env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const ai = await env.AI.run(modelId, {
    messages: [
      { role: "system", content: relational ? SYSTEM_DEFRAG_RELATIONAL : SYSTEM_DEFRAG },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.35,
    max_tokens: 900,
  }, {
    gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" }
  });

  let rawText = asText((ai as any).response ?? ai);

  // ── Validate, score, and retry if needed ─────────────────────────────────
  let validation = validateAndScore(rawText, "defrag")

  // Retry once if output is completely empty (no JSON parsed at all)
  if (validation.shouldRetry) {
    console.warn("[Retry] Defrag output empty — retrying with correction prompt")
    const retryMessages = [
      { role: "system", content: relational ? SYSTEM_DEFRAG_RELATIONAL : SYSTEM_DEFRAG },
      { role: "user", content: userPrompt },
      { role: "assistant", content: rawText },
      { role: "user", content: buildRetryPrompt("defrag", validation.missing) },
    ]
    const retryAi = await env.AI.run(modelId, {
      messages: retryMessages,
      temperature: 0.2,
      max_tokens: 900,
    }, { gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" } })
    rawText = asText((retryAi as any).response ?? retryAi)
    validation = validateAndScore(rawText, "defrag")
  }

  const parsed = validation.output

  // Log guardrail violations
  if (!validation.guardrails.passed) {
    console.warn("[Guardrail] Defrag violations:", validation.guardrails.violations)
  }

  // Extract confidence score for client
  const outputConfidence = (validation.scoring as any).confidence ?? 0.5
  const signalStrength = (validation.scoring as any).signalStrength ?? "medium"

  // Empty result guard — if AI returned nothing useful after retry
  if (!parsed.activePattern && !parsed.alignment && !parsed.summary) {
    return jsonResponse(
      { error: "incomplete_output", message: "The system couldn't read this moment clearly. Try describing it differently." },
      200,
      { ...getCorsHeaders(req), "set-cookie": cookieHeader(sid) }
    )
  }

  // Flow suggestion — Defrag → Alignment chain
  // Use AI's nextSpace field if provided, fall back to keyword matching
  const aiNextSpace = (parsed as any).nextSpace as "ALIGNMENT" | "COVENANT" | null | undefined
  const flowSuggestion = aiNextSpace !== undefined
    ? (aiNextSpace ? { nextSpace: aiNextSpace, reason: "ai_suggested", prefillContext: (parsed as any).alignment || "", urgency: "medium" as const } : null)
    : suggestNextSpace(parsed)

  const result = {
    id: crypto.randomUUID(),
    workspaceSource: "DEFRAG",
    createdAt: new Date().toISOString(),
    title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    // AI output fields — pass through as-is (undefined = AI omitted intentionally)
    summary: parsed.summary || parsed.response || undefined,
    activePattern: parsed.activePattern || undefined,
    theRepeat: parsed.theRepeat || undefined,
    oldRole: parsed.oldRole || undefined,
    whatYouLearnedToCarry: parsed.whatYouLearnedToCarry || undefined,
    strainPattern: parsed.strainPattern || undefined,
    giftUnderStrain: parsed.giftUnderStrain || undefined,
    alignment: parsed.alignment || undefined,
    bestNextResponse: parsed.bestNextResponse || undefined,
    conversationalSteering: ((parsed.conversationalSteering as any)?.do?.length || (parsed.conversationalSteering as any)?.avoid?.length)
      ? parsed.conversationalSteering
      : undefined,
    sourcesUsed: {
      baseline: true,
      history: Boolean(patternText),
      invitedUsers: Boolean(relational),
    },
    media: {
      audioOverviewAvailable: isPro,
      watchPreviewAvailable: false,
    },
  };

  const interactionId = `int_${crypto.randomUUID().replace(/-/g, "")}`;
  const confidence: Confidence = "Medium";

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
    await env.QUEUE.send({ sessionId: sid, interactionId: interactionId });
  } else {
    // Fallback for local dev or if queue is not configured.
    console.warn("QUEUE binding not found. Running pattern extraction in a non-blocking way, but this may be unreliable.");
    void extractPatterns(env, sid, interactionId);

    // Save pattern to memory for future sessions (non-blocking)
    if (parsed.activePattern) {
      import("./memory.js").then(({ savePatternMemory }) => {
        savePatternMemory(env, user.id, parsed as Record<string, unknown>, "DEFRAG").catch(() => {});
      }).catch(() => {});
    }
  }

  // Emit analytics metric
  emitMetric(env, "ai_request", {
    space: "defrag",
    userId: user.id,
    success: true,
    tier: entitlements.effectiveTier,
  });

  return jsonResponse(result, 200, {
    ...getCorsHeaders(req),
    "set-cookie": cookieHeader(sid),
  });
}

export async function registerExplainRoute(router: any, getEnv: () => Env) {
  router.post("/api/explain", async (request: Request) => {
    const env = getEnv();
    return handleExplain(request, env);
  });
}