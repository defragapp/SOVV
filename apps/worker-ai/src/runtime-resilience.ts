const MAX_CONCURRENT_AI_CALLS = 8;
const MAX_QUEUED_AI_CALLS = 32;
const AI_TIMEOUT_MS = 12_000;
const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 30_000;
const MAX_AI_OUTPUT_CHARS = 4_000;

let activeCalls = 0;
const pendingResolvers: Array<() => void> = [];

let consecutiveAiFailures = 0;
let circuitOpenUntil = 0;

export class ServiceUnavailableError extends Error {
  constructor(message = "service_unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

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

function isCircuitOpen(now = Date.now()): boolean {
  return circuitOpenUntil > now;
}

function markFailure(): void {
  consecutiveAiFailures += 1;
  if (consecutiveAiFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    logSystemError("circuit_open", {
      threshold: CIRCUIT_FAILURE_THRESHOLD,
      cooldownMs: CIRCUIT_COOLDOWN_MS,
    });
  }
}

function markSuccess(): void {
  consecutiveAiFailures = 0;
  circuitOpenUntil = 0;
}

async function acquireSlot(): Promise<void> {
  if (activeCalls < MAX_CONCURRENT_AI_CALLS) {
    activeCalls += 1;
    return;
  }
  if (pendingResolvers.length >= MAX_QUEUED_AI_CALLS) {
    throw new ServiceUnavailableError("service_unavailable");
  }
  await new Promise<void>((resolve) => pendingResolvers.push(resolve));
  activeCalls += 1;
}

function releaseSlot(): void {
  activeCalls = Math.max(0, activeCalls - 1);
  const next = pendingResolvers.shift();
  if (next) next();
}

async function runWithTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await Promise.race<T>([
      operation,
      new Promise<T>((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new Error("timeout"));
        });
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function runAiWithResilience(
  env: { AI: { run: (model: string, input: { messages: Array<{ role: "system" | "user" | "assistant"; content: string }> }) => Promise<{ response?: string }> } },
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model = "@cf/meta/llama-3.1-8b-instruct-fast"
): Promise<string> {
  if (isCircuitOpen()) {
    logSystemError("circuit_open", { model });
    throw new ServiceUnavailableError("service_unavailable");
  }

  await acquireSlot();
  try {
    const aiResponse = await runWithTimeout(
      env.AI.run(model, { messages }) as Promise<{ response?: string }>,
      AI_TIMEOUT_MS
    );
    markSuccess();
    return boundedAiText(aiResponse.response ?? "");
  } catch (error) {
    const reason = error instanceof Error && error.message === "timeout" ? "timeout" : "ai_failure";
    logSystemError(reason, {
      model,
      error: error instanceof Error ? error.message : String(error),
    });
    markFailure();
    throw error;
  } finally {
    releaseSlot();
  }
}

export function boundedAiText(text: string): string {
  if (text.length <= MAX_AI_OUTPUT_CHARS) {
    return text;
  }
  return text.slice(0, MAX_AI_OUTPUT_CHARS);
}

export function maxResponseBytes(): number {
  return 64 * 1024;
}

export function maxRequestBytes(): number {
  return 64 * 1024;
}
