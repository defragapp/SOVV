import type { KVNamespace } from "@cloudflare/workers-types";

export interface RateLimitConfig {
  windowSizeSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Sliding window rate limiter using KV storage
 * Tracks requests in a time window and enforces maximum request count
 */
export class RateLimiter {
  private kv: KVNamespace;
  private config: RateLimitConfig;

  constructor(kv: KVNamespace, config: RateLimitConfig) {
    this.kv = kv;
    this.config = {
      keyPrefix: "rate-limit:",
      ...config,
    };
  }

  /**
   * Check if a request should be allowed under rate limit
   */
  async checkLimit(key: string): Promise<RateLimitResult> {
    const prefixedKey = `${this.config.keyPrefix}${key}`;
    const now = Date.now();
    const windowStart = now - this.config.windowSizeSeconds * 1000;

    // Get current request count and timestamps
    const stored = await this.kv.get(prefixedKey);
    let timestamps: number[] = [];
    if (stored) {
      try {
        timestamps = JSON.parse(stored);
        if (!Array.isArray(timestamps)) timestamps = [];
      } catch {
        timestamps = [];
      }
    }

    // Remove expired timestamps (outside the window)
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if limit is exceeded
    const allowed = timestamps.length < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - timestamps.length);

    // Add current request timestamp if allowed
    if (allowed) {
      timestamps.push(now);
      // Set expiration to window size + buffer
      const ttl = this.config.windowSizeSeconds + 60;
      await this.kv.put(prefixedKey, JSON.stringify(timestamps), {
        expirationTtl: ttl,
      });
    }

    // Calculate when the oldest request leaves the window
    const oldestTimestamp = timestamps[0] ?? now;
    const resetAt = oldestTimestamp + this.config.windowSizeSeconds * 1000;
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter: !allowed ? Math.max(1, retryAfter) : undefined,
    };
  }

  /**
   * Reset limit for a specific key
   */
  async resetLimit(key: string): Promise<void> {
    const prefixedKey = `${this.config.keyPrefix}${key}`;
    await this.kv.delete(prefixedKey);
  }

  /**
   * Get current usage for a key (for monitoring/debugging)
   */
  async getUsage(key: string): Promise<{ used: number; remaining: number; resetAt: number }> {
    const prefixedKey = `${this.config.keyPrefix}${key}`;
    const now = Date.now();
    const windowStart = now - this.config.windowSizeSeconds * 1000;

    const stored = await this.kv.get(prefixedKey);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Remove expired timestamps
    timestamps = timestamps.filter((ts) => ts > windowStart);

    const oldestTimestamp = timestamps[0] ?? now;
    const resetAt = oldestTimestamp + this.config.windowSizeSeconds * 1000;

    return {
      used: timestamps.length,
      remaining: Math.max(0, this.config.maxRequests - timestamps.length),
      resetAt,
    };
  }
}

/**
 * Middleware helper to check rate limit and return response if exceeded
 */
export async function checkRateLimit(
  limiter: RateLimiter,
  key: string
): Promise<{ allowed: true } | { allowed: false; response: Response }> {
  const result = await limiter.checkLimit(key);

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: "rate_limit_exceeded",
          message: "Too many requests",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfter),
            "RateLimit-Limit": String(limiter["config"].maxRequests),
            "RateLimit-Remaining": String(result.remaining),
            "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Extract rate limit key from request (userId, IP, or combination)
 */
export function extractRateLimitKey(request: Request, userId?: string): string {
  if (userId) return userId;

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  return `ip:${ip}`;
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMIT_PRESETS = {
  // Loose: 100 requests per minute
  loose: {
    windowSizeSeconds: 60,
    maxRequests: 100,
  },
  // Normal: 30 requests per minute
  normal: {
    windowSizeSeconds: 60,
    maxRequests: 30,
  },
  // Strict: 10 requests per minute
  strict: {
    windowSizeSeconds: 60,
    maxRequests: 10,
  },
  // Per-second: 5 requests per second (300 per minute)
  perSecond: {
    windowSizeSeconds: 1,
    maxRequests: 5,
  },
};
