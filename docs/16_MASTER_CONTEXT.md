# Sovereign.os — Master Context Document
> Consolidated from all documentation in `defragapp/SOVV` · Last synced: 2026-06-20
> **Purpose:** Defines what the system is and how it works — architecture, product logic, data model, prompt structure, and system philosophy.

---

## Position in System

This document is **Layer 2** in the three-document authority hierarchy:

```
1. Runtime Contract  →  EXECUTION AUTHORITY (what is allowed to happen)
   docs/# Sovereign.os — Full Build Runtime Contract for Cloudflare AI Agents

2. Master Context    →  SYSTEM INTELLIGENCE (how the system thinks and is designed)
   docs/16_MASTER_CONTEXT.md  ← YOU ARE HERE

3. AGENTS.md         →  OPERATIONAL QUICK REFERENCE (how to act immediately)
   /AGENTS.md
```

### When to use this document

| Agent task | Use |
|------------|-----|
| Executing, deploying, enforcing rules | → Runtime Contract |
| Reasoning, generating, understanding architecture | → **This document** |
| Acting fast — commands, bindings, routes | → AGENTS.md |

### What this document does NOT contain

- Step-by-step deploy commands (→ AGENTS.md)
- CLI instructions (→ AGENTS.md)
- Enforcement rules (→ Runtime Contract)
- Duplicated binding details (→ AGENTS.md)

---

## TABLE OF CONTENTS

1. [Platform Identity & Hierarchy](#1-platform-identity--hierarchy)
2. [Architecture Overview](#2-architecture-overview)
3. [Cloudflare Infrastructure](#3-cloudflare-infrastructure)
4. [Domain & Route Map](#4-domain--route-map)
5. [Database Schema](#5-database-schema)
6. [Baseline Design Engine](#6-baseline-design-engine)
7. [App Spaces Architecture](#7-app-spaces-architecture)
8. [AI Prompt System](#8-ai-prompt-system)
9. [Auth & Session System](#9-auth--session-system)
10. [Billing & Subscription (Stripe)](#10-billing--subscription-stripe)
11. [Email System](#11-email-system)
12. [Build & Deploy Standard](#12-build--deploy-standard)
13. [UI Visual Quality Standard](#13-ui-visual-quality-standard)
14. [Product Language & Naming Rules](#14-product-language--naming-rules)
15. [AI Agent Guardrails & Hard Rules](#15-ai-agent-guardrails--hard-rules)
16. [Acceptance Tests & Drift Checks](#16-acceptance-tests--drift-checks)
17. [Support Escalation Tiers](#17-support-escalation-tiers)
18. [Legal Positioning](#18-legal-positioning)
19. [Operator Playbook](#19-operator-playbook)
20. [Known Issues & Open TODOs](#20-known-issues--open-todos)

---

## 1. Platform Identity & Hierarchy

### What Is Sovereign.os

**Sovereign.os** is the parent platform. It is a privacy-first relational intelligence platform. It is the private home base for a user's account, Baseline Design, subscription, saved Library, and connected spaces.

### Platform Hierarchy

```
Sovereign.os  (parent platform)
├── Defrag        — relational intelligence space
├── Covenant      — optional faith-context reflection space
└── Alignment     — response integration and action choice space
```

- **Defrag** — helps users understand what is active in the moment. Supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics.
- **Covenant** — optional, user-initiated, plain-language, private by design faith-context reflection space.
- **Alignment** — helps turn insights into actionable responses. The response integration and action choice space.

### Core Principle

> One user. One Baseline Design. One Library. Three guided spaces.

All three spaces share:
- One user account
- One auth/session system (`sovereign-os-api`)
- One Baseline Design (stored in KV)
- One Library (D1 `library` table, `workspace_source` column distinguishes space)
- One subscription/entitlement system (D1 `users.tier`)
- One invite/permission system
- One Owner/Ambassador admin system

**Never create separate auth, subscription, Baseline Design, Library, or invite systems per space.**

---

## 2. Architecture Overview

### Workers & Services

| Worker | Source | Route | Purpose |
|--------|--------|-------|---------|
| `sovv-web` | `apps/web/` | `defrag.app/*`, `app.defrag.app/*` | Next.js App Router frontend via OpenNext |
| `sovereign-os-api` | `apps/worker/` | `api.defrag.app/*` | Auth, Baseline Design, explain, history, billing, workspace logic |
| `worker-ai` | `apps/worker-ai/` | `ai.defrag.app/*` | Auxiliary AI analysis and gateway routing |
| `worker-session` | `apps/worker-session/` | `session.defrag.app/*` | Session coordination with Durable Objects |
| `sovereign-control` | `apps/sovereign-control/` | `operator.defrag.app/*` | Governed flow engine, AgentState Durable Object, operator dashboard |

### Runtime Stack

```
Next.js App Router
  → OpenNext (@opennextjs/cloudflare)
    → Cloudflare Workers (sovv-web)
```

### Shared Packages

- `packages/core/` — Shared TypeScript library (`@sovereign/core`): types, chips, route utilities, LibraryCard component

### Repository Structure

```
apps/web/                  — Next.js App Router + OpenNext (sovv-web Worker)
apps/worker/               — sovereign-os-api Worker (D1, KV, R2, Queue, AI)
apps/worker-ai/            — worker-ai Worker (AI inference + gateway)
apps/worker-session/       — worker-session Worker (Durable Objects)
apps/sovereign-control/    — sovereign-control Worker (AgentState DO, operator.defrag.app)
apps/sovereign-control-ui/ — Operator UI (served by sovereign-control)
apps/developer/            — Developer worker (separate D1 + R2)
packages/core/             — Shared TypeScript library (@sovereign/core)
docs/                      — Platform documentation
scripts/                   — Developer convenience scripts
```

### Design System

**Esoteric Brutalism**: Pure black backgrounds (`#020202`), 1px white borders, monospaced typography (JetBrains Mono / SF Mono), zero gradients, zero rounded corners. Strictly monochrome, premium.

---

## 3. Cloudflare Infrastructure

### Account

- **Account ID:** `8b1954d216d65077c6480d62583fe2c2`

### Storage Resources (Never Delete)

| Resource | Type | ID / Name | Binding in Code | Used By |
|----------|------|-----------|-----------------|---------|
| `vibesdk-db` | D1 Database | `c8c2fd8d-5297-46fc-8594-7629c8bad74d` | `env.DB` | `sovereign-os-api` |
| `SOVV_DATA` | KV Namespace | `3bd3ff5048a8468e82c574d7d66045c3` | `env.KV` | `sovereign-os-api` |
| `vibesdk-templates` | R2 Bucket | — | `env.R2` / `env.TEMPLATES` | `sovereign-os-api` |
| `web-opennext-cache` | R2 Bucket | — | — | Next.js ISR cache |
| `pattern-extraction-tasks` | Queue | `396e3d8f0b0c4b1d9407409b4e138f81` | `env.QUEUE` / `env.PATTERN_QUEUE` | `sovereign-os-api` |
| `developer-db` | D1 | `a6994b42-81ef-4fd7-a001-09526be1b2db` | — | `developer` worker |
| `developer-assets` | R2 | — | — | `developer` worker |

> **CRITICAL NOTE:** The D1 binding name in code is `DB` (i.e., `env.DB`), not `vibesdk-db`. The KV binding name in code is `KV` (i.e., `env.KV`), not `SOVV_DATA`.

### AI Gateways

| Gateway | Auth | Rate Limit |
|---------|------|------------|
| `sovereign-ai-gateway` | None | 100 req/min |
| `vscode-codespace-agent` | Auth-enabled | 500 req/min, 3 retries |

### Security

- **Turnstile:** `defrag-app-managed` — public form protection. Siteverify routes through `sovereign-os-api`. Browser never calls `challenges.cloudflare.com` directly.
- **Cloudflare Access:** Admin/staging route protection via JWT validation (`TEAM_DOMAIN`, `POLICY_AUD` secrets).

### Additional Workers

| Worker | Source | Route | Purpose |
|--------|--------|-------|---------|
| `sovereign-control` | `apps/sovereign-control/` | `operator.defrag.app/*` | Governed flow engine, AgentState DO (SQLite), operator dashboard |
| `developer` | `apps/developer/` | — | Developer worker (separate D1: `developer-db`, R2: `developer-assets`) |
| `sovereign-build-agent` | `apps/sovereign-build-agent/` | — | No routes, deployed via API |
| `sovereign-code-agent` | `apps/sovereign-code-agent/` | — | No routes, deployed via API |

### sovereign-control Worker

**Route:** `operator.defrag.app/*`
**Source:** `apps/sovereign-control/src/`
**Purpose:** Governed flow engine and operator dashboard for Sovereign.os.

**Durable Object:** `AgentState` — SQLite-backed storage for threads, messages, flows, audit log, and context.

**Secrets required:**
- `CF_API_TOKEN` — Cloudflare API token
- `GITHUB_READ_TOKEN` — GitHub read token
- `ENVIRONMENT_MODE` — set to `safe`

**wrangler.toml (canonical):**
```toml
name = "sovereign-control"
main = "./src/index.ts"
compatibility_date = "2026-06-19"
compatibility_flags = ["nodejs_compat"]
workers_dev = false

[[routes]]
pattern = "operator.defrag.app/*"
zone_id = "45a59d754ece9221fc97c92c461eb01f"

[ai]
binding = "AI"

[vars]
ENVIRONMENT = "production"
GATEWAY_ID = "sovereign-ai-gateway"

[[durable_objects.bindings]]
name = "AGENT_STATE"
class_name = "AgentState"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["AgentState"]

[observability]
enabled = true
```

### Orphaned KV Namespace

- `BASELINE_KV` (`c9155ffd7355462babf222bfabd2588f`) — no binding. Investigate and delete if empty.

### `sovereign-os-api` wrangler.toml (canonical)

```toml
name = "sovereign-os-api"
main = "./src/index.ts"
compatibility_date = "2026-06-01"
compatibility_flags = ["nodejs_compat"]
account_id = "8b1954d216d65077c6480d62583fe2c2"
workers_dev = false

[[routes]]
pattern = "api.defrag.app/*"
custom_domain = true

[[d1_databases]]
binding = "DB"
database_name = "vibesdk-db"
database_id = "c8c2fd8d-5297-46fc-8594-7629c8bad74d"

[[kv_namespaces]]
binding = "KV"
id = "3bd3ff5048a8468e82c574d7d66045c3"

[[r2_buckets]]
binding = "R2"
bucket_name = "vibesdk-templates"

[[queues.producers]]
binding = "PATTERN_QUEUE"
queue = "pattern-extraction-tasks"

[ai]
binding = "AI"

[[services]]
binding = "AI_SERVICE"
service = "worker-ai"

[[services]]
binding = "SESSION_SERVICE"
service = "worker-session"

[vars]
FREE_DAILY_LIMIT = "15"
AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast"
```

> **Known drift:** Live `wrangler.toml` uses `binding = "TEMPLATES"` for R2 instead of `"R2"`. The standard requires `"R2"`. Fix before next deploy.

### Worker Secrets (set via `npx wrangler secret put <NAME>`)

| Secret | Worker | Purpose |
|--------|--------|---------|
| `STRIPE_SECRET_KEY` | sovereign-os-api | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | sovereign-os-api | Stripe webhook HMAC |
| `STRIPE_PRICE_ID` | sovereign-os-api | Pro subscription price ID |
| `APP_URL` | sovereign-os-api | `https://app.defrag.app` |
| `TURNSTILE_SECRET_KEY` | sovereign-os-api | Turnstile server-side key |
| `TEAM_DOMAIN` | sovereign-os-api | Cloudflare Access team domain |
| `POLICY_AUD` | sovereign-os-api | Cloudflare Access policy AUD |
| `RESEND_API_KEY` | sovereign-os-api | Resend email fallback |
| `JWT_SECRET` | sovv-web | JWT signing secret |

---

## 4. Domain & Route Map

### Current Transition State (sovereign.os not yet in Cloudflare)

| Domain | Purpose | Served By |
|--------|---------|-----------|
| `defrag.app` | Sovereign.os platform landing (Defrag highlighted) | `sovv-web` |
| `www.defrag.app` | Same as defrag.app | `sovv-web` |
| `sovereign.defrag.app` | Temporary Sovereign.os platform entry (transitional only) | `sovv-web` |
| `app.defrag.app` | Authenticated Sovereign.os app shell | `sovv-web` |
| `api.defrag.app` | API Worker | `sovereign-os-api` |
| `ai.defrag.app` | AI Worker | `worker-ai` |
| `session.defrag.app` | Session Worker | `worker-session` |
| `operator.defrag.app` | Operator / sovereign-control Worker | `sovereign-control` |

> `sovereign.defrag.app` is transitional only. When `sovereign.os` is registered and added to Cloudflare, migrate to `sovereign.os` as the canonical platform landing.

### Future State (when sovereign.os is registered)

| Domain | Purpose |
|--------|---------|
| `sovereign.os` | Sovereign.os platform landing |
| `www.sovereign.os` | Same |
| `app.sovereign.os` | Authenticated app shell |
| `defrag.app` | Remains valid public entrypoint and brand bridge |

### DNS Records (defrag.app zone: `45a59d754ece9221fc97c92c461eb01f`)

All records must be proxied AAAA `100::` pointing to Workers — **NOT** Cloudflare Pages.

### App Route Map (sovv-web)

| URL Path | Purpose |
|----------|---------|
| `/` | Sovereign.os platform landing (Defrag highlighted) |
| `/apps/defrag` | Defrag space |
| `/apps/covenant` | Covenant space |
| `/apps/alignment` | Alignment space |
| `/app` | Legacy app shell (redirects to `/apps/defrag`) |
| `/app/login` | Authentication |
| `/settings` | Baseline Design settings |
| `/hub` | sovereign.defrag.app hub landing |
| `/covenant` | Covenant marketing page |
| `/product`, `/pricing`, `/about`, `/faq`, `/contact`, `/terms`, `/privacy` | Marketing pages |
| `/api/*` | Next.js API proxy routes (forward to `api.defrag.app`) |

### API Routes (sovereign-os-api)

| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Health: `{ "service": "sovereign-os-api", "status": "ok" }` |
| `/health` | GET | Health: `{ "ok": true, "service": "sovereign-os-api" }` |
| `/api/baseline` | GET | Fetch current user's Baseline Design |
| `/api/baseline` | POST | Save / update Baseline Design |
| `/api/explain` | POST | AI analysis (self or relational mode) |
| `/api/chips` | GET | Suggested prompts |
| `/api/history` | GET | Session history |
| `/api/history` | POST | Save to Library |
| `/api/patterns` | GET | Extracted behavioral patterns |
| `/api/patterns/verify` | POST | Pattern verification |
| `/api/auth/[...path]` | * | Auth routes |
| `/api/billing/checkout` | POST | Create Stripe checkout session |
| `/api/billing/portal` | POST | Stripe billing portal |
| `/api/billing/webhook` | POST | Stripe webhook handler |
| `/api/covenant` | POST | Covenant AI analysis |
| `/api/alignment` | POST | Alignment AI analysis |
| `/api/admin/me` | GET | Admin user info |
| `/api/admin/promo` | POST | Admin promo code management |
| `/api/promo/redeem` | POST | Redeem promo code |

---

## 5. Database Schema

**Database:** Cloudflare D1 — `vibesdk-db` (ID: `c8c2fd8d-5297-46fc-8594-7629c8bad74d`)

### Core Tables

```sql
-- Users: primary user records, auth metadata, subscription status, role
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tier TEXT DEFAULT 'free',
  role TEXT DEFAULT 'user',
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  subscription_current_period_end INTEGER,
  subscription_updated_at INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions: session tokens and expiry
CREATE TABLE IF NOT EXISTS sessions (
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Interactions: AI interaction history
CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT,
  content TEXT,
  mode TEXT,
  question TEXT,
  text TEXT,
  people TEXT,
  result TEXT,
  confidence TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patterns: extracted behavioral patterns (background queue)
CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, key)
);

-- People: user-defined people for relational threads
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Library: unified saved-work layer for all spaces
CREATE TABLE IF NOT EXISTS library (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  workspace_source TEXT NOT NULL CHECK(workspace_source IN ('DEFRAG', 'COVENANT', 'ALIGNMENT')),
  title TEXT,
  payload JSON,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_library_user_id_source ON library (user_id, workspace_source);

-- Subscriptions: Stripe subscription records
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_id TEXT,
  current_period_end INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Promo codes: ambassador promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  applicable_tiers TEXT NOT NULL,
  max_uses INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stripe events (idempotency)
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Relationship comparisons
CREATE TABLE IF NOT EXISTS relationship_comparisons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_person_id TEXT NOT NULL,
  comparison_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Expected Tables (full list)

`users`, `sessions`, `interactions`, `patterns`, `people`, `promo_codes`, `support_tickets`, `subscriptions`, `stripe_prices`, `library`, `ai_conversations`, `design_inputs`, `design_facts`, `subscription_states`, `stripe_events`, `relationship_comparisons`

### Running Migrations

```bash
wrangler d1 execute vibesdk-db --remote --file=apps/worker/migrations/<file>.sql
```

---

## 6. Baseline Design Engine

### What Is the Baseline Design

The Baseline Design is the user's starting map. It is derived from:
- **DOB** — date of birth
- **TOB** — time of birth
- **POB** — place of birth

It shows how the user tends to process, respond, connect, protect, communicate, and return to center.

### Storage

| Layer | Key | Content |
|-------|-----|---------|
| KV (`env.KV`) | `baseline:{session_id}` | Serialized `Baseline` object (DOB, TOB, POB, version, timestamps) |
| KV (`env.KV`) | `user:{session_id}` | User metadata (created, updated, baselineAt) |

**Baseline Design is NOT stored in D1.** There is no `designs` or `baseline_design` table. It lives entirely in KV.

### Privacy Rules

- **Never exposed in client responses** — all Baseline Design computation is server-side only
- **Shared across all spaces** — Defrag, Covenant, and Alignment all use the same Baseline Design
- **Injected into AI prompts server-side only** — never sent to the browser

### Internal Code Identifiers (Legacy Names — Do Not Rename Without Migration)

| Identifier | File | Represents |
|------------|------|------------|
| `getBaseline(env, sid)` | `apps/worker/src/baseline.ts` | Fetch Baseline Design from KV |
| `saveBaseline(env, sid, data)` | `apps/worker/src/baseline.ts` | Save Baseline Design to KV |
| `formatBaseline(baseline)` | `apps/worker/src/baseline.ts` | Format for AI prompt injection |
| `BaselineRequest` | `packages/core/src/types.ts` | Input type (DOB, TOB, POB) |
| `Baseline` | `packages/core/src/types.ts` | Full record with version and timestamps |
| `BASELINE_VERSION` | `packages/core/src/types.ts` | Current schema version |
| `BASELINE_KEY(sid)` | `apps/worker/src/baseline.ts` | KV key generator |
| `baselineContext` | `apps/worker/src/prompt.ts` | Formatted string for AI prompt |
| `baseline_loaded` | `packages/core/src/types.ts` | Whether Baseline Design is loaded in thread |

### AI Prompt Injection Format

```
Baseline (internal only):
DOB: {dob}
TOB: {tob}
POB: {pob}
```

Rules:
- AI must use Baseline Design for consistency but must **not mention it** in the answer
- AI must not invent Baseline Design facts if none are provided
- If Baseline Design is missing, the `needs_baseline` flow returns a structured error to the client

---

## 7. App Spaces Architecture

### Space Summary

| Space | Route | File | Library `workspace_source` |
|-------|-------|------|---------------------------|
| Defrag | `/apps/defrag` | `apps/web/app/apps/defrag/page.tsx` | `"DEFRAG"` |
| Covenant | `/apps/covenant` | `apps/web/app/apps/covenant/page.tsx` | `"COVENANT"` |
| Alignment | `/apps/alignment` | `apps/web/app/apps/alignment/page.tsx` | `"ALIGNMENT"` |

### Defrag Space

**Purpose:** Relational intelligence. Helps you understand what is active in the moment, where the loop is forming, and what response gives the moment a better chance. Supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics.

**API routes used:**
- `GET /api/baseline` — load Baseline Design
- `POST /api/explain` — AI analysis (self or relational mode)
- `GET /api/chips` — suggested prompts
- `GET /api/history` — session history
- `POST /api/history` — save to Library with `workspace_source: "DEFRAG"`
- `GET /api/patterns` — extracted behavioral patterns
- `GET /api/auth/tier` — subscription tier check

### Covenant Space

**Purpose:** Optional faith-context reflection. User-initiated, plain-language, private by design.

**API routes used:**
- `GET /api/baseline` — load shared Baseline Design
- `POST /api/covenant` — Covenant AI analysis
- `POST /api/history` — save to Library with `workspace_source: "COVENANT"`
- `GET /api/auth/tier` — subscription tier check (Pro required)

**AI system prompt:** `apps/worker/src/covenant.ts` — `SYSTEM_COVENANT`

### Alignment Space

**Purpose:** Response integration and action choice. Helps turn insights into actionable responses.

**Canonical Output:** Alignment Brief

**API routes used:**
- `GET /api/baseline` — load shared Baseline Design
- `POST /api/alignment` — Alignment AI analysis
- `POST /api/history` — save to Library with `workspace_source: "ALIGNMENT"`
- `GET /api/auth/tier` — subscription tier check

**AI system prompt:** `apps/worker/src/alignment.ts` — `SYSTEM_ALIGNMENT`

### Subscription Gating

| Feature | Free | Pro |
|---------|------|-----|
| Defrag space access | ✅ | ✅ |
| Baseline Design setup | ✅ | ✅ |
| Active pattern surface | ✅ | ✅ |
| Best Next Response | ✅ | ✅ |
| Basic session history | ✅ | ✅ |
| 5 sessions/day limit | ✅ | — |
| Unlimited sessions | — | ✅ |
| Your Story (full history) | — | ✅ |
| Compare With Someone | — | ✅ |
| Try It Out | — | ✅ |
| Audio summaries | — | ✅ |
| Watch It | — | ✅ |
| Covenant space | — | ✅ |
| Priority processing | — | ✅ |

**Gate behavior:** `402 Payment Required` returned for workspace routes (`/api/explain`, `/api/baseline`, `/api/patterns`, `/api/history`, `/api/chips`) when `subscription_status` is not `active`.

### Adding a New Space (Protocol)

1. Create `apps/web/app/apps/{space-name}/page.tsx`
2. Use shared auth: `fetch("/api/auth/tier", { credentials: "include" })`
3. Use shared Baseline Design: `fetch("/api/baseline", { credentials: "include" })`
4. Save to shared Library: `POST /api/history` with `workspace_source: "{SPACE_NAME}"`
5. Add `workspace_source` value to D1 `library` table CHECK constraint via migration
6. Add space route to middleware if host-based routing is needed
7. Add space to the Sovereign.os landing page (`apps/web/app/page.tsx`)
8. Document the space in `docs/07_APP_SPACES_ARCHITECTURE.md`
9. **Do NOT create separate auth, subscription, Baseline Design, Library, or invite systems**

---

## 8. AI Prompt System

### AI Model

`@cf/meta/llama-3.1-8b-instruct-fast` (Cloudflare Workers AI)

### System Rules (SYSTEM_RULES)

The AI responds **only as valid JSON** with this structure:

```json
{
  "whatsGoingOn": "",
  "whyRepeating": "",
  "frame": "",
  "pressure": "",
  "activation": "",
  "rising": "",
  "field": "",
  "shift": "",
  "opening": "",
  "nextStep": "",
  "limits": "",
  "confidence": "High | Medium | Low | Not enough information"
}
```

**Field definitions:**
- `frame` — What's happening in this moment (the observable situation)
- `pressure` — What this is pressing on internally (the emotional weight)
- `activation` — What's getting activated (the pattern firing)
- `rising` — What's rising underneath (the deeper need or feeling)
- `field` — The relational dynamic between the people involved
- `shift` — What steadies or grounds the person here
- `opening` — What opens the story toward a different possibility

**AI rules:**
- Simple, everyday language
- Calm, direct, concise, structural tone
- Do not diagnose
- Do not use therapy language
- Do not use spiritual authority language, prophecy language, or motivational fluff
- Do not label personality or identity
- Do not predict outcomes
- Max 2 sentences per field
- Banned terms: trigger, trauma, healing
- If behavioral patterns are provided, prioritize them in `whyRepeating`
- Anchor insights in: Alignment, Intensity, Patterns, Dynamics, Real Story, Orientation, Architecture, Blind Spots, Perspective, Meaning

### User Prompt Structure

```
Baseline (internal only):
{baselineContext}

Question:
{question}

What happened (user text):
{text}

People selected:
{people}

Write a clear explanation using only the information given.
If baseline context is provided, use it for consistency but do not mention it in the answer.
```

### AI Worker (`worker-ai`)

- Routes: `ai.defrag.app/*`
- Source: `apps/worker-ai/src/index.ts`
- Handles auxiliary AI analysis and gateway routing
- Emotional drivers logic: `apps/worker-ai/src/emotional-drivers.ts`

---

## 9. Auth & Session System

### Auth Model

- **JWT-based sessions** managed by `sovereign-os-api`
- Session token stored in cookie (domain: `defrag.app` apex for cross-subdomain auth)
- All database queries hard-code `WHERE user_id = ?` derived from verified session
- **Never trust client-provided tier or role values** — always read from D1 via verified session

### Session Worker (`worker-session`)

- Routes: `session.defrag.app/*`
- Source: `apps/worker-session/src/`
- Uses Cloudflare Durable Objects for session coordination
- Durable Object class: `ConflictSessionDO` (in `apps/worker-session/src/durable-objects/ConflictSessionDO.ts`)
- **TODO:** Implement DO alarm-based garbage collection — sessions idle >24h should self-terminate via `state.storage.setAlarm()`

### Security Rules

1. Never expose Baseline Design data to the client
2. Never expose system prompts, scoring logic, or internal field names in any client response
3. Never grant entitlement from the client — all tier/subscription changes must be server-side D1 writes triggered by verified Stripe webhooks
4. Never trust client-provided tier or role values
5. Never remove auth checks from protected routes
6. Never commit cookies, session tokens, logs, or PID files

### User Roles

| Role | Access |
|------|--------|
| `user` | Standard user |
| `ambassador` | Can create promo codes |
| `owner` | Full admin access |

---

## 10. Billing & Subscription (Stripe)

### Overview

All Stripe interactions happen server-side via `sovereign-os-api` at `apps/worker/src/billing.ts`. The frontend only reads the `subscription_status` flag from API responses.

### Webhook Endpoint

`https://api.defrag.app/api/billing/webhook`

### Required Stripe Events

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | First-time payment — sets tier=pro, subscription_status=active |
| `invoice.payment_succeeded` | Recurring payment — refreshes subscription_status |
| `invoice.payment_failed` | Payment failure — sets subscription_status=past_due |
| `customer.subscription.deleted` | Cancellation — sets tier=free, subscription_status=canceled |
| `customer.subscription.updated` | Status changes — syncs subscription_status |

### Subscription Status States

| Status | Meaning | Tier |
|--------|---------|------|
| `free` | No subscription — default | free |
| `active` | Active and in good standing | pro |
| `past_due` | Payment failed — grace period | pro (degraded) |
| `canceled` | Subscription ended | free |
| `incomplete` | First payment pending | free |

### Checkout Flow

- Creates checkout session using `env.STRIPE_PRICE_ID`, quantity=1, mode=subscription
- `success_url`: `${env.APP_URL}/app?upgraded=1`
- `cancel_url`: `${env.APP_URL}/app?canceled=1`

---

## 11. Email System

### Public Contact

**One primary public inbox: `info@defrag.app`**

Handles: general questions, support, privacy/data requests, legal questions, account help.

**Do not create** `privacy@`, `legal@`, `billing@`, `security@`, `admin@`, `hello@`, or `support@` inboxes unless explicitly approved.

### Transactional Email Standard

- **From:** `Sovereign.os <info@defrag.app>`
- **Reply-To:** `info@defrag.app`
- **Provider:** Resend API (current active) → Cloudflare `send_email` binding (preferred, pending Email Routing setup)
- **Implementation:** `apps/worker/src/email.ts`

### Subject Line Standard

| Event | Subject |
|-------|---------|
| Welcome / Pro activated | `Pro is active — Sovereign.os` |
| Payment succeeded | `Subscription renewed — Sovereign.os` |
| Payment failed | `Payment failed — action required — Sovereign.os` |
| Cancellation | `Subscription canceled — Sovereign.os` |

### Email Templates

**1. Welcome / Pro Activated**
```
Pro is active.

Your Baseline Design is set. The thread is grounded. You now have access to the full pattern.

What unlocked:
Unlimited sessions · Your Story · Compare With Someone · Try It Out · Covenant space · Full history

[Enter your space] → https://app.defrag.app/apps/defrag
```

**2. Payment Succeeded (Renewal)**
```
Your subscription renewed.

Your Pro access continues. The thread stays grounded.

[Enter your space] → https://app.defrag.app/apps/defrag
```

**3. Payment Failed**
```
Payment did not go through.

We were unable to process your subscription payment. Your access continues while we retry.

To keep Pro active, update your payment method.

[Update Payment Method] → https://billing.stripe.com/p/login

Questions? info@defrag.app
```

**4. Subscription Canceled**
```
Your Pro subscription has been canceled.

Your account has returned to the free tier. Your Baseline Design and saved history remain available.

You can resubscribe at any time.

[Return to your space] → https://app.defrag.app

Questions? info@defrag.app
```

### Email Routing Setup (Pending)

To activate Cloudflare native email (currently using Resend as fallback):
1. Enable Email Routing on `defrag.app` in Cloudflare Dashboard → Email → Email Routing
2. Add and verify destination address
3. Create routing rule for `info@defrag.app`
4. Add `[[send_email]]` binding to `apps/worker/wrangler.toml`
5. Redeploy `sovereign-os-api`

**Do not configure `sovereign.os` email until that domain is registered and in Cloudflare.**

---

## 12. Build & Deploy Standard

> **This section is intentionally minimal.** Full deploy commands, Workers Builds configuration, and CLI instructions live in:
> - **AGENTS.md** — quick-reference commands and bindings
> - **Runtime Contract** — enforcement rules for deployments

### Summary

- Primary deploy path: Cloudflare Workers Builds (push to `main` → auto-deploy)
- Ship script: `npm run ship -- "description"`
- Node version: 22 required everywhere
- Production artifact: `apps/web/.open-next/worker.js` + `.open-next/assets/`
- Never deploy via Cloudflare Pages, GitHub Actions, or direct `.next/` output

## 13. UI Visual Quality Standard

### Design System

- **Palette:** Strictly monochrome/charcoal. No decorative gradients. No colorful elements unless explicitly defined.
- **Background:** `bg-[#020202]` + `bg-background` Tailwind utility on `<body>`
- **Borders:** 1px white borders
- **Typography:** JetBrains Mono, SF Mono, `ui-monospace` fallback
- **Corners:** Zero rounded corners
- **Layout:** Prefer "bento-style" grids and visually delineated structural containers over raw text walls

### CSS & Tailwind

- Use CSS custom properties in `globals.css` (e.g., `--bg-primary`, `--accent-oxblood`) combined with Tailwind config mapping
- Tailwind content resolution must explicitly include `ui`, `marketing`, and `workspace` paths to prevent CSS purging
- Button components use cubic bezier transition `(0.16, 1, 0.3, 1)`
- Consistent hover and focus states (focus-visible rings) for accessibility

### Shell Architecture

- **Desktop:** 3-column app shell
- **Mobile:** Horizontally scroll-locked, segmented tabs (eliminates horizontal overflow on iOS)
- Minimum tap target: 44px on mobile
- Text inputs: exactly `16px` to prevent iOS auto-zoom
- Layouts incorporate `safe-top` and `safe-bottom` CSS classes mapping to `env(safe-area-inset-*)`

### Known Issue: Font Loading

JetBrains Mono is not bundled via `@next/font`. Without `@font-face` declarations or `next/font/local` imports, non-developer users degrade to `ui-monospace`. **Recommendation:** Integrate `@next/font/local` in `apps/web/app/layout.tsx` to bundle JetBrains Mono into `.open-next/assets`.

---

## 14. Product Language & Naming Rules

### Canonical Terms

| Term | Use In |
|------|--------|
| Baseline Design | All user-facing copy, docs, prompts, emails, UI labels |
| Sources | What the AI draws from |
| Result | AI output |
| Active pattern | What is currently active in the moment |
| The Repeat | The recurring loop |
| Old Role | The pattern learned under pressure |
| What You Learned to Carry | The adaptive behavior |
| Strain Pattern | Where strength bends under pressure |
| Gift Under Strain | The strength underneath the pattern |
| Alignment | What brings the user back to center |
| Best Next Response | The concrete next move |
| Conversational Steering | Practicing the response |
| Save to Sovereign | Saving to the Library |
| Library | The saved work layer |
| Defrag space | The relational intelligence space |
| Covenant space | The faith-context reflection space |
| Alignment space | The response integration and action choice space |
| Sovereign.os platform | The parent platform |

### Naming Rules — Enforce in All Generated Code and Copy

| Use | Never Use |
|-----|-----------|
| `Baseline Design` (user-facing) | `Design`, `Your Design`, `baseline` (user-facing) |
| `Defrag` (body copy) | `DEFRAG` (body copy) |
| `DEFRAG` (logo/header/doc title only) | `DEFRAG` (body copy) |
| `space`, `guided space`, `reflection space` | `Workbench`, `workspace` (for spaces) |
| `Sovereign.os` | `SOVV` (user-facing) |
| "what is active in the moment" / "active pattern" | "got lit up" / "lit up" (body copy) |
| `info@defrag.app` | `privacy@defrag.app`, `legal@defrag.app`, `covenant.app` addresses |

### Capitalization Rules

| Context | Rule | Example |
|---------|------|---------|
| Defrag in body copy | Title case | "Defrag helps you understand what is active in the moment." |
| Defrag in logo/header/doc title | All caps | "DEFRAG" |
| Covenant in body copy | Title case | "Covenant is optional." |
| Baseline Design | Always capitalized | "Your Baseline Design is the starting map." |
| Sovereign.os | Always as written | "Sovereign.os is the parent platform." |
| SOVEREIGN.OS | All caps only in header/logo | Header: `SOVEREIGN.OS` |

### Forbidden Terms in User-Facing Copy

| Forbidden | Use Instead |
|-----------|-------------|
| DEFRAG (in body copy) | Defrag |
| Workbench | space, guided space, reflection space |
| workspace (for spaces) | space |
| Design (alone, user-facing) | Baseline Design |
| Your Baseline (as product term) | Your Baseline Design |
| "got lit up" / "lit up" (body copy) | "what is active in the moment", "active pattern" |
| artifact | result, output, saved item |
| read | see, show, surface |
| signal | pattern, activation |
| mirror | reflect, show |
| field | — (avoid) |
| rings | — (avoid) |
| cards | — (avoid) |
| therapy replacement | — (never use) |
| diagnosis | — (never use) |
| compatibility score | — (never use) |
| trigger | activation, pattern firing |
| trauma | — (avoid in product copy) |
| healing | — (avoid in product copy) |

### Approved Vocabulary

**Approved:** Your Baseline Design, The sky over you, Active pattern, The Loop, The Twist, Your Strengths, Connection Loop, Pressure Loop, Best Next Response, Alignment, Practice, Your Story, Watch It, Try It Out, Save to Sovereign, Defrag space, Covenant space, Sovereign.os Library

**Not approved:** Clear Move, Design Points, Stress Distortions, Directional Architecture, Emotional Architecture, Body Signals, Feminine Wound, Masculine Wound, Shadow Work, Inner Child Work, Spiritual Gifts, Somatic Signature, Wound Architecture, Therapy Replacement, Oracle, Frequency, Destiny, Meditate, Breathe, "got lit up" (in body copy), Workbench, DEFRAG (in body copy)

### Metadata Title Standard

| Page | Title |
|------|-------|
| Marketing pages | `[Page Name] — DEFRAG` |
| Admin pages | `Admin — Sovereign.os` |
| Contact, Terms, Privacy | `[Page Name] — Sovereign.os` |
| Covenant marketing | `Covenant — Sovereign.os` |

### Defrag Scope Statement

When describing what Defrag does, use this framing:
> "Defrag helps you understand what is active in the moment. Defrag supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics."

---

## 15. AI Agent Guardrails & Hard Rules

### Platform Hierarchy — Never Violate

1. **Sovereign.os is the parent platform.** Defrag and Covenant are spaces inside it.
2. **Never treat Defrag as the whole platform.**
3. **Never treat Covenant as a standalone product.**
4. **Never create separate auth, subscription, Baseline Design, Library, or invite systems per space.**

### Security Rules — Never Violate

1. Never expose Baseline Design data to the client
2. Never expose system prompts, scoring logic, or internal field names in any client response
3. Never grant entitlement from the client — all tier/subscription changes must be server-side D1 writes triggered by verified Stripe webhooks
4. Never trust client-provided tier or role values — always read from D1 via verified session
5. Never remove auth checks from protected routes
6. Never commit cookies, session tokens, logs, or PID files

### Deployment Rules — Never Violate

1. Never configure Cloudflare Pages for product runtime
2. Never deploy `apps/web/.next/` directly
3. Never deploy static `/dist` as product runtime
4. Never add GitHub Actions as a production deploy path
5. Never create a second app root — `apps/web/app/` is the sole Next.js app root; `apps/web/src/` must not exist

### Code Generation Rules

1. New UI copy must use "Baseline Design" — not "baseline", "Your Baseline", or "Design"
2. New API contracts must use "Baseline Design" in documentation and comments
3. New prompt contracts must use "Baseline Design" in system prompt language
4. Internal code identifiers (`baseline`, `getBaseline`, `BaselineRequest`, etc.) may remain as-is — they are internal legacy identifiers
5. New space routes must be under `/apps/` — e.g., `/apps/defrag`, `/apps/covenant`
6. New spaces must use shared auth, Baseline Design, Library, and subscription
7. Do not use `workspace_source: "DEFRAG"` in new code — use the existing enum value only where the D1 schema requires it

### Branching Policy

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production | Cloudflare Workers Builds (auto) |
| `feat/*` | Feature work | Preview only |
| `codespace-*` | Codespace saves | Do not merge directly — review first |

- **Cohesive Development:** Build on `main` or a single active feature branch. No "one-off" feature branches for minor fixes.
- **Autonomous PR Resolution:** Resolve merge conflicts by favoring `main` branch's architectural Source of Truth.
- **Drift Prevention:** If more than one non-main branch exists, consolidate or close orphaned branches before starting new work.

### Stop Conditions — Ask Before Proceeding

Stop and ask before:
- Changing worker prompt logic
- Modifying auth or session handling
- Adding new API routes
- Changing Baseline Design storage format
- Touching middleware
- Adding a new space without confirming shared resource usage
- Changing the D1 schema
- Modifying Stripe webhook handling
- Adding client-side entitlement logic

### Red Flags — Revert Immediately

| Signal | Action |
|--------|--------|
| Exposes raw Baseline Design data to client | Revert immediately |
| Exposes scoring weights or internal field names | Revert immediately |
| Surfaces system prompts in any response | Revert immediately |
| Introduces diagnosis or therapy language in UI | Revert immediately |
| Introduces outcome guarantees or accuracy claims | Revert immediately |
| Adds client-trusted logic for permissions or tier | Revert immediately |
| Breaks build | Do not push |
| Removes auth check from protected route | Revert immediately |
| Creates separate auth/subscription/Library for a space | Revert immediately |
| Uses "DEFRAG" in normal body copy | Fix before pushing |
| Uses "Workbench" in user-facing copy | Fix before pushing |
| Uses "Design" without "Baseline" in user-facing copy | Fix before pushing |

### Emergency Protocol: Systemic Drift Reset

If any output, copy, or UI uses diagnostic language (anxious, avoidant, attachment style), identity-based labeling, therapy framing, spiritual authority tone, or vague abstraction:

1. HALT execution
2. IDENTIFY violating term
3. REPLACE with system-neutral wording
4. APPEND: "This explains a pattern — not who you are."
5. REVALIDATE against `docs/01_PRODUCT_LANGUAGE.md`

**This rule overrides all others.**

---

## 16. Acceptance Tests & Drift Checks

### Deployment Verification

```bash
# Verify all domains served by Worker
curl -I https://defrag.app | grep -E "cf-worker|server"
curl -I https://www.defrag.app | grep -E "cf-worker|server"
curl -I https://sovereign.defrag.app | grep -E "cf-worker|server"
curl -I https://app.defrag.app | grep -E "cf-worker|server"

# Verify API Worker health
curl -s https://api.defrag.app/health
# Expected: { "ok": true, "service": "sovereign-os-api", "timestamp": "..." }

curl -s https://api.defrag.app/
# Expected: { "service": "sovereign-os-api", "status": "ok" }
```

### Naming Compliance Checks

```bash
# Check for DEFRAG in body copy (should only appear in titles/metadata/headers)
grep -rn '"DEFRAG\|>DEFRAG\| DEFRAG ' apps/web/app/ apps/web/components/ apps/web/data/ \
  | grep -v "title:\|metadata\|eyebrow\|SOVEREIGN\|// " \
  | grep -v "node_modules"

# Check for Workbench in user-facing copy
grep -rn "Workbench\|WORKBENCH" apps/web/app/ apps/web/components/ apps/web/data/

# Check for "Your Baseline" without "Design"
grep -rn "Your Baseline[^D]" apps/web/app/ apps/web/components/ apps/web/data/

# Check for workspace where space is required
grep -rn "ENTER WORKBENCH\|Enter Workspace\|Open Workspace\|Go to Workspace\|workspace tier" \
  apps/web/app/ apps/web/components/

# Check for duplicate app root
ls apps/web/src/ 2>/dev/null && echo "ERROR: src/ exists — delete it" || echo "OK: no src/"

# Check for committed sensitive files
git ls-files | grep -E "cookies\.txt|\.log$|\.pid$|wrangler\.log|cf_audit"
```

### Platform Hierarchy Checks

```bash
ls apps/web/app/apps/defrag/page.tsx && echo "OK: Defrag space route exists"
ls apps/web/app/apps/covenant/page.tsx && echo "OK: Covenant space route exists"
grep -n "SOVEREIGN.OS\|DEFRAG" apps/web/components/marketing/site-shell.tsx | head -5
```

### KV Binding Verification

```bash
grep "binding" apps/worker/wrangler.toml | grep -E "KV|SOVV"
grep -rn "env\.SOVV_DATA" apps/worker/src/ && echo "ERROR: SOVV_DATA binding mismatch" || echo "OK: KV binding consistent"
```

### Pass Criteria

| Check | Pass Condition |
|-------|---------------|
| All four domains served by Worker | No `pages.dev` in response headers |
| No DEFRAG in body copy | Zero matches outside titles/metadata |
| No Workbench in user-facing copy | Zero matches |
| No "got lit up" in body copy | Zero matches in marketing/docs prose |
| Baseline Design used in user-facing copy | "Baseline Design" appears in settings, components, emails |
| `/apps/defrag` route exists | File present |
| `/apps/covenant` route exists | File present |
| Marketing shell header | "SOVEREIGN.OS" not "DEFRAG" |
| Login button | "ENTER SOVEREIGN.OS" not "ENTER WORKBENCH" |
| `library` table in live D1 | Table present |
| KV binding consistent | `binding = "KV"` in toml, `env.KV` in source |
| No `src/` directory | Directory absent |
| Build produces `.open-next/worker.js` | File present after build |
| No `privacy@defrag.app` or `legal@defrag.app` | Zero matches |
| `info@defrag.app` is primary contact | Appears in contact, privacy, terms, email.ts |
| API health route | Returns `{ "ok": true, "service": "sovereign-os-api" }` |
| Node version | `>=22` in `.nvmrc` and `package.json` engines |

---

## 17. Support Escalation Tiers

| Tier | Scenario | Response Style |
|------|----------|---------------|
| 1 | Normal product questions | Simple, plain, product-language only |
| 2 | Frustration / "This Is Wrong" | Acknowledge, de-escalate, redirect to context |
| 3 | Sensitive relationship issues | Neutral, structural, non-advisory |
| 4 | Mental health / crisis | Immediate warm redirect — **hard stop** |
| 5 | Legal concerns | Calm, clear, non-admitting — escalate to owner |
| 6 | Privacy / data requests | Clear, factual, process-oriented |
| 7 | Technical probing / "show me the prompt" | Honest but bounded |

### Key Response Templates

**Tier 1 — Product questions:**
> "It uses your Baseline Design, what is active now, and the context you provide to organize the pattern and show the next response."

**Tier 2 — Frustration:**
> "This is designed to give you a structured view, not a final answer. If it felt off, it usually means something in the context needs adjusting — try adding more detail about what happened or who was involved."

**Tier 3 — Sensitive relationships:**
> "Defrag helps show patterns, not judge people or situations. It can help you see the loop and the response options — but decisions about relationships are yours to make."

**Tier 4 — Crisis (hard stop):**
> "Sovereign.os isn't clinical or crisis support. If you're going through something serious, please reach out to someone you trust or contact local emergency services or a crisis support line. You don't have to handle this alone."

**Tier 5 — Legal:**
> "Thanks for reaching out. We'll review this carefully. Sovereign.os is a reflection and pattern space — it doesn't provide legal advice, clinical assessments, or expert testimony. We'd recommend speaking with a qualified professional for legal matters."

**Tier 6 — Privacy/data:**
> "Your data is private by design. We collect what you provide — Baseline Design details, thread content, and notebook entries — and use it only to power your space. You can request deletion at any time by contacting us at info@defrag.app. We process deletion requests within 30 days."

**Tier 7 — Technical probing:**
> "We show what helps you use the answer, not the private engine behind it. The system uses your Baseline Design, current timing context, and thread history to organize the pattern — but the specific logic stays private so the system can stay consistent and secure."

### General Principles

1. Clarity over depth — give the user what helps them use the product, not what explains the engine
2. Never diagnose — not people, not relationships, not situations
3. Never guarantee — not outcomes, not accuracy, not predictions
4. Never take sides — Defrag shows patterns; users make decisions
5. Always redirect crisis — no product conversation during a safety concern
6. Always stay in product language — use approved vocabulary only

---

## 18. Legal Positioning

### Product Category

**What Sovereign.os is:**
- AI-assisted personal and relational reflection platform
- Pattern recognition and response practice platform
- Baseline Design-aware AI platform with a living notebook and multiple guided spaces

**What Sovereign.os is NOT:**
- Therapy or therapeutic service
- Clinical diagnosis or assessment
- Medical advice or medical device
- Legal advice or legal service
- Predictive behavioral modeling
- Guaranteed outcome system
- Crisis intervention service
- Mental health treatment

### Claims to Never Make

- "This will fix your relationship"
- "This tells you what they feel"
- "This is an accurate prediction"
- "This diagnoses behavior"
- "This replaces therapy"
- "Clinically proven"
- "Scientifically validated"
- "Guaranteed results"
- "This is what you should do"
- "This person is [diagnosis]"
- "You have [condition]"
- "This is medically accurate"

### Key Protection Statements

| Use | Avoid |
|-----|-------|
| "helps show patterns" | "tells you what they feel" |
| "based on available context" | "accurately predicts" |
| "not a guarantee of outcome" | "will fix your relationship" |
| "user interpretation required" | "this is the right answer" |
| "a reflection space" | "a therapy replacement" |
| "organized from your Baseline Design" | "clinically validated" |
| "helps surface the active pattern" | "diagnoses the situation" |

### Intellectual Property (Proprietary — Never Disclose)

- System prompt chains
- Baseline Design synthesis logic
- Pattern extraction algorithms
- Scoring and weighting formulas
- Internal field mappings
- Worker orchestration logic
- Relationship overlay logic
- Media generation prompt templates

### Data & Privacy

- Birth details (DOB, TOB, POB) used only to generate the user's Baseline Design
- Thread content used only within the user's own session context
- No data sold or shared with third parties
- Users can request deletion at any time
- Deletion requests processed within 30 days
- Private by design — no raw Baseline Design data exposed in client responses

### Sensitive Areas

- **Mental health:** Not a mental health service. Redirect crisis immediately.
- **Relationship safety:** Does not assess whether a relationship is safe. Shows patterns only.
- **Children:** Not designed for users under 18. Do not market to minors.
- **Medical conditions:** Does not assess, diagnose, or treat medical or psychological conditions.
- **Legal proceedings:** Outputs are not expert testimony or legal evidence. Escalate to owner immediately.

---

## 19. Operator Playbook

### System Principles

1. **The engine is proprietary.** Baseline Design synthesis logic, pattern extraction, prompt chains, and scoring are server-side only. Never sent to the client. Never explained in detail to users.
2. **The UI shows useful summaries, not raw computation.** Users see: what is active in the moment, the loop, the twist, the strength, the Best Next Response.
3. **The user is never told what to do — only shown structure and options.**
4. **No guarantees of outcomes.**
5. **Private by design.**

### When Something Breaks

**AI output feels wrong or weak:**
1. Verify Baseline Design is present — check `/api/baseline` returns a valid baseline
2. Check thread context — was the message clear enough?
3. Check API health — is the worker responding normally?
4. If consistently weak, check pattern extraction is running

**Blank or empty results:**
1. Check Baseline Design exists — worker returns `needs_baseline` if missing
2. Check the explain route is reachable
3. Check Cloudflare Worker logs for errors

**Build fails after a patch:**
1. Run `npm run build` from repo root
2. Check TypeScript errors first
3. Do not push until build passes clean

### Release Discipline

Every patch must:
- Build successfully (0 errors)
- Not expose private engine data to the client
- Not change the product definition without explicit approval
- Not introduce new claims about outcomes or accuracy
- Not assume external services unless confirmed in code or Cloudflare bindings
- Have its own commit with a clear message
- Pass the naming compliance checks in `docs/09_ACCEPTANCE_TESTS.md`

### Current Stack

| Layer | Technology |
|-------|-----------|
| Platform | Sovereign.os (parent) with Defrag, Covenant, Alignment spaces |
| Frontend | Next.js 15, Cloudflare Worker (`sovv-web`) via OpenNext |
| API Worker | Cloudflare Worker (`api.defrag.app`) |
| Database | D1 (`vibesdk-db`) |
| Baseline Design storage | KV (binding: `KV`) |
| AI | Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fast`) |
| Auth | Session token + JWT |
| Billing | Stripe (keys in Worker env, not in source) |

### Files That Must Never Be Committed

```
cookies.txt
apps/worker/cookies.txt
apps/worker/login.log
apps/worker/login.pid
apps/worker/wrangler.log
*.log
*.pid
cf_audit.txt
fix_billing.js
update_index.js
tatus
deploy-worker.yml
apps/worker/src/deploy.yml
apps/worker/src/deploy-worker.yml
apps/web/wrangler.old.json
apps/web/tailwind.config.js
apps/web/src/
apps/web/app/todo.md
```

### The One App Root Rule

`apps/web/app/` is the **only** Next.js app root. `apps/web/src/` must not exist. If `apps/web/src/` reappears, delete it immediately.

---

## 20. Known Issues & Open TODOs

### Active Issues

| Issue | Location | Severity | Notes |
|-------|----------|----------|-------|
| R2 binding name drift | `apps/worker/wrangler.toml` | Medium | Uses `"TEMPLATES"` instead of `"R2"` — standard requires `"R2"` |
| Merge conflict in `types-env.ts` | `apps/worker/src/types-env.ts` | High | Unresolved `<<<<<<< HEAD` conflict between `GATEWAY_ID` and `ELEVENLABS_API_KEY` |
| No `INSERT INTO library` in API code | `apps/worker/src/` | High | Library table exists but no active write endpoints — `workspace_source` discriminator not yet implemented |
| "workbench" in billing.ts user-facing message | `apps/worker/src/billing.ts:82` | Medium | `"An active subscription is required to use the workbench."` — change to "space" or "platform" |
| JetBrains Mono not bundled | `apps/web/app/layout.tsx` | Low | No `@font-face` or `next/font/local` — degrades to system monospace on non-developer devices |
| `send_email` binding not yet wired | `apps/worker/wrangler.toml` | Low | Email Routing active on defrag.app, `[[email]]` binding added — verify destination is verified |
| `BASELINE_KV` orphaned KV namespace | Cloudflare Dashboard | Low | Investigate and delete if empty |

### New Workers (Added 2026-06-19/20)

| Worker | Status | Notes |
|--------|--------|-------|
| `sovereign-control` | ✅ Deployed | `operator.defrag.app/*`, AgentState DO with SQLite, secrets set |
| `sovereign-control-ui` | ✅ Present | Operator UI served by sovereign-control |
| `developer` | ✅ Present | Separate D1 (`developer-db`) and R2 (`developer-assets`) |

### Open TODOs

- [ ] Implement DO alarm-based garbage collection for `ConflictSessionDO` — sessions idle >24h should self-terminate via `state.storage.setAlarm()`
- [ ] Configure Cloudflare Email Routing on `defrag.app` and activate `send_email` binding
- [ ] Implement `INSERT INTO library` endpoints for all three spaces
- [ ] Fix merge conflict in `apps/worker/src/types-env.ts`
- [ ] Fix R2 binding name from `TEMPLATES` to `R2` in `apps/worker/wrangler.toml`
- [ ] Fix "workbench" language in `apps/worker/src/billing.ts:82`
- [ ] Bundle JetBrains Mono via `@next/font/local` in `apps/web/app/layout.tsx`
- [ ] Register `sovereign.os` domain and add to Cloudflare account
- [ ] Migrate `sovereign.defrag.app` → `sovereign.os` when domain is registered
- [ ] Decide fate of orphaned workers: `sovereign-build-agent`, `sovereign-code-agent`
- [ ] Future: Rename workers to `Sovereign-*` prefix (blocked until edge is stable)
- [ ] Seek legal review before launching paid tiers publicly or expanding to EU/GDPR jurisdictions

### Branches Requiring Review Before Merge

- `feat/host-routing` — routing concept valid but destination mapping conflicts with platform hierarchy
- `feat/api-wireup` — contains API wireup work; review for naming compliance
- `codespace-expert-umbrella-*` — emergency saves; cherry-pick useful commits only
- `codespace-symmetrical-meme-*` — emergency saves; cherry-pick useful commits only

---


---

## 21. Product → Execution Mapping

This section defines which tools and actions each space is permitted to use. No space may call deploy actions directly.

| Space | Tool Access | Output Type | Permitted Actions |
|-------|-------------|-------------|-------------------|
| **Defrag** | Inspect only | `DefragOutput` JSON | Pattern analysis, read Baseline Design, read history, read patterns |
| **Alignment** | None | `AlignmentOutput` JSON | Response-only layer — no tool usage |
| **Covenant** | None | `CovenantOutput` JSON | Reflection-only — no system interaction |
| **sovereign-control** | Full operator access | Governed flow | Agent orchestration, audit, flow engine |

### Rules

- Defrag uses inspect tools only — never executes actions on behalf of the user
- Alignment is a response-only layer — no tool calls, no side effects
- Covenant is reflection-only — no system interaction beyond reading Baseline Design
- No space may trigger deployments, write to D1 directly, or modify other users' data
- All writes to the `library` table must go through `POST /api/history` with a verified session

---

## 22. UI Output Contract

UI components render **directly** from structured output — no transformation logic, no parsing heuristics.

### 1:1 Component Mapping

| Output Type | UI Component | Source |
|-------------|-------------|--------|
| `DefragOutput` | `DefragOutput` component | `packages/core/src/types.ts` |
| `AlignmentOutput` | `AlignmentOutput` component | `packages/core/src/types.ts` |
| `CovenantOutput` | `CovenantOutput` component | `packages/core/src/types.ts` |

### DefragOutput Schema (canonical)

```typescript
interface DefragOutput {
  summary: string;                    // "What's happening"
  activePattern: string;              // "Active pattern"
  theRepeat: string;                  // "What keeps happening"
  oldRole: string;                    // "The role you're entering"
  whatYouLearnedToCarry: string;      // "What shaped this"
  strainPattern: string;              // "Where the pressure is"
  giftUnderStrain: string;            // "What's working"
  alignment: string;                  // "What gives this moment a better chance"
  bestNextResponse: {
    summary: string;
    phrasing?: string[];
  };
  conversationalSteering: {
    do: string[];
    avoid: string[];
  };
}
```

### AlignmentOutput Schema (canonical)

```typescript
interface AlignmentOutput {
  skyContext: string;       // "What this moment is asking"
  whatIsTrue: string;       // "What is actually happening"
  whatIsYours: string;      // "What is yours to carry"
  whatIsNotYours: string;   // "What is not yours to carry"
  theShift: string;         // "What a clean response looks like"
  nextStep: string;         // "One move"
  avoid: string;            // "What to release"
  alignment: string;        // "What staying true looks like"
}
```

### CovenantOutput Schema (canonical)

```typescript
interface CovenantOutput {
  figure: string;             // "The story"
  reference: string;          // Scripture reference
  pattern: string;            // "The pattern"
  story: string;              // "What happened"
  whatBroke: string;          // "What broke"
  howGodMet: string;          // "How presence showed up"
  whatTheyLearned: string;    // "What they learned"
  forYou: string;             // "What this means for you"
  nextStep: string;           // "One honest move"
  scriptures: string[];
  reflectionPrompts: string[];
}
```

### UI Rendering Rules

1. **1:1 mapping** — each output field maps to exactly one UI label (see `DEFRAG_LABELS`, `ALIGNMENT_LABELS`, `COVENANT_LABELS` in `prompts.ts`)
2. **No transformation** — UI renders directly from the parsed JSON — no reshaping, no fallback text generation
3. **No parsing heuristics** — if a field is missing or malformed, show an empty state — do not guess
4. **Field labels** are defined in `apps/worker/src/prompts.ts` — keep UI labels in sync with that file
5. **`bestNextResponse.phrasing`** is optional — only render if present

---

## 23. Conflict Resolution Rule

When instructions across documents conflict, resolve in this order:

```
1. Runtime Contract  →  overrides all other documents
2. Master Context    →  defines behavior intent when Runtime Contract is silent
3. AGENTS.md         →  reference only — never overrides 1 or 2
```

### Specific conflict scenarios

| Conflict | Resolution |
|----------|-----------|
| Runtime Contract vs Master Context | Runtime Contract wins |
| Runtime Contract vs AGENTS.md | Runtime Contract wins |
| Master Context vs AGENTS.md | Master Context wins |
| Two rules within Runtime Contract | More restrictive rule wins |
| Two rules within Master Context | More specific rule wins |
| Ambiguous instruction | Stop — ask for clarification — do not guess |

### What agents must NOT do

- Merge conflicting rules from different documents
- Average or compromise between conflicting instructions
- Apply the most recent instruction if it conflicts with a higher-authority document
- Proceed when genuinely ambiguous — stop and surface the conflict

---

## 24. Security — Token Rotation Protocol

The following credentials were exposed in a conversation context on 2026-06-20 and must be rotated immediately:

| Token | Type | Action Required |
|-------|------|----------------|
| `github_pat_11CDF5OWI0Ae3L3umsirGS_*` | GitHub PAT | **Revoke immediately** at github.com/settings/tokens |
| `cfat_0oV3LXYnA7jIGlUfaicG50oY56Rj*` | Cloudflare API Token | **Revoke immediately** at dash.cloudflare.com/profile/api-tokens |

### After rotation

1. Generate new GitHub PAT with `repo` scope only
2. Generate new Cloudflare API Token with minimum required permissions
3. Set new tokens as Worker secrets: `npx wrangler secret put CF_API_TOKEN --name=sovereign-control`
4. Never paste tokens into chat interfaces, markdown files, or any committed file
5. Use `.dev.vars` (gitignored) for local development only

*End of Sovereign.os Master Context Document*
*Generated from: README.md, AGENTS.md, PLAN.md, INFRASTRUCTURE.md, AUDIT_REPORT.md, RECOVERY_MANIFEST.md, ASSET_VERIFICATION_REPORT.md, .github/copilot-instructions.md, apps/web/AGENTS.md, docs/00–15, apps/worker/src/prompt.ts, apps/worker/src/types-env.ts, apps/worker/wrangler.toml, apps/worker/migrations/0001–0008*