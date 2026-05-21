import type { Ai } from "@cloudflare/workers-types";

export interface Env {
  AI: Ai;
  KV: KVNamespace;
  DB: D1Database;
  TEMPLATES: R2Bucket;
  AI_MODEL: string;
  APP_URL: string;
  FREE_DAILY_LIMIT: string;

  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID?: string;
}
