import type { Env } from "./types-env.js";

const RISK_WORDS = [
  "kill myself",
  "want to die",
  "hurt myself",
  "suicide",
  "self harm",
  "abuse",
  "unsafe",
  "violence",
  "threat"
];

export function safetyMode(text: string): "normal" | "support" {
  const t = (text || "").toLowerCase();
  for (const w of RISK_WORDS) {
    if (t.includes(w)) return "support";
  }
  return "normal";
}

export function supportResponse() {
  return {
    type: "support" as const,
    message:
      "This may involve real risk or distress. If you feel unsafe or overwhelmed, reaching out for support can help.",
    resources: [
      { label: "Call or text 988 (U.S.)", link: "https://988lifeline.org" },
      { label: "If you are in immediate danger, call local emergency services.", link: "https://www.usa.gov/emergency-help" }
    ],
    confidence: "Support mode" as const
  };
}

export type SafetyErrorType = "validation" | "rate_limit" | "auth" | "system" | "billing";
export type ProtectionLevel = 0 | 1 | 2;

type SafetyLogLevel = "info" | "warn" | "error";
type RuntimeMetric = "requests" | "errors" | "rate_limits" | "ai_failures";

type RuntimeCounters = {
  minute: string;
  requests: number;
  errors: number;
  rate_limits: number;
  ai_failures: number;
  duration_total_ms: number;
  duration_count: number;
};

type ProtectionState = {
  level: ProtectionLevel;
  consecutive_anomaly_minutes: number;
  last_anomaly_minute?: string;
  last_anomaly_logged_minute?: string;
  last_escalation_minute?: string;
  last_recovery_minute?: string;
};

type SafetyLogParams = {
  level?: SafetyLogLevel;
  event: string;
  request?: Request;
  requestId?: string;
  endpoint?: string;
  error_type?: SafetyErrorType;
  type?: string;
  reason?: string;
  status?: number;
  duration_ms?: number;
  protection_level?: ProtectionLevel;
  error?: unknown;
  details?: Record<string, unknown>;
};

type RequestContext = {
  requestId: string;
  endpoint: string;
};

type RequestFingerprint = {
  actor: string;
  bodySize: number;
  contentHash: string;
  repetitionScore: number;
  fingerprint: string;
};

const CURRENT_WINDOW_TTL_SECONDS = 60 * 60;
const PROTECTION_STATE_TTL_SECONDS = 24 * 60 * 60;

const ANOMALY_THRESHOLDS = {
  level1: {
    requests: 60,
    errors: 8,
    rate_limits: 10,
    ai_failures: 4,
    average_duration_ms: 2000,
  },
  level2: {
    requests: 100,
    errors: 15,
    rate_limits: 18,
    ai_failures: 7,
    average_duration_ms: 3500,
  },
  suspicious_repeat_count: 5,
  protective_actor_limit_per_minute: 6,
};

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function endpointKey(endpoint: string): string {
  return hashString(endpoint.toLowerCase());
}

function minuteBucket(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 16);
}

function metricsKey(endpoint: string, minute: string): string {
  return `runtime:metrics:${endpointKey(endpoint)}:${minute}`;
}

function protectionStateKey(endpoint: string): string {
  return `runtime:protection:${endpointKey(endpoint)}`;
}

function fingerprintKey(endpoint: string, actor: string, minute: string, fingerprint: string): string {
  return `runtime:fingerprint:${endpointKey(endpoint)}:${hashString(actor)}:${minute}:${fingerprint}`;
}

function protectiveActorKey(endpoint: string, actor: string, minute: string): string {
  return `runtime:protective-rate:${endpointKey(endpoint)}:${hashString(actor)}:${minute}`;
}

function normalizeBodyText(bodyText: string): string {
  return bodyText.replace(/\s+/g, " ").trim().toLowerCase();
}

function computeRepetitionScore(bodyText: string): number {
  const limitedBody = bodyText.slice(0, 1000);
  const normalized = normalizeBodyText(limitedBody);
  if (!normalized) return 0;
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) return 0;
  const uniqueTokens = new Set(tokens);
  const duplicateRatio = 1 - uniqueTokens.size / tokens.length;
  return Math.max(0, Math.min(1, Number(duplicateRatio.toFixed(2))));
}

function getActorKey(request: Request): string {
  const cookie = request.headers.get("cookie") ?? "";
  const sessionToken = cookie.match(/__sov_session=([^;]+)/)?.[1]
    ?? cookie.match(/sid=([^;]+)/)?.[1];
  if (sessionToken) return `session:${hashString(sessionToken)}`;
  const authHeader = request.headers.get("authorization");
  if (authHeader) return `auth:${hashString(authHeader)}`;
  const ip = request.headers.get("cf-connecting-ip") ?? "anonymous";
  return `ip:${hashString(ip)}`;
}

function buildRequestFingerprint(request: Request, bodyText: string): RequestFingerprint {
  const endpoint = getRequestContext(request).endpoint;
  const actor = getActorKey(request);
  const normalized = normalizeBodyText(bodyText).slice(0, 240);
  const bodySize = bodyText.length;
  const repetitionScore = computeRepetitionScore(bodyText);
  const sizeBucket = bodySize === 0 ? "0" : bodySize < 200 ? "small" : bodySize < 1000 ? "medium" : "large";
  const contentHash = hashString(`${normalized}:${sizeBucket}`);
  return {
    actor,
    bodySize,
    contentHash,
    repetitionScore,
    fingerprint: hashString(`${endpoint}:${actor}:${contentHash}:${sizeBucket}:${repetitionScore}`),
  };
}

function emptyCounters(minute: string): RuntimeCounters {
  return {
    minute,
    requests: 0,
    errors: 0,
    rate_limits: 0,
    ai_failures: 0,
    duration_total_ms: 0,
    duration_count: 0,
  };
}

function isConsecutiveMinute(previousMinute: string, currentMinute: string): boolean {
  const previous = Date.parse(`${previousMinute}:00.000Z`);
  const current = Date.parse(`${currentMinute}:00.000Z`);
  return Number.isFinite(previous) && Number.isFinite(current) && current - previous === 60_000;
}

function averageDuration(counters: RuntimeCounters): number {
  if (counters.duration_count === 0) return 0;
  return Math.round(counters.duration_total_ms / counters.duration_count);
}

function isAiEndpoint(endpoint: string): boolean {
  return [
    "/api/alignment",
    "/api/covenant",
    "/api/audio",
    "/api/derive-profile",
    "/api/explain",
    "/api/history",
    "/api/baseline/translate",
  ].some((path) => endpoint.includes(path));
}

function cloneObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function serializeError(error: unknown): Record<string, unknown> | string | undefined {
  if (error === undefined || error === null) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === "string") return error;
  if (typeof error === "object") return { ...error as Record<string, unknown> };
  return String(error);
}

export function getRequestContext(request: Request): RequestContext {
  const endpoint = request.headers.get("x-endpoint") ?? `${request.method} ${new URL(request.url).pathname}`;
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  return { requestId, endpoint };
}

export function getProtectionLevel(request: Request): ProtectionLevel {
  const rawValue = request.headers.get("x-protection-level");
  const parsed = rawValue ? parseInt(rawValue, 10) : 0;
  if (parsed === 1 || parsed === 2) return parsed;
  return 0;
}

export function protectionActive(request: Request, level: ProtectionLevel = 1): boolean {
  return getProtectionLevel(request) >= level;
}

export function classifyErrorType(params: {
  endpoint: string;
  status: number;
  error?: string;
}): SafetyErrorType {
  const endpoint = params.endpoint.toLowerCase();
  const error = (params.error ?? "").toLowerCase();

  if (endpoint.includes("/billing") || error.includes("stripe") || error.includes("payment")) {
    return "billing";
  }
  if (params.status === 429) {
    return "rate_limit";
  }
  if (params.status === 401 || params.status === 403) {
    return "auth";
  }
  if (params.status >= 500) {
    return "system";
  }
  if (params.status === 402 || error.includes("billing_not_configured") || error.includes("payment_required")) {
    return "billing";
  }
  return "validation";
}

export function logSafetyEvent({
  level = "info",
  event,
  request,
  requestId,
  endpoint,
  error_type,
  type,
  reason,
  status,
  duration_ms,
  protection_level,
  error,
  details,
}: SafetyLogParams): void {
  const context = request ? getRequestContext(request) : {
    requestId: requestId ?? "unknown",
    endpoint: endpoint ?? "unknown",
  };

  const payload: Record<string, unknown> = {
    event,
    requestId: context.requestId,
    endpoint: context.endpoint,
  };

  const resolvedErrorType = error_type ?? (error !== undefined ? "system" : undefined);
  const resolvedReason = reason ?? (error !== undefined ? "unknown_failure" : undefined);

  if (type) payload.type = type;
  if (resolvedReason) payload.reason = resolvedReason;
  if (resolvedErrorType) payload.error_type = resolvedErrorType;
  if (status !== undefined) payload.status = status;
  if (duration_ms !== undefined) payload.duration_ms = duration_ms;
  if (protection_level !== undefined) payload.protection_level = protection_level;

  const serializedError = serializeError(error);
  if (serializedError !== undefined) payload.error = serializedError;
  if (details) Object.assign(payload, details);

  const message = JSON.stringify(payload);
  if (level === "error") {
    console.error(message);
    return;
  }
  if (level === "warn") {
    console.warn(message);
    return;
  }
  console.log(message);
}

export async function getEndpointProtectionLevel(env: Env, endpoint: string): Promise<ProtectionLevel> {
  if (!env.KV) return 0;
  const rawState = await env.KV.get(protectionStateKey(endpoint));
  if (!rawState) return 0;
  try {
    const parsed = JSON.parse(rawState) as ProtectionState;
    return parsed.level ?? 0;
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "protection_state_parse_failed",
      endpoint,
      requestId: "runtime",
      reason: "unknown_failure",
      error,
    });
    return 0;
  }
}

export async function observeRequestFingerprint(env: Env, request: Request): Promise<RequestFingerprint | null> {
  if (!env.KV || request.method === "GET" || request.method === "OPTIONS" || request.method === "HEAD") {
    return null;
  }

  let bodyText = "";
  try {
    bodyText = await request.clone().text();
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "request_fingerprint_body_read_failed",
      request,
      reason: "unknown_failure",
      error,
    });
    return null;
  }

  const fingerprint = buildRequestFingerprint(request, bodyText);
  const minute = minuteBucket();
  const key = fingerprintKey(getRequestContext(request).endpoint, fingerprint.actor, minute, fingerprint.fingerprint);
  const currentCount = parseInt((await env.KV.get(key)) ?? "0", 10) || 0;
  const nextCount = currentCount + 1;
  await env.KV.put(key, String(nextCount), { expirationTtl: CURRENT_WINDOW_TTL_SECONDS });

  if (nextCount >= ANOMALY_THRESHOLDS.suspicious_repeat_count) {
    logSafetyEvent({
      level: "warn",
      event: "request_pattern_repeated",
      request,
      type: "system_error",
      reason: "suspicious_pattern",
      error_type: "system",
      details: {
        actor: fingerprint.actor,
        repeated_count: nextCount,
        content_size: fingerprint.bodySize,
        repetition_score: fingerprint.repetitionScore,
        fingerprint: fingerprint.fingerprint,
      },
    });
  }

  return fingerprint;
}

export async function enforceProtectiveRateLimit(env: Env, request: Request): Promise<boolean> {
  if (!env.KV) return true;

  const endpoint = getRequestContext(request).endpoint;
  const minute = minuteBucket();
  const actor = getActorKey(request);
  const key = protectiveActorKey(endpoint, actor, minute);
  const currentCount = parseInt((await env.KV.get(key)) ?? "0", 10) || 0;
  const nextCount = currentCount + 1;
  await env.KV.put(key, String(nextCount), { expirationTtl: CURRENT_WINDOW_TTL_SECONDS });
  return nextCount <= ANOMALY_THRESHOLDS.protective_actor_limit_per_minute;
}

export async function trackRuntimeOutcome(
  env: Env,
  request: Request,
  params: { status: number; durationMs: number },
): Promise<ProtectionLevel> {
  if (!env.KV) return 0;

  const { endpoint } = getRequestContext(request);
  const minute = minuteBucket();
  const rawCounters = await env.KV.get(metricsKey(endpoint, minute));
  let counters = emptyCounters(minute);

  if (rawCounters) {
    try {
      counters = { ...counters, ...(JSON.parse(rawCounters) as Partial<RuntimeCounters>) };
    } catch (error) {
      logSafetyEvent({
        level: "warn",
        event: "runtime_counters_parse_failed",
        request,
        reason: "unknown_failure",
        error,
      });
    }
  }

  counters.requests += 1;
  counters.duration_total_ms += params.durationMs;
  counters.duration_count += 1;
  if (params.status >= 400) counters.errors += 1;
  if (params.status === 429) counters.rate_limits += 1;
  if (params.status >= 500 && isAiEndpoint(endpoint)) counters.ai_failures += 1;

  await env.KV.put(metricsKey(endpoint, minute), JSON.stringify(counters), {
    expirationTtl: CURRENT_WINDOW_TTL_SECONDS,
  });

  const rawState = await env.KV.get(protectionStateKey(endpoint));
  let state: ProtectionState = {
    level: 0,
    consecutive_anomaly_minutes: 0,
  };

  if (rawState) {
    try {
      state = { ...state, ...(JSON.parse(rawState) as Partial<ProtectionState>) };
    } catch (error) {
      logSafetyEvent({
        level: "warn",
        event: "protection_state_restore_failed",
        request,
        reason: "unknown_failure",
        error,
      });
    }
  }

  const avgDuration = averageDuration(counters);
  const level1Triggers = counters.requests >= ANOMALY_THRESHOLDS.level1.requests
    || counters.errors >= ANOMALY_THRESHOLDS.level1.errors
    || counters.rate_limits >= ANOMALY_THRESHOLDS.level1.rate_limits
    || counters.ai_failures >= ANOMALY_THRESHOLDS.level1.ai_failures
    || avgDuration >= ANOMALY_THRESHOLDS.level1.average_duration_ms;
  const level2Triggers = counters.requests >= ANOMALY_THRESHOLDS.level2.requests
    || counters.errors >= ANOMALY_THRESHOLDS.level2.errors
    || counters.rate_limits >= ANOMALY_THRESHOLDS.level2.rate_limits
    || counters.ai_failures >= ANOMALY_THRESHOLDS.level2.ai_failures
    || avgDuration >= ANOMALY_THRESHOLDS.level2.average_duration_ms;

  const previousLevel = state.level;
  let nextLevel: ProtectionLevel = 0;

  if (level1Triggers || level2Triggers) {
    if (state.last_anomaly_minute !== minute) {
      state.consecutive_anomaly_minutes = state.last_anomaly_minute && isConsecutiveMinute(state.last_anomaly_minute, minute)
        ? state.consecutive_anomaly_minutes + 1
        : 1;
      state.last_anomaly_minute = minute;
    }

    nextLevel = level2Triggers || state.consecutive_anomaly_minutes >= 2 ? 2 : 1;

    if (state.last_anomaly_logged_minute !== minute) {
      logSafetyEvent({
        level: "warn",
        event: "runtime_anomaly_detected",
        request,
        type: "system_error",
        reason: "anomaly_detected",
        error_type: "system",
        protection_level: nextLevel,
        details: {
          counters: cloneObject(counters),
          average_duration_ms: avgDuration,
        },
      });
      state.last_anomaly_logged_minute = minute;
    }
  } else {
    state.consecutive_anomaly_minutes = 0;
  }

  if (nextLevel !== previousLevel) {
    if (nextLevel === 0 && previousLevel > 0) {
      logSafetyEvent({
        event: "runtime_recovered",
        request,
        reason: "system_recovered",
        error_type: "system",
        protection_level: 0,
        details: {
          previous_level: previousLevel,
          counters: cloneObject(counters),
          average_duration_ms: avgDuration,
        },
      });
      state.last_recovery_minute = minute;
    } else if (nextLevel > previousLevel) {
      logSafetyEvent({
        level: "warn",
        event: "runtime_protection_escalated",
        request,
        reason: "protection_escalation",
        error_type: "system",
        protection_level: nextLevel,
        details: {
          previous_level: previousLevel,
          counters: cloneObject(counters),
          average_duration_ms: avgDuration,
        },
      });
      state.last_escalation_minute = minute;
    } else if (nextLevel < previousLevel) {
      logSafetyEvent({
        level: "info",
        event: "runtime_protection_deescalated",
        request,
        reason: "protection_deescalation",
        error_type: "system",
        protection_level: nextLevel,
        details: {
          previous_level: previousLevel,
          counters: cloneObject(counters),
          average_duration_ms: avgDuration,
        },
      });
      state.last_recovery_minute = minute;
    }
  }

  state.level = nextLevel;
  await env.KV.put(protectionStateKey(endpoint), JSON.stringify(state), {
    expirationTtl: PROTECTION_STATE_TTL_SECONDS,
  });

  return state.level;
}
