# SOVV Platform Architecture
*Knowledge file for Sovereign Build Agent GPT. Reference this for understanding the full stack before making any code changes.*

---

## Overview

**defrag.app** — Sovereign.os — is a relational intelligence SaaS. It helps users understand behavioral patterns in themselves and their relationships using a proprietary "Baseline Design" system (synthesized from Human Design, astrology, numerology, Gene Keys, timing cycles).

**Three product spaces:**
1. **Defrag** — AI pattern analysis of a current situation ("what's active right now")
2. **Alignment** — alignment vectors between two people
3. **Covenant** — relational boundary agreements

---

## Infrastructure Map

```
User Browser / PWA
       │
       ▼
app.defrag.app  (Cloudflare Pages — Next.js 15 via OpenNext)
       │
       ├── /api/* → Next.js API routes (thin proxy layer)
       │              └── calls api.defrag.app (sovereign-os-api worker)
       │
       ▼
api.defrag.app  (Cloudflare Worker: sovereign-os-api)
       │
       ├── D1 Database: vibesdk-db
       ├── KV Namespace: SOVV_DATA (id: 3bd3ff5048a8468e82c574d7d66045c3)
       ├── R2 Bucket: vibesdk-templates (assets, generated images)
       ├── R2 Bucket: sovereign-logs (error logs, audit trail)
       ├── Queue: pattern-extraction-tasks
       ├── Service Binding: AI_SERVICE → worker-ai
       ├── Service Binding: SESSION_SERVICE → worker-session
       └── Email: Cloudflare Email Routing → info@defrag.app

ai.defrag.app   (Cloudflare Worker: worker-ai)
       └── CF AI binding: Llama 3.3 70B, Flux, Vision models

worker-session  (Cloudflare Worker + Durable Objects)
       └── ConflictSessionDO — real-time multi-person sessions

sovereign-build-agent  (Cloudflare Worker)
       └── /chat, /repo/tree, /repo/file, /deploy/worker

sovereign-broker  (Cloudflare Worker — GPT API surface)
       └── All GPT tool calls route through here
```

---

## Deployed Workers (13 total)

| Worker Name | Domain | Purpose |
|-------------|--------|---------|
| `sovereign-os-api` | api.defrag.app | Main API — auth, billing, AI, data |
| `worker-ai` | ai.defrag.app | CF AI inference |
| `worker-session` | — | Durable Objects for conflict sessions |
| `sovereign-broker` | sovereign-broker.defrag.app | GPT API broker (this agent) |
| `sovereign-build-agent` | — | Autonomous build/deploy agent |
| `sovereign-code-agent` | — | Code generation agent |
| `sovereign-control` | — | Control plane |
| `sovereign-control-ui` | — | Control plane UI |
| `sovereign-build-broker` | — | Build orchestration broker |
| `sovv-web` | — | Web worker (OpenNext) |
| `developer` | — | Developer tools |
| `chatthread` | — | Chat thread management |

---

## Web App Stack (apps/web/)

```
Next.js 15 (App Router)
├── React 19
├── TypeScript ~5.9
├── Tailwind CSS v4
├── Framer Motion 12
├── Zustand (state)
├── Lucide React (icons)
├── JetBrains Mono (font — font-mono class)
├── Geist (secondary font)
└── OpenNext → Cloudflare Pages
```

**Design system:**
- Background: `bg-black`, `bg-zinc-900`, `bg-zinc-950`
- Text: `text-white`, `text-zinc-400`, `text-zinc-500`
- Accent: white borders, glass morphism (`backdrop-blur`, `bg-white/5`)
- Font: JetBrains Mono (`font-mono`) for data/code, Geist for prose
- Animations: Framer Motion (`motion.div`, `AnimatePresence`)
- Cards: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm`

**Key directories:**
```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── app/               # Auth pages (login, register, verify-email)
│   ├── apps/              # Product spaces (defrag, alignment, covenant)
│   ├── api/               # API route handlers (proxy to worker)
│   ├── hub/               # Team/org hub
│   ├── pricing/           # Pricing page
│   └── settings/          # User settings
├── components/
│   ├── spaces/            # App UI components (Sidebar, ResultCard, etc.)
│   ├── marketing/         # Landing page components
│   ├── ui/                # Primitives (button, card, badge, etc.)
│   └── system/            # System-level (OsOutput)
├── lib/
│   ├── auth.ts            # Auth helpers
│   ├── chat.ts            # Chat/AI helpers
│   ├── api.ts             # API client
│   └── session.ts         # Session management
└── public/                # Static assets, fonts, PWA manifest
```

---

## API Worker Stack (apps/worker/)

```
Cloudflare Worker (TypeScript)
├── itty-router (routing)
├── Cloudflare D1 (SQLite database)
├── Cloudflare KV (cache, sessions, usage)
├── Cloudflare R2 (file storage)
├── Cloudflare Queues (async pattern extraction)
├── Cloudflare AI (via service binding to worker-ai)
└── Stripe (billing)
```

**Route modules:**
```
apps/worker/src/
├── index.ts               # Router + CORS + cron handler
├── auth.ts                # Register, login, logout, session
├── routes/auth-extended.ts # Verify email, forgot/reset password
├── billing.ts             # Stripe checkout, webhooks, portal
├── baseline.ts            # Baseline Design CRUD + compile
├── baseline-update.ts     # Baseline update flow
├── baseline-compiler.ts   # Async compilation logic
├── defrag-message.ts      # Defrag AI message handler
├── defrag-multi.ts        # Multi-person defrag
├── alignment.ts           # Alignment vectors
├── covenant.ts            # Covenant CRUD
├── covenant-search.ts     # Scripture/covenant search
├── explain.ts             # Explain endpoint (legacy)
├── explain-extended.ts    # Extended explain
├── patterns.ts            # Pattern extraction + queue
├── history.ts             # Interaction history
├── library.ts             # Saved results (archive)
├── memory.ts              # User memory/context
├── insights.ts            # AI insights
├── invite.ts              # Invite system
├── referral.ts            # Referral codes
├── affiliate.ts           # Affiliate program
├── me.ts                  # User profile
├── chips.ts               # UI chips/tags
├── audio.ts               # Voice/audio
├── email.ts               # Email sending (nurture sequences)
├── entitlements.ts        # Feature access by tier
├── featureFlags.ts        # Feature flags
├── kv.ts                  # KV helpers
├── db.ts                  # D1 helpers
├── safety.ts              # Content safety
├── safety-validation.ts   # Input validation
├── middleware/
│   ├── ai-rate-limit.ts   # AI usage rate limiting
│   ├── rate-limiter.ts    # General rate limiting
│   └── validate-request.ts # Request validation
└── prompts.ts             # Unified prompt architecture
```

---

## AI Architecture

### Models in use
| Model | CF ID | Used for |
|-------|-------|---------|
| Llama 3.3 70B | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Main AI (Defrag, Alignment, Covenant) |
| Flux 1 Schnell | `@cf/black-forest-labs/flux-1-schnell` | Fast image gen |
| Flux 2 Dev | `@cf/black-forest-labs/flux-2-dev` | Quality image gen |
| Llama Vision 11B | `@cf/meta/llama-3.2-11b-vision-instruct` | Image analysis |
| GPT-OSS 120B | `@cf/openai/gpt-oss-120b` | Complex code gen |
| SDXL | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | Detailed images |

### AI Gateway
- Gateway ID: `sovereign-ai-gateway`
- All AI calls route through CF AI Gateway for logging/caching

### Prompt architecture (apps/worker/src/prompts.ts)
```
SECURITY_PREFIX (applied to all)
+ BASE_PROMPT (Sovereign.os identity + reasoning)
+ SPACE_CONTEXT (Defrag | Alignment | Covenant)
+ OUTPUT_CONTRACT (enforced JSON schema per space)
```

---

## Billing

**Stripe account:** `sk_live_51TV1FSBk78yJ8Hww...`

| Product | ID | Status |
|---------|-----|--------|
| DEFRAG Pro | `prod_UdHEFXmi3YN78U` | ✅ Active |
| Support sovereign.os | `prod_UdHOjayxvOoWQW` | ❌ Archived |
| Support DEFRAG | `prod_UdHLEMSuqrNJQr` | ❌ Archived |
| Scale Plan | `prod_UYNizCaY6Fwmf8` | ❌ Archived |
| Pro Plan | `prod_UYNiUKgLvl9BzW` | ❌ Archived |

**Active prices:**
- Monthly: `price_1Te0g9Bk78yJ8Hww8fFZCqhm` — $20.00/month
- Annual: `price_1Tq6nPBk78yJ8Hwwm0pxg4hH` — $99.00/year

**Billing flow:**
1. User clicks upgrade → `POST /api/billing/checkout` → worker creates Stripe session
2. Stripe redirects back → webhook fires → worker updates `subscriptions` table + user tier
3. Stripe events logged to `stripe_events` table for idempotency

---

## Auth Flow

1. Register: `POST /api/auth/register` → hash password → insert user → create session → send verify email
2. Login: `POST /api/auth/login` → verify password → create session token → set httpOnly cookie
3. Session: cookie `session_token` → worker validates against `sessions` table on every request
4. Email verify: token emailed → `POST /api/auth/verify-email` → sets `email_verified=1`
5. Password reset: `POST /api/auth/forgot-password` → token → `POST /api/auth/reset-password`

---

## CI/CD

**GitHub Actions workflows:**
- `deploy-production-web.yml` — builds Next.js → OpenNext → deploys to Cloudflare Pages
- `deploy-production-api.yml` — deploys `sovereign-os-api` worker via wrangler
- `production-web-smoke.yml` — smoke tests after web deploy
- `uptime-check.yml` — periodic uptime monitoring

**Deploy commands:**
```bash
# Web
cd apps/web && pnpm run deploy

# API worker
cd apps/worker && npx wrangler deploy

# AI worker
cd apps/worker-ai && npx wrangler deploy

# Trigger via GitHub Actions
gh workflow run deploy-production-web.yml --ref main
gh workflow run deploy-production-api.yml --ref main
```

---

## KV Namespace Usage (SOVV_DATA)

| Key pattern | Purpose |
|-------------|---------|
| `session:<token>` | Session data cache |
| `baseline:<user_id>` | Compiled baseline cache |
| `usage:<user_id>:<date>` | Daily AI usage counter |
| `natal:<user_id>` | Natal/birth data cache |
| `replay:<nonce>` | Replay attack prevention |
| `feature:<flag>:<user_id>` | Per-user feature flags |

---

## R2 Buckets

| Bucket | Binding | Purpose |
|--------|---------|---------|
| `vibesdk-templates` | `TEMPLATES` | Assets, templates, generated images |
| `sovereign-logs` | `LOGS` | Error logs, audit trail (Logpush job 1768279) |

---

## Monorepo Structure

```
SOVV/
├── apps/
│   ├── web/               # Next.js web app
│   ├── worker/            # Main API worker (sovereign-os-api)
│   ├── worker-ai/         # AI inference worker
│   ├── worker-session/    # Durable Objects session worker
│   ├── sovereign-broker/  # GPT API broker (this agent)
│   ├── sovereign-build-agent/  # Build agent
│   ├── sovereign-code-agent/   # Code agent
│   ├── sovereign-control/      # Control plane
│   └── sovereign-vibe/         # Vibe/UI worker
├── lib/
│   ├── api-spec/          # OpenAPI spec (orval generated)
│   ├── api-client-react/  # Generated React API client
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle DB schema
├── packages/
│   ├── core/              # Shared React components
│   └── prompts/           # Shared AI prompts
└── scripts/               # Deploy + verify scripts
```

---

## Environment Variables (worker secrets)

Set via `wrangler secret put` — never in code:
- `OPENAI_API_KEY` — OpenAI (if used)
- `STRIPE_SECRET_KEY` — Stripe live key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `JWT_SECRET` — Session token signing
- `KMS_KEY` — Key management
- `RESEND_API_KEY` — Email sending (Resend)
- `TURNSTILE_SECRET` — Cloudflare Turnstile (bot protection)

Worker vars (non-secret, in wrangler.toml):
- `AI_MODEL` = `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- `FREE_DAILY_LIMIT` = `15`
- `APP_URL` = `https://app.defrag.app`
- `GATEWAY_ID` = `sovereign-ai-gateway`
- `STRIPE_PRICE_ID` = `price_1Te0g9Bk78yJ8Hww8fFZCqhm`
- `STRIPE_ANNUAL_PRICE_ID` = `price_1Tq6nPBk78yJ8Hwwm0pxg4hH`