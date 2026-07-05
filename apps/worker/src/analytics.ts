/**
 * analytics.ts
 *
 * Cloudflare Analytics Engine integration for Sovereign.os.
 * Emits custom metrics for AI latency, error rates, entitlement checks,
 * and usage patterns — visible in Cloudflare dashboard.
 *
 * Dataset: sovereign-metrics
 * Usage: analytics.writeDataPoint({ blobs: [...], doubles: [...], indexes: [...] })
 */

import type { Env } from "./types-env.js"

export type MetricEvent =
  | "ai_request"
  | "ai_error"
  | "ai_retry"
  | "entitlement_check"
  | "entitlement_denied"
  | "auth_login"
  | "auth_register"
  | "auth_failed"
  | "rate_limit_hit"
  | "baseline_compile"
  | "baseline_compile_failed"
  | "audio_generated"
  | "invite_created"
  | "checkout_started"
  | "subscription_activated"
  | "subscription_canceled"

/**
 * Emit a metric data point to Analytics Engine.
 * Non-blocking — never throws.
 */
export function emitMetric(
  env: Env,
  event: MetricEvent,
  options: {
    space?: "defrag" | "alignment" | "covenant" | "audio" | "auth" | "billing"
    userId?: string
    durationMs?: number
    success?: boolean
    tier?: "free" | "pro"
  } = {}
): void {
  // ANALYTICS binding is optional - only active when dataset is created in CF dashboard
  const analytics = (env as any).ANALYTICS
  if (!analytics) return

  try {
    analytics.writeDataPoint({
      blobs: [
        event,
        options.space ?? "unknown",
        options.tier ?? "unknown",
        options.success !== undefined ? (options.success ? "success" : "failure") : "unknown",
      ],
      doubles: [
        options.durationMs ?? 0,
      ],
      indexes: [
        options.userId ? options.userId.slice(0, 8) : "anonymous",
      ],
    })
  } catch {
    // Analytics is non-critical — never let it break the request
  }
}

/**
 * Wrap an async function with AI latency tracking.
 */
export async function trackAiCall<T>(
  env: Env,
  space: "defrag" | "alignment" | "covenant" | "audio",
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    emitMetric(env, "ai_request", { space, durationMs: Date.now() - start, success: true })
    return result
  } catch (err) {
    emitMetric(env, "ai_error", { space, durationMs: Date.now() - start, success: false })
    throw err
  }
}
