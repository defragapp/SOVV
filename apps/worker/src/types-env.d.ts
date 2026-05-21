import type { Ai, KVNamespace, D1Database, R2Bucket, Queue } from "@cloudflare/workers-types";

export interface Env {
  AI: Ai;
  KV: KVNamespace;
  DB: D1Database;
  TEMPLATES: R2Bucket;
  AI_MODEL: string;
  APP_URL: string;
  FREE_DAILY_LIMIT: string;
  RATE_LIMITER: { limit: (options: { key: string }) => Promise<{ success: boolean; remaining: number }> };
  PATTERN_QUEUE: Queue<any>;

  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID?: string;
}
