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

// ── Model fallback chain ──────────────────────────────────────────────────────
// Ordered by preference: fastest/cheapest first, most capable last.
// Each model is tried in sequence on failure.
const MODEL_FALLBACK_CHAIN = [
  "@cf/meta/llama-3.1-8b-instruct-fast",   // primary — fast, low latency
  "@cf/meta/llama-3.1-8b-instruct",         // fallback 1 — standard
  "@cf/meta/llama-3.2-11b-vision-instruct", // fallback 2 — larger
  "@cf/mistral/mistral-7b-instruct-v0.1",   // fallback 3 — different architecture
] as const;

type AIEnv = {
  AI: {
    run: (
      model: string,
      input: { messages: Array<{ role: "system" | "user" | "assistant"; content: string }> }
    ) => Promise<{ response?: string }>
  }
}

async function runSingleModel(
  env: AIEnv,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model: string
): Promise<string> {
  await acquireSlot();
  let aiPromise: Promise<{ response?: string }>;
  try {
    aiPromise = env.AI.run(model, { messages }) as Promise<{ response?: string }>;
  } catch (error) {
    releaseSlot();
    throw error;
  }

  void aiPromise.finally(() => releaseSlot());

  const aiResponse = await runWithTimeout(aiPromise, AI_TIMEOUT_MS);
  return boundedAiText(aiResponse.response ?? "");
}

export async function runAiWithResilience(
  env: AIEnv,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model = MODEL_FALLBACK_CHAIN[0]
): Promise<string> {
  if (isCircuitOpen()) {
    logSystemError("circuit_open", { model });
    throw new ServiceUnavailableError("service_unavailable");
  }

  // Build the chain: requested model first, then remaining fallbacks
  const chain = [
    model,
    ...MODEL_FALLBACK_CHAIN.filter((m) => m !== model),
  ];

  let lastError: unknown = null;

  for (let i = 0; i < chain.length; i++) {
    const currentModel = chain[i];
    const isFallback = i > 0;

    if (isFallback) {
      logSystemError("model_fallback", {
        failedModel: chain[i - 1],
        tryingModel: currentModel,
        attempt: i + 1,
        error: lastError instanceof Error ? lastError.message : String(lastError),
      });
    }

    try {
      const result = await runSingleModel(env, messages, currentModel);
      if (isFallback) {
        logSystemError("fallback_success", { model: currentModel, attempt: i + 1 });
      }
      markSuccess();
      return result;
    } catch (error) {
      lastError = error;
      const reason =
        error instanceof Error && error.message === "timeout" ? "timeout" : "ai_failure";
      logSystemError(reason, {
        model: currentModel,
        attempt: i + 1,
        error: error instanceof Error ? error.message : String(error),
      });
      markFailure();

      // If circuit just opened, stop trying
      if (isCircuitOpen()) {
        logSystemError("circuit_open_abort_chain", { stoppedAt: currentModel });
        break;
      }
    }
  }

  throw new ServiceUnavailableError("all_models_failed");
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
