# Cloudflare Platform Guide

> **Purpose:** Stable conventions and operational rules for the SOVV platform on Cloudflare.  
> **For live IDs and current inventory, see:** `ops/cloudflare-inventory-2026-06-29.md`

---

## Source of Truth

**Git is the source of truth.**  
**The Cloudflare Dashboard is not.**

Any change made in the Dashboard must be backfilled into Wrangler configuration and committed within 24 hours, or it will be lost on the next deployment.

---

## Architecture

```text
Browser
    │
    ▼
sovv-web (Next.js / Workers)
    │
    ▼
sovereign-os-api
    │
    ├── D1 (DB)
    ├── KV (KV)
    ├── R2 (TEMPLATES)
    ├── Queue (PATTERN_QUEUE)
    ├── AI (Workers AI)
    ├── Service → worker-ai (AI_SERVICE)
    ├── Service → worker-session (SESSION_SERVICE)
    └── Analytics Engine (RATE_LIMITER)
    │
    ▼
worker-ai ←── AI binding
    │
    ▼
worker-session ←── CONFLICT_SESSION (Durable Object)
```

---

## Worker Responsibilities

| Worker | Role | Route Pattern |
|---|---|---|
| `sovv-web` | Next.js frontend | `defrag.app/*`, `www.defrag.app/*`, `app.defrag.app/*` |
| `sovereign-os-api` | API backend | `api.defrag.app/*` |
| `worker-ai` | AI inference proxy | `ai.defrag.app/*` |
| `worker-session` | Session / DO manager | `session.defrag.app/*` |

---

## Binding Conventions

Use these exact binding names in Wrangler config and application code.

| Binding | Type | Purpose |
|---|---|---|
| `DB` | D1 | Primary application database |
| `KV` | KV | Key-value metadata and caching |
| `TEMPLATES` | R2 | File and template storage |
| `PATTERN_QUEUE` | Queue | Async task producer |
| `AI` | Workers AI | Direct AI model access |
| `AI_SERVICE` | Service | Cross-worker AI delegation |
| `SESSION_SERVICE` | Service | Cross-worker session delegation |
| `RATE_LIMITER` | Analytics Engine | Rate limiting data |
| `CONFLICT_SESSION` | Durable Object | Session state management |

---

## Durable Objects

- **DO names and migration tags are immutable.**
- Migrations are append-only. Never modify an existing migration file.
- New DO classes require a new migration entry.

---

## Queues

- Producers and consumers must remain synchronized.
- Never remove a queue producer without updating all dependent Workers.
- Queue names are treated as stable contracts.

---

## Secrets

Secrets are bound per-Worker via Wrangler. They are never committed to the repository.

Required secret names by Worker:

### `sovereign-os-api`

`CF_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `COOKIE_DOMAIN`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `PAID_USERS_GROUP_ID`, `RESEND_API_KEY`, `STRIPE_ACCOUNT_ID`, `STRIPE_PRICE_ID`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`

### `sovv-web`

`APP_URL`, `CF_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_API_BASE`, `PAID_USERS_GROUP_ID`, `STRIPE_ACCOUNT_ID`, `STRIPE_PRICE_ID`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### `worker-ai`

None.

### `worker-session`

*(Unable to verify via API — document manually if known.)*

---

## Deployment

Deployments originate from GitHub Actions only.

- `wrangler deploy` is the only authorized deployment mechanism.
- Dashboard changes are temporary until committed.
- Verification checklist after every deployment:
  1. `wrangler deploy --dry-run` passes for all Workers
  2. Service bindings resolve to existing Workers
  3. Routes do not conflict
  4. DO migrations are valid and additive

---

## Resources Outside Repo Scope

The following Workers exist in the account but are **not managed by this repository.** Do not modify them:

- `sovereign-os-api-production`
- `sovereign-control`
- `sovereign-build-agent`
- `sovereign-code-agent`
- `chatthread`
- `developer`

---

## Related Documents

- `ops/cloudflare-inventory-2026-06-29.md` — Live resource IDs and drift report
- `docs/runbooks/deploy.md` — Deployment procedure
- `docs/runbooks/rollback.md` — Rollback procedure
- `docs/runbooks/rotate-secrets.md` — Secret rotation
