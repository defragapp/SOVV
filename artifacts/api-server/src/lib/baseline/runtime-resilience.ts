export function logSystemError(reason: string, details?: Record<string, unknown>): void {
  console.error(
    JSON.stringify({
      type: "system_error",
      reason,
      timestamp: new Date().toISOString(),
      ...(details ?? {}),
    })
  );
}

export function ensureRequiredEnv(
  env: Record<string, unknown>,
  requiredKeys: string[]
): void {
  for (const key of requiredKeys) {
    if (env[key] === undefined || env[key] === null || env[key] === "") {
      throw new Error(`Missing required environment binding: ${key}`);
    }
  }
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs = 10_000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (
      (error instanceof Error && error.name === "AbortError") ||
      (error instanceof Error && error.message === "timeout")
    ) {
      logSystemError("timeout", { timeoutMs });
      throw new Error("timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const RETRY_BACKOFF_MS = 100;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_OPERATION_TIMEOUT_MS = 6_000;

async function withTimeout<T>(
  label: string,
  operation: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race<T>([
      operation,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          logSystemError("timeout", { label, timeoutMs });
          reject(new Error("timeout"));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function isTransient(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("connection") ||
    msg.includes("network") ||
    msg.includes("temporar") ||
    msg.includes("too many requests")
  );
}

export async function withLimitedRetry<T>(
  label: string,
  operation: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES,
  timeoutMs = DEFAULT_OPERATION_TIMEOUT_MS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(label, operation(), timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries || !isTransient(error)) {
        throw error;
      }
      logSystemError("retry_attempt", {
        label,
        attempt: attempt + 1,
        maxRetries,
        error: error instanceof Error ? error.message : String(error),
      });
      await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
