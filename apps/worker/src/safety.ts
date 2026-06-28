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

type SafetyLogLevel = "info" | "warn" | "error";

type SafetyLogParams = {
  level?: SafetyLogLevel;
  event: string;
  request?: Request;
  requestId?: string;
  endpoint?: string;
  error_type?: SafetyErrorType;
  status?: number;
  duration_ms?: number;
  error?: unknown;
  details?: Record<string, unknown>;
};

type RequestContext = {
  requestId: string;
  endpoint: string;
};

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
  status,
  duration_ms,
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

  if (error_type) payload.error_type = error_type;
  if (status !== undefined) payload.status = status;
  if (duration_ms !== undefined) payload.duration_ms = duration_ms;

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
