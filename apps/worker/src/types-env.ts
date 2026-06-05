import type { D1Database, R2Bucket, Ai, KVNamespace, SendEmail, Queue, Fetcher } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database
  KV: KVNamespace
  AI: Ai
  AI_SERVICE: Fetcher
  SESSION_SERVICE: Fetcher
  EMAIL?: SendEmail
  QUEUE?: Queue
  FREE_DAILY_LIMIT?: string
  APP_URL?: string
  RESEND_API_KEY?: string
  AI_MODEL?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_ID?: string
  STRIPE_ACCOUNT_ID?: string
  STRIPE_SUPPORT_LINK_URL?: string
  EMAIL_FORWARD_ADDRESS?: string;
  TURNSTILE_SECRET_KEY?: string
  TURNSTILE_SITE_KEY?: string
  TEAM_DOMAIN?: string; // For Cloudflare Access JWT validation, e.g., https://your-team.cloudflareaccess.com
  POLICY_AUD?: string; // For Cloudflare Access JWT validation
}
