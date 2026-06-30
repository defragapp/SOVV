# Cloudflare Infrastructure Inventory

> **Generated:** 2026-06-29  
> **Account:** Sovereign.os Platform Build (`8b1954d216d65077c6480d62583fe2c2`)  
> **Purpose:** Point-in-time snapshot of live Cloudflare resources.  
> **Do not edit manually.** Regenerate via API audit when infrastructure changes.

---

## Workers

| Worker | Latest Version | Last Deployed | Routes | Handlers | Status |
|---|---|---|---|---|---|
| `sovv-web` | `864` | `2026-06-29T18:42:29Z` | `defrag.app/*`, `www.defrag.app/*`, `app.defrag.app/*`, `sovereign.defrag.app/*`, `*defrag.app/_next/static/*` | `fetch` | ✅ active |
| `sovereign-os-api` | — | — | `api.defrag.app/*` | `fetch`, `queue`, `email` | ✅ active |
| `worker-ai` | — | — | `ai.defrag.app/*` | `fetch` | ✅ active |
| `worker-session` | — | — | `session.defrag.app/*` | `fetch` | ✅ active |
| `sovereign-os-api-production` | — | — | *(none)* | `fetch`, `queue`, `email` | ⚠️ no routes |
| `sovereign-control` | — | — | `operator.defrag.app/*` | `fetch` | ⚠️ unrelated |
| `sovereign-build-agent` | — | — | *(none visible)* | — | ⚠️ agent infra |
| `sovereign-code-agent` | — | — | *(none visible)* | — | ⚠️ agent infra |
| `chatthread` | — | — | `chat.defrag.app/*` | `fetch` | ⚠️ unrelated |
| `developer` | — | — | `developer.defrag.app/*` | `fetch` | ⚠️ unrelated |

---

## Bindings by Worker

### `sovv-web`

| Binding | Type | Target / Value |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | plain_text | `0x4AAAAAADhGIF8-iOLIg8MU` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | plain_text | `pk_live_51TV1FSBk78yJ8HwwY2Hx4u0YeqbBFYiooy9BEmAfL4k1GFm1lJbT8G74IfcO4Q3W2cYhBBUa2vtK3JMrFtVQCHft00951FHlMV` |
| `APP_URL` | secret_text | — |
| `CF_API_TOKEN` | secret_text | — |
| `CLOUDFLARE_ACCOUNT_ID` | secret_text | — |
| `NEXT_PUBLIC_API_BASE` | secret_text | — |
| `PAID_USERS_GROUP_ID` | secret_text | — |
| `STRIPE_ACCOUNT_ID` | secret_text | — |
| `STRIPE_PRICE_ID` | secret_text | — |
| `STRIPE_PUBLISHABLE_KEY` | secret_text | — |
| `STRIPE_SECRET_KEY` | secret_text | — |
| `STRIPE_WEBHOOK_SECRET` | secret_text | — |

**DO Classes:** `BucketCachePurge`, `DOQueueHandler`, `DOShardedTagCache`

### `sovereign-os-api`

| Binding | Type | Target / Value |
|---|---|---|
| `DB` | D1 | `vibesdk-db` (`c8c2fd8d-5297-46fc-8594-7629c8bad74d`) |
| `KV` | KV | `3bd3ff5048a8468e82c574d7d66045c3` |
| `TEMPLATES` | R2 | `vibesdk-templates` |
| `PATTERN_QUEUE` | Queue | `pattern-extraction-tasks` |
| `AI` | Workers AI | — |
| `AI_SERVICE` | Service | `worker-ai` (env: `production`) |
| `SESSION_SERVICE` | Service | `worker-session` (env: `production`) |
| `RATE_LIMITER` | Analytics Engine | namespace `100` |
| `AI_MODEL` | plain_text | `@cf/meta/llama-3.1-8b-instruct-fast` |
| `APP_URL` | plain_text | `https://app.defrag.app` |
| `FREE_DAILY_LIMIT` | plain_text | `15` |
| `GATEWAY_ID` | plain_text | `sovereign-ai-gateway` |

**Secrets:** `CF_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `COOKIE_DOMAIN`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `PAID_USERS_GROUP_ID`, `RESEND_API_KEY`, `STRIPE_ACCOUNT_ID`, `STRIPE_PRICE_ID`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`

### `worker-ai`

| Binding | Type | Target |
|---|---|---|
| `AI` | Workers AI | — |

### `worker-session`

| Binding | Type | Target |
|---|---|---|
| `CONFLICT_SESSION` | Durable Object | `ConflictSessionDO` (`315daf79eb3b481ebd561062679a1a45`) |
| `AI` | Workers AI | — |
| `AI_SERVICE` | Service | `worker-ai` (env: `production`) |

**Migration tag:** `v1`

---

## Storage Resources

### D1 Databases

| Name | ID | Managed by repo? |
|---|---|---|
| `vibesdk-db` | `c8c2fd8d-5297-46fc-8594-7629c8bad74d` | ✅ yes |
| `sovereign-db` | — | ❌ no |
| `chatthread-db` | — | ❌ no |
| `developer-db` | — | ❌ no |

### KV Namespaces

| ID | Bound as | Managed by repo? |
|---|---|---|
| `3bd3ff5048a8468e82c574d7d66045c3` | `KV` in `sovereign-os-api` | ✅ yes |

### R2 Buckets

| Name | Managed by repo? |
|---|---|
| `vibesdk-templates` | ✅ yes |
| `developer-assets` | ❌ no |
| `sovereign-images` | ❌ no |
| `sovv-codebase` | ❌ no |
| `web-opennext-cache` | ❌ no |

### Queues

| Name | Producers | Consumers | Managed by repo? |
|---|---|---|---|
| `pattern-extraction-tasks` | `sovereign-os-api`, `sovereign-os-api-production` | `sovereign-os-api` | ✅ yes |
| `build-jobs` | — | — | ❌ no |
| `sovereign-os-queue` | — | — | ❌ no |

---

## Turnstile Widgets

| Name | Sitekey | Domains | Managed by repo? |
|---|---|---|---|
| `Sovereign.os Auth` | `0x4AAAAAADhGIF8-iOLIg8MU` | `app.defrag.app` | ✅ yes |
| `defrag-app-managed` | `0x4AAAAAADfCOI_da9LLc2hj` | `defrag.app` | ❌ unknown |

---

## Drift Report: Live vs. Repo Wrangler Config

| Issue | Live State | Repo State (`wrangler.toml` / `wrangler.json`) | Severity |
|---|---|---|---|
| Extra routes on `sovv-web` | `sovereign.defrag.app/*`, `*defrag.app/_next/static/*` | Only `defrag.app`, `www.defrag.app`, `app.defrag.app` | ⚠️ medium |
| `sovv-web` DO classes | `BucketCachePurge`, `DOQueueHandler`, `DOShardedTagCache` | Not declared in checked `wrangler.json` | ⚠️ medium |
| `worker-session` extra bindings | `AI`, `AI_SERVICE` | Not declared in checked config | ⚠️ medium |
| `sovereign-os-api-production` | Exists, mirrors main API | Not in deploy path | ⚠️ low |
| `sovereign-os-api` secrets | `RESEND_API_KEY`, `COOKIE_DOMAIN`, `NEXT_PUBLIC_SUPABASE_*` | Not in onboarding checklist | ℹ️ informational |

---

## Next Audit

Regenerate this file after any of the following:

- New Worker deployment
- Binding addition/removal
- Route change
- D1/KV/R2/Queue provisioning
- Secret rotation
