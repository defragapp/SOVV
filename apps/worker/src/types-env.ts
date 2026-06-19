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

  // ── AI ───────────────────────────────────────────────────────────────────
  AI: Ai
  AI_SERVICE: Fetcher
  SESSION_SERVICE: Fetcher

  // ── Email ─────────────────────────────────────────────────────────────────
  // Cloudflare send_email binding — preferred transactional email path.
  // REQUIRES: Email Routing enabled on defrag.app + destination address verified.
  // Sender must be from the Email Routing-active domain (info@defrag.app).
  // Add [[send_email]] to wrangler.toml ONLY after Email Routing is configured.
  // See docs/email-routing-standard.md for setup steps.
  EMAIL?: SendEmail

  // Resend API key — current fallback for transactional email.
  // Used when EMAIL binding is not yet configured.
  RESEND_API_KEY?: string

  // Private forwarding address for Email Routing destination.
  // Do not commit the actual value — set as a Worker secret.
  EMAIL_FORWARD_ADDRESS?: string

  // ── Queue ─────────────────────────────────────────────────────────────────
  // Cloudflare Queue — pattern extraction, email jobs, webhook follow-up.
  // Queue name: pattern-extraction-tasks
  QUEUE?: Queue

  // Used for optional rate limiting in index.ts (unsafe binding in wrangler.toml).


  // ── Stripe ───────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_ID?: string
  STRIPE_ACCOUNT_ID?: string
  STRIPE_SUPPORT_LINK_URL?: string

  // ── Turnstile ────────────────────────────────────────────────────────────
  TURNSTILE_SECRET_KEY?: string
  TURNSTILE_SITE_KEY?: string

  // ── Cloudflare Access ────────────────────────────────────────────────────
  // For admin/staging route protection via Cloudflare Access JWT validation.
  TEAM_DOMAIN?: string  // e.g., https://your-team.cloudflareaccess.com
  POLICY_AUD?: string

  // Cookie domain apex for cross-subdomain auth. Example: defrag.app
  COOKIE_DOMAIN?: string


  // ── App config ───────────────────────────────────────────────────────────
  FREE_DAILY_LIMIT?: string
  APP_URL?: string
  AI_MODEL?: string
GATEWAY_ID?: string
  ELEVENLABS_API_KEY?: string
}