# Route Ownership

## Canonical Domain Hierarchy

### Preferred Final State (when sovereign.os is registered and in Cloudflare)

| Domain | Purpose | Served By |
|---|---|---|
| `sovereign.os` | Sovereign.os platform landing | `sovv-web` Worker |
| `www.sovereign.os` | Same as sovereign.os | `sovv-web` Worker |
| `app.sovereign.os` | Authenticated Sovereign.os app shell | `sovv-web` Worker |
| `defrag.app` | Routes to Sovereign.os landing (Defrag highlighted) | `sovv-web` Worker |
| `app.defrag.app` | Transitional authenticated shell / Defrag-highlighted entry | `sovv-web` Worker |
| `api.defrag.app` | API Worker | `sovereign-os-api` Worker |
| `ai.defrag.app` | AI Worker | `worker-ai` Worker |
| `session.defrag.app` | Session Worker | `worker-session` Worker |

### Current Transition State (sovereign.os NOT yet in Cloudflare account)

| Domain | Purpose | Served By |
|---|---|---|
| `defrag.app` | Sovereign.os platform landing (Defrag highlighted) | `sovv-web` Worker |
| `www.defrag.app` | Same as defrag.app | `sovv-web` Worker |
| `sovereign.defrag.app` | Temporary Sovereign.os platform entry | `sovv-web` Worker |
| `app.defrag.app` | Authenticated Sovereign.os app shell | `sovv-web` Worker |
| `api.defrag.app` | API Worker | `sovereign-os-api` Worker |
| `ai.defrag.app` | AI Worker | `worker-ai` Worker |
| `session.defrag.app` | Session Worker | `worker-session` Worker |

**Do not make `sovereign.defrag.app` the long-term canonical platform entry.** It is a transitional host only. When `sovereign.os` is registered and added to Cloudflare, migrate to `sovereign.os` as the canonical platform landing.

---

## DNS Records (defrag.app zone: `45a59d754ece9221fc97c92c461eb01f`)

| Record | Type | Content | Notes |
|---|---|---|---|
| `defrag.app` | A/AAAA | `192.0.2.1` / `100::` (proxied) | Must point to Worker, NOT Pages |
| `www.defrag.app` | A/AAAA | `192.0.2.1` / `100::` (proxied) | Must point to Worker, NOT Pages |
| `api.defrag.app` | AAAA | `100::` (proxied) | Worker custom domain |
| `ai.defrag.app` | AAAA | `100::` (proxied) | Worker route |
| `session.defrag.app` | A | `192.0.2.1` (proxied) | Worker route |

**Current problem:** `defrag.app` and `www.defrag.app` are CNAME → `sovv-platform.pages.dev`. This must be changed to proxied A/AAAA Worker records. See dashboard actions below.

---

## Cloudflare Pages — PROHIBITED for product runtime

The `sovv-platform` Pages project has been **deleted**. DNS records now point to Workers.

**Current DNS state (verified):**
- `defrag.app` → AAAA `100::` (proxied, Worker) ✅
- `www.defrag.app` → AAAA `100::` (proxied, Worker) ✅
- `app.defrag.app` → AAAA `100::` (proxied, Worker) ✅
- `sovereign.defrag.app` → AAAA `100::` (proxied, Worker) ✅
- `api.defrag.app` → AAAA `100::` (proxied, Worker) ✅

If a Pages project reappears, remove it immediately and restore DNS to Worker records.

---

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

---

## Future: sovereign.os Routes

When `sovereign.os` is registered and added to Cloudflare:

1. Add zone to Cloudflare account
2. Add routes to `apps/web/wrangler.json`:
   ```json
   { "pattern": "sovereign.os/*",     "zone_id": "<sovereign-os-zone-id>" },
   { "pattern": "www.sovereign.os/*", "zone_id": "<sovereign-os-zone-id>" },
   { "pattern": "app.sovereign.os/*", "zone_id": "<sovereign-os-zone-id>" }
   ```
3. Update middleware: `sovereign.os` → platform landing, `app.sovereign.os` → app shell
4. Update DNS for `sovereign.os` zone: proxied A/AAAA records
5. Update email: `From: Sovereign.os <info@sovereign.os>` (after Email Routing verified)
6. Keep `defrag.app` as a valid public entrypoint and brand bridge
7. Redirect `sovereign.defrag.app` → `sovereign.os`

---

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