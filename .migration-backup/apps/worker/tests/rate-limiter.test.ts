import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter, checkRateLimit, extractRateLimitKey, RATE_LIMIT_PRESETS } from "../src/middleware/rate-limiter";

// Mock KV storage for testing
class MockKV {
  private store: Map<string, { value: string; expiration?: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiration && Date.now() > item.expiration) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    const expiration = options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : undefined;
    this.store.set(key, { value, expiration });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("RateLimiter", () => {
  let mockKv: MockKV;
  let limiter: RateLimiter;

  beforeEach(() => {
    mockKv = new MockKV();
    limiter = new RateLimiter(mockKv as any, RATE_LIMIT_PRESETS.normal);
  });

  describe("checkLimit", () => {
    it("allows requests within limit", async () => {
      for (let i = 0; i < 30; i++) {
        const result = await limiter.checkLimit("user:123");
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(30 - i); // Remaining BEFORE this request
      }
    });

    it("blocks requests exceeding limit", async () => {
      // Fill the limit
      for (let i = 0; i < 30; i++) {
        await limiter.checkLimit("user:123");
      }

      // Next request should be blocked
      const result = await limiter.checkLimit("user:123");
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it("tracks remaining requests correctly", async () => {
      const result1 = await limiter.checkLimit("user:456");
      expect(result1.remaining).toBe(30);

      const result2 = await limiter.checkLimit("user:456");
      expect(result2.remaining).toBe(29);

      const result3 = await limiter.checkLimit("user:456");
      expect(result3.remaining).toBe(28);
    });

    it("isolates keys from each other", async () => {
      // First user makes 2 requests
      const r1 = await limiter.checkLimit("user:111");
      expect(r1.remaining).toBe(30); // 30 remaining slots BEFORE this request
      
      const r2 = await limiter.checkLimit("user:111");
      expect(r2.remaining).toBe(29); // 29 remaining slots BEFORE this second request

      // Second user should start fresh (30 remaining BEFORE their first request)
      const result = await limiter.checkLimit("user:222");
      expect(result.remaining).toBe(30);
    });

    it("resets after window expires", async () => {
      const limiter2 = new RateLimiter(mockKv as any, {
        windowSizeSeconds: 1,
        maxRequests: 5,
      });

      // Fill the window
      for (let i = 0; i < 5; i++) {
        await limiter2.checkLimit("user:789");
      }

      // Should be blocked
      let result = await limiter2.checkLimit("user:789");
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should allow again
      result = await limiter2.checkLimit("user:789");
      expect(result.allowed).toBe(true);
    });

    it("returns resetAt timestamp", async () => {
      const now = Date.now();
      const result = await limiter.checkLimit("user:reset-test");

      expect(result.resetAt).toBeGreaterThan(now);
      expect(result.resetAt).toBeLessThanOrEqual(now + RATE_LIMIT_PRESETS.normal.windowSizeSeconds * 1000 + 1000);
    });
  });

  describe("resetLimit", () => {
    it("clears limit for a key", async () => {
      // Use up some requests
      for (let i = 0; i < 20; i++) {
        await limiter.checkLimit("user:reset");
      }

      let usage = await limiter.getUsage("user:reset");
      expect(usage.used).toBe(20);

      // Reset
      await limiter.resetLimit("user:reset");

      // Should be reset to 0
      usage = await limiter.getUsage("user:reset");
      expect(usage.used).toBe(0);
    });
  });

  describe("getUsage", () => {
    it("returns correct usage stats", async () => {
      await limiter.checkLimit("user:stats");
      await limiter.checkLimit("user:stats");

      const usage = await limiter.getUsage("user:stats");
      expect(usage.used).toBe(2);
      expect(usage.remaining).toBe(28);
      expect(usage.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe("checkRateLimit helper", () => {
    it("returns allowed: true when under limit", async () => {
      const result = await checkRateLimit(limiter, "user:123");
      expect(result.allowed).toBe(true);
    });

    it("returns 429 response when rate limited", async () => {
      // Fill the limit
      for (let i = 0; i < 30; i++) {
        await limiter.checkLimit("user:limited");
      }

      // Next should be rate limited
      const result = await checkRateLimit(limiter, "user:limited");
      expect(result.allowed).toBe(false);

      if (!result.allowed) {
        expect(result.response.status).toBe(429);

        const body = await result.response.json();
        expect(body.error).toBe("rate_limit_exceeded");
        expect(body.retryAfter).toBeDefined();

        expect(result.response.headers.get("Retry-After")).toBeDefined();
        expect(result.response.headers.get("RateLimit-Limit")).toBe("30");
        expect(result.response.headers.get("RateLimit-Remaining")).toBe("0");
      }
    });
  });

  describe("extractRateLimitKey", () => {
    it("uses userId if provided", () => {
      const req = new Request("http://localhost", {
        headers: { "cf-connecting-ip": "192.168.1.1" },
      });
      const key = extractRateLimitKey(req, "user:456");
      expect(key).toBe("user:456");
    });

    it("extracts IP from cf-connecting-ip header", () => {
      const req = new Request("http://localhost", {
        headers: { "cf-connecting-ip": "203.0.113.42" },
      });
      const key = extractRateLimitKey(req);
      expect(key).toBe("ip:203.0.113.42");
    });

    it("falls back to x-forwarded-for header", () => {
      const req = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.99" },
      });
      const key = extractRateLimitKey(req);
      expect(key).toBe("ip:203.0.113.99");
    });

    it("uses 'unknown' when no IP available", () => {
      const req = new Request("http://localhost");
      const key = extractRateLimitKey(req);
      expect(key).toBe("ip:unknown");
    });
  });

  describe("RATE_LIMIT_PRESETS", () => {
    it("defines standard presets", () => {
      expect(RATE_LIMIT_PRESETS.loose.maxRequests).toBe(100);
      expect(RATE_LIMIT_PRESETS.normal.maxRequests).toBe(30);
      expect(RATE_LIMIT_PRESETS.strict.maxRequests).toBe(10);
      expect(RATE_LIMIT_PRESETS.perSecond.maxRequests).toBe(5);
    });

    it("loose preset allows 100 per minute", async () => {
      const limiter = new RateLimiter(mockKv as any, RATE_LIMIT_PRESETS.loose);
      for (let i = 0; i < 100; i++) {
        const result = await limiter.checkLimit("test");
        expect(result.allowed).toBe(true);
      }
      const result = await limiter.checkLimit("test");
      expect(result.allowed).toBe(false);
    });

    it("strict preset allows 10 per minute", async () => {
      const limiter = new RateLimiter(mockKv as any, RATE_LIMIT_PRESETS.strict);
      for (let i = 0; i < 10; i++) {
        const result = await limiter.checkLimit("test");
        expect(result.allowed).toBe(true);
      }
      const result = await limiter.checkLimit("test");
      expect(result.allowed).toBe(false);
    });

    it("perSecond preset enforces per-second limits", async () => {
      const limiter = new RateLimiter(mockKv as any, RATE_LIMIT_PRESETS.perSecond);
      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit("test");
        expect(result.allowed).toBe(true);
      }
      const result = await limiter.checkLimit("test");
      expect(result.allowed).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles sequential requests correctly", async () => {
      const results = [];
      for (let i = 0; i < 35; i++) {
        results.push(await limiter.checkLimit("sequential"));
      }

      // First 30 should be allowed
      const allowed = results.filter((r) => r.allowed).length;
      const blocked = results.filter((r) => !r.allowed).length;

      expect(allowed).toBe(30);
      expect(blocked).toBe(5);
    });

    it("handles very large maxRequests", async () => {
      const limiter = new RateLimiter(mockKv as any, {
        windowSizeSeconds: 60,
        maxRequests: 10000,
      });

      for (let i = 0; i < 1000; i++) {
        const result = await limiter.checkLimit("large");
        expect(result.allowed).toBe(true);
      }

      const result = await limiter.checkLimit("large");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9000);
    });

    it("handles zero maxRequests (deny all)", async () => {
      const limiter = new RateLimiter(mockKv as any, {
        windowSizeSeconds: 60,
        maxRequests: 0,
      });

      const result = await limiter.checkLimit("blocked");
      expect(result.allowed).toBe(false);
    });
  });
});
