import type { D1Database, R2Bucket, Ai, KVNamespace, SendEmail, Queue, Fetcher } from "@cloudflare/workers-types";

export interface Env {
  RATE_LIMITER?: { limit: (opts: { key: string }) => Promise<{ success: boolean }> }
  // ── Storage ──────────────────────────────────────────────────────────────
  // D1 — Sovereign.os platform database (Cloudflare dashboard name: vibesdk-db)
  DB: D1Database

  // KV — session state, Baseline Design cache, usage counters, replay protection
  // Cloudflare dashboard KV namespace title: SOVV_DATA
  // Binding renamed from SOVV_DATA → KV for source consistency (see wrangler.toml)
  KV: KVNamespace

  // R2 — media, exports, templates (bucket: vibesdk-templates)
  // Binding name in wrangler.toml: TEMPLATES
  TEMPLATES?: R2Bucket

  // R2 — error monitoring logs (bucket: sovereign-logs)
  // Logpush job id=1768279 writes workers_trace_events here
  // Binding name in wrangler.toml: LOGS
  LOGS?: R2Bucket

  // ── AI ───────────────────────────────────────────────────────────────────
  AI: Ai
  AI_SERVICE: Fetcher
  SESSION_SERVICE: Fetcher

  // ── Email ─────────────────────────────────────────────────────────────────
  EMAIL?: SendEmail
  RESEND_API_KEY?: string
  EMAIL_FORWARD_ADDRESS?: string

  // ── Queue ─────────────────────────────────────────────────────────────────
  QUEUE?: Queue

  // ── Stripe ───────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_ID?: string
  STRIPE_ANNUAL_PRICE_ID?: string
  STRIPE_ACCOUNT_ID?: string
  STRIPE_SUPPORT_LINK_URL?: string
  BASELINE_GUIDE_PRICE_CENTS?: string

  // ── Turnstile ────────────────────────────────────────────────────────────
  TURNSTILE_SECRET_KEY?: string
  ADMIN_SEED_SECRET?: string
  TURNSTILE_SITE_KEY?: string

  // ── Cloudflare Access ────────────────────────────────────────────────────
  TEAM_DOMAIN?: string
  POLICY_AUD?: string
  COOKIE_DOMAIN?: string

  // ── App config ───────────────────────────────────────────────────────────
  FREE_DAILY_LIMIT?: string
  APP_URL?: string
  AI_MODEL?: string
  GATEWAY_ID?: string
  ENABLE_NEW_FLOW?: string
  ENABLE_MEMORY?: string
  ENABLE_FLOW_SUGGESTION?: string
  CF_VERSION_METADATA?: string
  ELEVENLABS_API_KEY?: string
}
