import type { Env } from "./types-env.js"
import { SYSTEM_DEFRAG, SYSTEM_DEFRAG_RELATIONAL } from "./prompts.js"
import { getFeatureFlags } from "./featureFlags.js"
import { validateAndScore, buildRetryPrompt, parseAIOutput, checkGuardrails } from "./output-validator.js"
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
  if (!message) {
    return jsonResponse({ error: "message_required" }, 400, {
      ...getCorsHeaders(req),
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
      ? await env.KV.get(`baseline:${user.id}:person:${target.id}`, "json")
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
      mode: (mode as any) ?? (relational ? "pair" : "self"),
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
    max_tokens: 900,
  }, {
    gateway: { id: env.GATEWAY_ID || "sovereign-code-agent" }
  });

  const rawText = asText((ai as any).response ?? ai);
  const parsed = parseJsonFromText(rawText);

  // Guardrail check — block blocked phrases, log violations
  // (does not retry — just logs and continues with what we have)
  const guardrailResult = checkGuardrails(parsed, "defrag")
  if (!guardrailResult.passed) {
    console.warn("[Guardrail] Defrag output violations:", guardrailResult.violations)
  }

  // Empty result guard — if AI returned nothing useful, return a structured error
  if (!parsed.activePattern && !parsed.alignment && !parsed.summary) {
    return jsonResponse(
      { error: "incomplete_output", message: "The system couldn't read this moment clearly. Try describing it differently." },
      200,
      { ...getCorsHeaders(req), "set-cookie": cookieHeader(sid) }
    )
  }

  // Flow suggestion — Defrag → Alignment chain
  const flowSuggestion = suggestNextSpace(parsed)

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
    conversationalSteering: (parsed.conversationalSteering?.do?.length || parsed.conversationalSteering?.avoid?.length)
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
    metadata: { structured: true },
    rail: railData ?? undefined,
    signature: signatureLine || undefined,
    flow: flowSuggestion ? formatFlowSuggestion(flowSuggestion) : undefined,
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
  }

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