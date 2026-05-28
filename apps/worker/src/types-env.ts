import type { D1Database, R2Bucket, Ai } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
  AI_MODEL?: string;
  FREE_DAILY_LIMIT?: string;
  APP_URL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_ID?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  TEMPLATES?: R2Bucket;
  PATTERN_QUEUE?: Queue;
}
