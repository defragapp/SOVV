# Route Ownership

## Worker Route Map

| Domain / Pattern | Worker | Deployment |
|---|---|---|
| `defrag.app/*` | `sovv-web` | Cloudflare Workers Builds |
| `www.defrag.app/*` | `sovv-web` | Cloudflare Workers Builds |
| `sovereign.defrag.app/*` | `sovv-web` | Cloudflare Workers Builds |
| `app.defrag.app/*` | `sovv-web` | Cloudflare Workers Builds |
| `api.defrag.app` | `sovereign-os-api` | Wrangler deploy |
| `ai.defrag.app/*` | `worker-ai` | Wrangler deploy |
| `session.defrag.app/*` | `worker-session` | Wrangler deploy |

## DNS Records (defrag.app zone: `45a59d754ece9221fc97c92c461eb01f`)

| Record | Type | Content | Notes |
|---|---|---|---|
| `defrag.app` | A/AAAA | `192.0.2.1` / `100::` (proxied) | Must point to Worker, NOT Pages |
| `www.defrag.app` | A/AAAA | `192.0.2.1` / `100::` (proxied) | Must point to Worker, NOT Pages |
| `api.defrag.app` | AAAA | `100::` (proxied) | Worker custom domain |
| `ai.defrag.app` | AAAA | `100::` (proxied) | Worker route |
| `session.defrag.app` | A | `192.0.2.1` (proxied) | Worker route |

## Cloudflare Pages — PROHIBITED for product runtime

The `sovv-platform` Pages project **must be deleted** after Worker routes are confirmed.

**Required dashboard actions:**
1. Pages → `sovv-platform` → Custom Domains → Remove `defrag.app` and `www.defrag.app`
2. DNS → Update `defrag.app` CNAME to proxied A/AAAA Worker record
3. DNS → Update `www.defrag.app` CNAME to proxied A/AAAA Worker record
4. Verify `sovv-web` Worker serves both domains
5. Delete `sovv-platform` Pages project

## App Route Map (sovv-web Worker)

| URL Path | Purpose |
|---|---|
| `/` | Sovereign.os platform landing (Defrag highlighted) |
| `/apps/defrag` | Defrag space (relational intelligence) |
| `/apps/covenant` | Covenant space (faith-context reflection) |
| `/app` | Legacy app shell (redirects to `/apps/defrag`) |
| `/app/login` | Authentication |
| `/settings` | Baseline Design settings |
| `/hub` | sovereign.defrag.app hub landing |
| `/covenant` | Covenant marketing page |
| `/product`, `/pricing`, `/about`, etc. | Marketing pages |
| `/api/*` | Next.js API proxy routes (forward to `api.defrag.app`) |

## Orphaned Workers — Action Required

| Worker | Status | Action |
|---|---|---|
| `sovv` | No routes, no repo config | **Delete from dashboard** |
| `sovereign-build-agent` | No routes, deployed via API | Document or delete |
| `sovereign-code-agent` | No routes, deployed via API | Document or delete |

## KV Namespace Audit

| Namespace | Dashboard Title | Binding | Status |
|---|---|---|---|
| `3bd3ff5048a8468e82c574d7d66045c3` | `SOVV_DATA` | `KV` (in `sovereign-os-api`) | ✅ Active |
| `c9155ffd7355462babf222bfabd2588f` | `BASELINE_KV` | None | ❌ Orphaned — investigate and delete if empty |