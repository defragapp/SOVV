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

export async function logSafetyEvent(env: Env, event: SafetyEvent): Promise<void> {
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
  }
  if (event.type === "rate_limit_exceeded") {
    metricKeys.push(`ops:metrics:${endpoint}:rate_limits_triggered`);
  }
  if (event.type === "validation_error") {
    metricKeys.push(`ops:metrics:${endpoint}:validation_failures`);
  }
  if (event.type === "system_error") {
    metricKeys.push(`ops:metrics:${endpoint}:system_errors`);
  }

  for (const metricKey of metricKeys) {
    const current = await env.KV.get(metricKey);
    const next = Number.parseInt(current || "0", 10) + 1;
    await env.KV.put(metricKey, String(next));
  }
}
