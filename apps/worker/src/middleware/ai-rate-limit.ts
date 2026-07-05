/**
 * ai-rate-limit.ts
 *
 * Per-user rate limiting for AI-calling routes (Defrag, Covenant, Alignment, Baseline).
 * Uses the existing RateLimiter with user ID as the key for authenticated users,
 * falling back to IP for unauthenticated requests.
 *
 * Limits (per user per minute):
 *   - Free users: 15 AI requests/min (matches FREE_DAILY_LIMIT intent)
 *   - Pro users: 60 AI requests/min
 *   - Burst protection: 5 requests/10s for all users
 */

import type { KVNamespace } from "@cloudflare/workers-types";
import { RateLimiter, checkRateLimit, extractRateLimitKey } from "./rate-limiter.js";

export interface AiRateLimitOptions {
  kv: KVNamespace;
  request: Request;
  userId?: string;
  isPro?: boolean;
}

/**
 * Check per-user AI rate limit. Returns null if allowed, Response if blocked.
 */
export async function checkAiRateLimit(opts: AiRateLimitOptions): Promise<Response | null> {
  const { kv, request, userId, isPro } = opts;
  const key = extractRateLimitKey(request, userId);

  // Per-minute limit: free=15, pro=60
  const minuteLimiter = new RateLimiter(kv, {
    windowSizeSeconds: 60,
    maxRequests: isPro ? 60 : 15,
    keyPrefix: "ai-rate:min:",
  });

  const minuteCheck = await checkRateLimit(minuteLimiter, key);
  if (!minuteCheck.allowed) {
    const retryAfter = (minuteCheck as any).response
      ? parseInt((minuteCheck as any).response.headers.get("Retry-After") ?? "60")
      : 60;
    return new Response(
      JSON.stringify({
        error: "rate_limit_exceeded",
        message: isPro
          ? "You've sent too many requests. Please wait a moment before trying again."
          : "You've reached your request limit. Upgrade to Pro for higher limits.",
        retryAfter,
        isPro,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "RateLimit-Limit": isPro ? "60" : "15",
          "RateLimit-Remaining": "0",
          "RateLimit-Reset": String(Math.floor(Date.now() / 1000) + retryAfter),
          "X-RateLimit-Limit": isPro ? "60" : "15",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Burst protection: max 5 requests per 10 seconds for all users
  const burstLimiter = new RateLimiter(kv, {
    windowSizeSeconds: 10,
    maxRequests: 5,
    keyPrefix: "ai-rate:burst:",
  });

  const burstCheck = await checkRateLimit(burstLimiter, key);
  if (!burstCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: "rate_limit_exceeded",
        message: "Slow down — too many requests in a short period.",
        retryAfter: 10,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "10",
        },
      }
    );
  }

  return null;
}
