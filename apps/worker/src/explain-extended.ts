import type { Env } from "./types-env.js"
import { SYSTEM_DEFRAG, SYSTEM_DEFRAG_RELATIONAL } from "./prompts.js"
import { getFeatureFlags } from "./featureFlags.js"
import { validateAndScore, buildRetryPrompt, parseAIOutput } from "./output-validator.js"
import { loadMemoryContext, formatMemoryForPrompt } from "./memory.js"
import { suggestNextSpace, formatFlowSuggestion } from "./flow.js";
import { getAuthUser, jsonResponse } from "./auth.js";
import { getSessionId, cookieHeader, checkFreeLimit } from "./plan.js";
import { getBaseline, formatBaseline, getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { getPatterns, formatPatternsForPrompt, insertInteraction } from "./db.js";
import { extractPatterns } from "./patterns.js";
import { requireActiveSubscription } from "./billing.js";
import {
  selectActiveSignals,
  buildBaselineSignature,
  buildTimingSignals,
  buildOverlaySignals,
  buildRailData,
  formatActiveSignalsForPrompt,
} from "./active-signals.js";
import { validateRequest } from "./middleware/validate-request.js";
import { RateLimiter, extractRateLimitKey, RATE_LIMIT_PRESETS } from "./middleware/rate-limiter.js";
import { KVSafetyLogger, createSafetyEvent } from "./middleware/safety-logger.js";
import { generateRequestId } from "./utils/request-id.js";
import { z } from "zod";

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

import { getCorsHeaders } from "./cors.js"
import { safetyMode, supportResponse } from "./safety.js";


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
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "defrag_response_parse_failed",
      endpoint: "defrag",
      requestId: "internal",
      reason: "unknown_failure",
      error,
    });
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

function buildProtectiveFallbackResult(message: string) {
  return {
    id: crypto.randomUUID(),
    workspaceSource: "DEFRAG",
    createdAt: new Date().toISOString(),
    title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    summary: "The system is stabilizing under elevated traffic. Stay with the cleanest next move instead of solving everything at once.",
    activePattern: "Pressure rises when urgency starts making decisions for you.",
    theRepeat: "The loop is trying to turn this moment into something bigger than it is.",
    oldRole: "You may be stepping into responsibility that is not fully yours.",
    whatYouLearnedToCarry: "The reflex is to carry more than the moment actually requires.",
    strainPattern: "Overwork, overexplaining, or overmanaging will add weight here.",
    giftUnderStrain: "Clarity returns when you narrow the move to what is actually yours.",
    alignment: "A smaller, cleaner response gives you a better chance than a faster one.",
    bestNextResponse: {
      summary: "Name the next honest action and keep it contained.",
      phrasing: ["Here is what is mine to do next.", "I am not going to carry the whole outcome right now."],
    },
    conversationalSteering: {
      do: ["Stay concrete.", "Separate facts from pressure."],
      avoid: ["Do not solve the whole story.", "Do not manage the other person's reaction."],
    },
  };
}

export async function handleExplain(req: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  let safetyLogger: KVSafetyLogger | null = null;
  let rateLimiter: RateLimiter | null = null;
  let user: any = null;

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // Initialize safety infrastructure
    if (env.KV) {
      safetyLogger = new KVSafetyLogger(env.KV);
      rateLimiter = new RateLimiter(env.KV, RATE_LIMIT_PRESETS.normal);
    }

    user = await getAuthUser(req, env.DB);
    const sid = await getSessionId(req);

    // ════════════════════════════════════════════════════════════════════════
    // SAFETY LAYER 1: REQUEST VALIDATION
    // ════════════════════════════════════════════════════════════════════════
    const validationSchema = z.object({
      message: z.string().optional(),
      question: z.string().optional(),
      text: z.string().optional(),
      mode: z.string().optional(),
      target: z.any().optional(),
      people: z.array(z.any()).optional(),
    });

    const validationResult = await validateRequest(req, validationSchema, {
      validateContentType: true,
      maxBodySize: 100 * 1024, // 100KB
    });

    if (!validationResult.valid) {
      const errorResult = validationResult as { valid: false; error: any };
      if (safetyLogger && user) {
        await safetyLogger.log(
          createSafetyEvent(user.id, "validation_error", "low", {
            validation_field: errorResult.error.field,
            endpoint: "/api/explain",
          }, { requestId })
        );
      }
      return jsonResponse({
        error: errorResult.error.field,
        message: errorResult.error.error,
      }, errorResult.error.status, {
        ...getCorsHeaders(req),
        "set-cookie": cookieHeader(sid),
      });
    }

    const body = validationResult.data as any;
    const message = String(body.message ?? body.question ?? body.text ?? "").trim();

    if (!message) {
      return jsonResponse({ error: "message_required" }, 400, {
        ...getCorsHeaders(req),
        "set-cookie": cookieHeader(sid),
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // SAFETY LAYER 2: RISK DETECTION (non-blocking)
    // ════════════════════════════════════════════════════════════════════════
    if (safetyMode(message) === "support") {
      if (safetyLogger && user) {
        await safetyLogger.log(
          createSafetyEvent(user.id, "risk_word_detected", "high", {
            endpoint: "/api/explain",
          }, { requestId })
        );
      }
      return jsonResponse(supportResponse(), 200, {
        ...getCorsHeaders(req),
        "set-cookie": cookieHeader(sid),
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // SAFETY LAYER 3: RATE LIMITING
    // ════════════════════════════════════════════════════════════════════════
    if (rateLimiter) {
      const rateLimitKey = extractRateLimitKey(req, user?.id);
      const limitResult = await rateLimiter.checkLimit(rateLimitKey);

      if (!limitResult.allowed) {
        if (safetyLogger) {
          await safetyLogger.log(
            createSafetyEvent(user.id, "rate_limit_exceeded", "low", {
              endpoint: "/api/explain",
            }, { requestId })
          );
        }
        return jsonResponse({
          error: "rate_limit_exceeded",
          message: "Too many requests. Please wait a moment before trying again.",
        }, 429, {
          ...getCorsHeaders(req),
          "set-cookie": cookieHeader(sid),
        });
      }
    }

    // Free tier daily usage limit check
    const isPro = user?.subscription_status === "active" || user?.tier === "pro";
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

    // Input length limit — prevent abuse and control AI costs
    if (message.length > 2000) {
      return jsonResponse({ error: "Input too long. Please keep your message under 2000 characters." }, 400, {
        ...getCorsHeaders(req),
        "set-cookie": cookieHeader(sid),
      });
    }

    const target = body.target;
    const relational = Boolean(target);
    const mode = (body.mode ?? (relational ? "pair" : "self")) as "self" | "pair" | "group" | "situation";

    if (relational && ({} as any).tier === "free") {
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
    const targetBaseline =
      relational && target
        ? await env.KV.get(`baseline:${user?.id || sid}:person:${target.id}`, "json")
        : null;

    // ── Active signal selection ───────────────────────────────────────────────
    // Derive reduced behavioral signals from full compute.
    // Only active signals reach the AI — full compute stays server-side.
    const dataset = await getBaselineDataset(env, sid).catch(() => null);
    let activeSignalsText = "";
    let railData = null;
    let signatureLine = "";

    if (dataset?.status === "ready") {
      const activeSignals = selectActiveSignals(dataset, {
        message,
        relational,
        mode,
      });
      const timingSignals = buildTimingSignals(dataset);
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
      patternText,
      activeSignalsText: activeSignalsText || undefined,
      targetName: target ? target.relation : undefined,
      targetBaseline,
    });

    const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
    const ai = await env.AI.run(modelId, {
      messages: [
        { role: "system", content: relational ? SYSTEM_DEFRAG_RELATIONAL : SYSTEM_DEFRAG },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: tuneTokenBudget(900, serviceState.state, pressure.throttleLevel),
    }, {
      gateway: { id: env.GATEWAY_ID || "sovereign-code-agent" }
    });

    const rawText = asText((ai as any).response ?? ai);
    const parsed = parseJsonFromText(rawText) as any;


    const result = {
      id: crypto.randomUUID(),
      workspaceSource: "DEFRAG",
      createdAt: new Date().toISOString(),
      title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    summary: parsed.response || "",
    activePattern: parsed.activePattern || "This section needs more context.",
    theRepeat: parsed.theRepeat || "This section needs more context.",
    oldRole: parsed.oldRole || "This section needs more context.",
    whatYouLearnedToCarry: parsed.whatYouLearnedToCarry || "This section needs more context.",
    strainPattern: parsed.strainPattern || "This section needs more context.",
    giftUnderStrain: parsed.giftUnderStrain || "This section needs more context.",
    alignment: parsed.alignment || "This section needs more context.",
    bestNextResponse: parsed.bestNextResponse || { summary: "This section needs more context.", phrasing: [] },
    conversationalSteering: (() => {
      const cs = parsed.conversationalSteering
      if (!cs || typeof cs !== "object") return { do: [], avoid: [] }
      return {
        do: Array.isArray((cs as any).do) ? (cs as any).do : [],
        avoid: Array.isArray((cs as any).avoid) ? (cs as any).avoid : [],
      }
    })(),
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
    logSafetyEvent({
      level: "warn",
      event: "pattern_queue_binding_missing",
      request: req,
      error_type: "system",
      details: { sessionId: sid, interactionId },
    });
    void extractPatterns(env, sid, interactionId).catch((error) => {
      logSafetyEvent({
        level: "error",
        event: "pattern_fallback_extraction_failed",
        request: req,
        error_type: "system",
        error,
        details: { sessionId: sid, interactionId },
      });
    });
  }

  return jsonResponse(result, 200, {
    ...getCorsHeaders(req),
    "set-cookie": cookieHeader(sid),
  });
  } catch (error: any) {
    console.error("Explain route error:", error);
    if (user && safetyLogger) {
      await safetyLogger.log(
        createSafetyEvent(user.id, "system_error", "medium", {
          error: error?.message || "Unknown error",
          endpoint: "/api/explain",
        }, { requestId })
      ).catch((err) => console.error("Failed to log safety event:", err));
    }
    return jsonResponse({ error: "Failed to process request" }, 500, {
      ...getCorsHeaders(req),
      "set-cookie": cookieHeader(await getSessionId(req)),
    });
  }
}

export async function registerExplainRoute(router: any, getEnv: () => Env) {
  router.post("/api/explain", async (request: Request) => {
    const env = getEnv();
    return handleExplain(request, env);
  });
}