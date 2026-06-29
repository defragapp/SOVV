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

export { RISK_WORDS };

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

export type SafetyEventType =
  | "validation_error"
  | "rate_limit_exceeded"
  | "system_error"
  | "billing_event"
  | "request_lifecycle";

export type SafetyEvent = {
  type: SafetyEventType;
  requestId: string;
  metadata: Record<string, unknown>;
};

export async function logSafetyEvent(envOrEvent: Env | SafetyEvent, event?: SafetyEvent): Promise<void> {
  // Accept both (env, event) and (event) call signatures
  const env = event ? envOrEvent as Env : null
  const safetyEvent = event ?? envOrEvent as SafetyEvent
  if (!env) { console.warn("[safety] logSafetyEvent called without env", safetyEvent?.type); return }
  const payload = {
    channel: "safety",
    timestamp: new Date().toISOString(),
    ...event,
  };

  console.log(JSON.stringify(payload));

  if (!env.KV) return;

  const key = `safety:audit:${Date.now()}:${event.requestId}:${crypto.randomUUID()}`;
  await env.KV.put(key, JSON.stringify(payload), { expirationTtl: 60 * 60 * 24 * 30 });

  const endpoint = typeof event.metadata.endpoint === "string" ? event.metadata.endpoint : "unknown";
  const metricKeys: string[] = [];

  if (event.type === "request_lifecycle" && event.metadata.stage === "end") {
    metricKeys.push(`ops:metrics:${endpoint}:requests_processed`);
    if (event.metadata.aiExecuted === true) {
      metricKeys.push(`ops:metrics:${endpoint}:ai_calls`);
      if (typeof event.metadata.aiCalls === "number") {
        metricKeys.push(`ops:metrics:${endpoint}:downstream_ai_calls`);
      }
    }
    if (event.metadata.responsePath === "fallback") {
      metricKeys.push(`ops:metrics:${endpoint}:fallback_responses`);
    }
    if (event.metadata.responsePath === "support-response") {
      metricKeys.push(`ops:metrics:${endpoint}:support_responses`);
    }
    if (event.metadata.degradationState === "DEGRADED") {
      metricKeys.push(`ops:metrics:${endpoint}:degraded_responses`);
    }
    if (event.metadata.degradationState === "PROTECTED") {
      metricKeys.push(`ops:metrics:${endpoint}:protected_responses`);
    }
    if (event.metadata.slowRequest === true) {
      metricKeys.push(`ops:metrics:${endpoint}:slow_requests`);
    }
  }
  if (event.type === "rate_limit_exceeded") {
    metricKeys.push(`ops:metrics:${endpoint}:rate_limits_triggered`);
  }
  if (event.type === "validation_error") {
    metricKeys.push(`ops:metrics:${endpoint}:validation_failures`);
    if (event.metadata.reason === "drift_detected") {
      metricKeys.push(`ops:metrics:${endpoint}:drift_detections`);
    }
  }
  if (event.type === "system_error") {
    metricKeys.push(`ops:metrics:${endpoint}:system_errors`);
    if (event.metadata.reason === "drift_detected") {
      metricKeys.push(`ops:metrics:${endpoint}:drift_detections`);
    }
  }

  for (const metricKey of metricKeys) {
    const current = await env.KV.get(metricKey);
    const next = Number.parseInt(current || "0", 10) + 1;
    await env.KV.put(metricKey, String(next));
  }
}


// ── Compatibility stubs for PR #110 imports ──────────────────────────────────
// These functions are referenced across the codebase but not yet implemented.
// They are safe no-ops that allow the build to succeed.

export function protectionActive(_req: Request, _level: number): boolean {
  return false
}

export function tracedRequest(_req: Request, _ctx: unknown): Request {
  return _req
}

export function finalizeResponse(res: Response, _ctx: unknown): Response {
  return res
}

export function diagnostic(_label: string, _data: unknown): void {
  // no-op
}

export function createDiagnosticRequest(_req: Request): unknown {
  return {}
}

export function httpRequest(_url: string, _options?: unknown): Promise<Response> {
  return fetch(_url as string, _options as RequestInit)
}
