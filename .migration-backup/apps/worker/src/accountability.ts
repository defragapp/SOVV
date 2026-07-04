import type { Env } from "./types-env.js";
import { logSafetyEvent, safetyMode } from "./safety.js";

export type InputClassification = "safe" | "elevated" | "blocked";
export type DegradationState = "NORMAL" | "DEGRADED" | "PROTECTED";
export type ResponsePath = "normal" | "fallback" | "support-response";

type PressureSnapshot = {
  requests: number;
  support: number;
  failures: number;
  elevated: number;
  updatedAt: string;
};

type ServiceSnapshot = {
  requests: number;
  aiFailures: number;
  kvFailures: number;
  dbFailures: number;
  timeouts: number;
  slowRequests: number;
  validationNearFails: number;
  fallbacks: number;
  supportResponses: number;
  updatedAt: string;
  state: DegradationState;
  reason?: string;
};

type RequestContext = {
  endpoint: string;
  requestId: string;
  userId?: string | null;
  sessionId?: string | null;
};

type RequestDecision = {
  classification: InputClassification;
  guardrailsTriggered: string[];
  supportMode: boolean;
  throttleLevel: number;
  degradationState: DegradationState;
  coldStart: boolean;
};

type RequestOutcome = {
  aiExecuted: boolean;
  aiSuccess?: boolean;
  aiRetries?: number;
  aiFallback?: boolean;
  supportResponse?: boolean;
  responsePath: ResponsePath;
  durationMs?: number;
  slowRequest?: boolean;
  responseBytes?: number;
  kvFailure?: boolean;
  dbFailure?: boolean;
  timeout?: boolean;
  validationNearFail?: boolean;
  driftDetected?: boolean;
  downstreamAiCalls?: number;
};

const WINDOW_MS = 5 * 60 * 1000;
const SLOW_REQUEST_MS = 1800;
const SERVICE_STATE_TTL = 60 * 60 * 24;
let firstRequestSeen = false;

function windowKey(now = Date.now()): string {
  return new Date(Math.floor(now / WINDOW_MS) * WINDOW_MS).toISOString().slice(0, 16);
}

function scopeKey(ctx: RequestContext): string {
  if (ctx.userId) return `user:${ctx.userId}`;
  if (ctx.sessionId) return `session:${ctx.sessionId}`;
  return `request:${ctx.requestId}`;
}

async function readJson<T>(env: Env, key: string): Promise<T | null> {
  if (!env.KV) return null;
  const raw = await env.KV.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(env: Env, key: string, value: unknown, ttl = SERVICE_STATE_TTL): Promise<void> {
  if (!env.KV) return;
  await env.KV.put(key, JSON.stringify(value), { expirationTtl: ttl });
}

export function getColdStartMarker(): boolean {
  const coldStart = !firstRequestSeen;
  firstRequestSeen = true;
  return coldStart;
}

export function evaluateInputClassification(args: {
  message?: string;
  validationBlocked?: boolean;
  supportMode?: boolean;
  throttleLevel?: number;
  degradationState?: DegradationState;
}): { classification: InputClassification; guardrailsTriggered: string[] } {
  const guardrailsTriggered: string[] = [];
  const supportMode = Boolean(args.supportMode);
  const throttleLevel = args.throttleLevel ?? 0;
  const state = args.degradationState ?? "NORMAL";

  if (args.validationBlocked) guardrailsTriggered.push("validation_block");
  if (supportMode) guardrailsTriggered.push("risk_words");
  if (throttleLevel > 0) guardrailsTriggered.push("user_throttle");
  if (state !== "NORMAL") guardrailsTriggered.push(`service_${state.toLowerCase()}`);

  let classification: InputClassification = "safe";
  if (args.validationBlocked || state === "PROTECTED") {
    classification = "blocked";
  } else if (supportMode || throttleLevel > 0 || state === "DEGRADED") {
    classification = "elevated";
  }

  return { classification, guardrailsTriggered };
}

export async function sampleUserPressure(env: Env, ctx: RequestContext, classification: InputClassification, supportMode: boolean, failure: boolean): Promise<{ throttleLevel: number; snapshot: PressureSnapshot }> {
  const key = `ops:pressure:${scopeKey(ctx)}:${windowKey()}`;
  const current = (await readJson<PressureSnapshot>(env, key)) ?? {
    requests: 0,
    support: 0,
    failures: 0,
    elevated: 0,
    updatedAt: new Date().toISOString(),
  };

  current.requests += 1;
  if (supportMode) current.support += 1;
  if (failure) current.failures += 1;
  if (classification === "elevated") current.elevated += 1;
  current.updatedAt = new Date().toISOString();

  await writeJson(env, key, current, SERVICE_STATE_TTL);

  const throttleLevel =
    current.requests >= 16 || current.support >= 5 || current.failures >= 4
      ? 2
      : current.requests >= 6 || current.support >= 2 || current.failures >= 2 || current.elevated >= 3
        ? 1
        : 0;

  return { throttleLevel, snapshot: current };
}

export async function getServiceState(env: Env, endpoint: string): Promise<ServiceSnapshot> {
  const key = `ops:service:${endpoint}:current`;
  const snapshot = (await readJson<ServiceSnapshot>(env, key)) ?? {
    requests: 0,
    aiFailures: 0,
    kvFailures: 0,
    dbFailures: 0,
    timeouts: 0,
    slowRequests: 0,
    validationNearFails: 0,
    fallbacks: 0,
    supportResponses: 0,
    updatedAt: new Date().toISOString(),
    state: "NORMAL",
  };
  return snapshot;
}

function deriveState(snapshot: ServiceSnapshot): { state: DegradationState; reason: string } {
  if (
    snapshot.aiFailures >= 3 ||
    snapshot.timeouts >= 2 ||
    snapshot.kvFailures >= 3 ||
    snapshot.dbFailures >= 3
  ) {
    return { state: "PROTECTED", reason: "repeat_downstream_failures" };
  }

  if (
    snapshot.slowRequests >= 3 ||
    snapshot.aiFailures >= 1 ||
    snapshot.kvFailures >= 1 ||
    snapshot.dbFailures >= 1 ||
    snapshot.validationNearFails >= 2 ||
    snapshot.fallbacks >= 2
  ) {
    return { state: "DEGRADED", reason: "rising_latency_or_errors" };
  }

  return { state: "NORMAL", reason: "healthy" };
}

export async function recordServiceOutcome(env: Env, ctx: RequestContext, outcome: RequestOutcome): Promise<ServiceSnapshot> {
  const key = `ops:service:${ctx.endpoint}:current`;
  const snapshot = (await readJson<ServiceSnapshot>(env, key)) ?? {
    requests: 0,
    aiFailures: 0,
    kvFailures: 0,
    dbFailures: 0,
    timeouts: 0,
    slowRequests: 0,
    validationNearFails: 0,
    fallbacks: 0,
    supportResponses: 0,
    updatedAt: new Date().toISOString(),
    state: "NORMAL",
  };

  snapshot.requests += 1;
  if (outcome.aiExecuted && outcome.aiSuccess === false) snapshot.aiFailures += 1;
  if (outcome.kvFailure) snapshot.kvFailures += 1;
  if (outcome.dbFailure) snapshot.dbFailures += 1;
  if (outcome.timeout) snapshot.timeouts += 1;
  if (outcome.slowRequest || (typeof outcome.durationMs === "number" && outcome.durationMs >= SLOW_REQUEST_MS)) {
    snapshot.slowRequests += 1;
  }
  if (outcome.validationNearFail || outcome.driftDetected) snapshot.validationNearFails += 1;
  if (outcome.aiFallback || outcome.responsePath === "fallback") snapshot.fallbacks += 1;
  if (outcome.supportResponse || outcome.responsePath === "support-response") snapshot.supportResponses += 1;
  snapshot.updatedAt = new Date().toISOString();

  const next = deriveState(snapshot);
  const previousState = snapshot.state;
  snapshot.state = next.state;
  snapshot.reason = next.reason;

  await writeJson(env, key, snapshot, SERVICE_STATE_TTL);

  if (previousState !== snapshot.state) {
    await logSafetyEvent(env, {
      type: "request_lifecycle",
      requestId: ctx.requestId,
      metadata: {
        endpoint: ctx.endpoint,
        stage: "state_transition",
        previousState,
        nextState: snapshot.state,
        reason: snapshot.reason,
        userId: ctx.userId ?? null,
        sessionId: ctx.sessionId ?? null,
      },
    });
  }

  return snapshot;
}

export async function logRequestDecision(env: Env, ctx: RequestContext, decision: RequestDecision): Promise<void> {
  await logSafetyEvent(env, {
    type: "request_lifecycle",
    requestId: ctx.requestId,
    metadata: {
      endpoint: ctx.endpoint,
      stage: "decision",
      userId: ctx.userId ?? null,
      sessionId: ctx.sessionId ?? null,
      inputClassification: decision.classification,
      guardrailsTriggered: decision.guardrailsTriggered,
      supportMode: decision.supportMode,
      throttleLevel: decision.throttleLevel,
      degradationState: decision.degradationState,
      coldStart: decision.coldStart,
      aiExecuted: false,
      aiCalls: 0,
      aiRetries: 0,
      responsePath: "normal",
    },
  });
}

export async function logDriftDetected(env: Env, ctx: RequestContext, details: Record<string, unknown>, severity: "validation_error" | "system_error" = "validation_error"): Promise<void> {
  await logSafetyEvent(env, {
    type: severity,
    requestId: ctx.requestId,
    metadata: {
      endpoint: ctx.endpoint,
      reason: "drift_detected",
      userId: ctx.userId ?? null,
      sessionId: ctx.sessionId ?? null,
      ...details,
    },
  });
}

export function inspectResponseDrift(rawText: string, parsed: Record<string, unknown> | null, expectedKeys: string[], maxBytes = 6000): { driftDetected: boolean; anomalies: string[]; responseBytes: number; observedKeys: string[] } {
  const responseBytes = new TextEncoder().encode(rawText).length;
  const observedKeys = parsed ? Object.keys(parsed).sort() : [];
  const anomalies: string[] = [];

  if (!parsed) anomalies.push("parse_failed");
  if (expectedKeys.length) {
    const missing = expectedKeys.filter((key) => !observedKeys.includes(key));
    if (missing.length) anomalies.push(`missing:${missing.join(",")}`);
    if (Math.abs(observedKeys.length - expectedKeys.length) >= 2) anomalies.push("shape_changed");
  }
  if (responseBytes > maxBytes) anomalies.push("payload_too_large");
  if (responseBytes < 20) anomalies.push("payload_too_small");

  return {
    driftDetected: anomalies.length > 0,
    anomalies,
    responseBytes,
    observedKeys,
  };
}

export function shouldBypassAi(state: DegradationState, criticality: "critical" | "noncritical", throttleLevel: number): boolean {
  if (state === "PROTECTED") return true;
  if (criticality === "noncritical" && (state === "DEGRADED" || throttleLevel >= 2)) return true;
  return false;
}

export function tuneTokenBudget(base: number, state: DegradationState, throttleLevel: number): number {
  const factor = state === "PROTECTED" ? 0.35 : state === "DEGRADED" ? 0.65 : throttleLevel >= 2 ? 0.55 : throttleLevel === 1 ? 0.8 : 1;
  return Math.max(64, Math.round(base * factor));
}

export function temporaryUnavailableResponse(requestId: string, status = 503): Response {
  return new Response(JSON.stringify({
    success: false,
    error: "temporary_unavailable",
    requestId,
  }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "x-request-id": requestId,
      "cache-control": "no-store",
    },
  });
}
