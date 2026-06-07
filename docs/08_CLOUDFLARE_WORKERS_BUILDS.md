# Cloudflare Workers Builds Setup

## Status

**Primary deploy path:** Cloudflare Workers Builds (Git integration) from GitHub `main`.

GitHub Actions (`deploy-live.yml`) has been **deleted**. Do not restore it as a production deploy path.

**Note on sovereign.os:** The `sovereign.os` domain is not currently in this Cloudflare account. Use `sovereign.defrag.app` as the transitional platform entry. When `sovereign.os` is registered and added to Cloudflare, make it the canonical platform landing and update DNS, routes, and email accordingly.

---

## Node Version Requirement

**Node 22+ is required** for all build and deploy operations.

- `.nvmrc` in repo root specifies `22`
- `package.json` engines: `"node": ">=22"`
- Cloudflare Workers Builds: set Node version to 22 in build image settings if available
- Codespaces: `nvm use 22` before running wrangler commands

---

## Workers: sovereign-os-api (API Worker)

### Cloudflare Workers Builds Configuration

| Setting | Value |
|---|---|
| GitHub account | `defragapp` |
| Repository | `SOVV` |
| Branch | `main` |
| Root directory | `apps/worker` |
| Build command | `npm install` |
| Deploy command | `npx wrangler deploy` |
| Node version | `22` |

### Key config (`apps/worker/wrangler.toml`)

```toml
name = "sovereign-os-api"
main = "src/index.ts"
compatibility_date = "2026-06-04"
```

### Dependencies

- `itty-router: ^5.0.23` — in `apps/worker/package.json` dependencies ✅
- `@sovereign/core: 0.0.1` — local workspace package ✅
- All committed in `package-lock.json` ✅

### Validation

After deploy, verify:
```
GET https://api.defrag.app/health
→ { "ok": true, "service": "sovereign-os-api", "timestamp": "..." }

GET https://api.defrag.app/
→ { "service": "sovereign-os-api", "status": "ok" }
```

### KV Binding

`wrangler.toml` binds the `SOVV_DATA` KV namespace as `KV`:
```toml
[[kv_namespaces]]
binding = "KV"
id = "3bd3ff5048a8468e82c574d7d66045c3"
```
Source code uses `env.KV` — consistent ✅

---

## Workers: sovv-web (Next.js App Router)

### Cloudflare Workers Builds Configuration

| Setting | Value |
|---|---|
| GitHub account | `defragapp` |
| Repository | `SOVV` |
| Branch | `main` |
| Root directory | `apps/web` |
| Build command | `npm install` |
| Deploy command | `npm run deploy` |
| Node version | `22` |

**Note:** `npm run deploy` in `apps/web/package.json` runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy` — it builds AND deploys in one command. The build command only needs `npm install` to prepare dependencies.

### Key config (`apps/web/wrangler.json`)

```json
{
  "name": "sovv-web",
  "main": "./.open-next/worker.js",
  "assets": { "directory": ".open-next/assets" }
}
```

### Production artifact

```
apps/web/.open-next/worker.js   ← Worker entry point
apps/web/.open-next/assets/     ← Static assets
```

These are built by `npm run build:worker` (`opennextjs-cloudflare build`) and are gitignored — built fresh on each deploy.

### Environment variables (set in Workers Builds dashboard)

| Variable | Value |
|---|---|
| `JWT_SECRET` | (secret) |
| `NEXT_PUBLIC_API_URL` | `https://api.defrag.app` |
| `NEXT_PUBLIC_AI_URL` | `https://ai.defrag.app` |

---

## Cloudflare Dashboard Tasks (still required)

These cannot be done from the repo. See `docs/CLOUDFLARE_DASHBOARD_HANDOFF.md` for full click-by-click detail.

| # | Task | Priority |
|---|---|---|
| 1 | Remove `defrag.app`/`www.defrag.app` from Pages project `sovv-platform` | 🔴 Blocking |
| 2 | Update DNS: CNAME → proxied Worker A/AAAA records | 🔴 Blocking |
| 3 | Connect `sovv-web` to Cloudflare Workers Builds (GitHub main) | 🔴 Blocking |
| 4 | Connect `sovereign-os-api` to Cloudflare Workers Builds (GitHub main) | 🔴 Blocking |
| 5 | Delete `sovv-platform` Pages project (after Worker routes verified) | 🔴 After 1–3 |
| 6 | Redeploy `sovereign-os-api` (KV binding rename SOVV_DATA → KV) | 🟡 High |
| 7 | Delete orphaned `sovv` Worker | 🟡 High |
| 8 | Enable Email Routing on `defrag.app` + verify `info@defrag.app` | 🟡 High |
| 9 | Add `[[send_email]]` binding after Email Routing verified | 🟡 After 8 |
| 10 | Investigate/delete orphaned `BASELINE_KV` KV namespace | 🟢 Medium |

---

## Email Routing Dashboard Tasks

See `docs/email-routing-standard.md` for full setup steps. Summary:

1. **Email → Email Routing → defrag.app** → Enable Email Routing
2. **Destination addresses** → Add and verify private forwarding address
3. **Routing rules** → Create rule: `info` → verified destination
4. **After verification** → Add `[[send_email]]` binding to `apps/worker/wrangler.toml`:
   ```toml
   [[send_email]]
   name = "EMAIL"
   destination_address = "info@defrag.app"
   ```
5. Redeploy `sovereign-os-api` after adding binding

---

## Wrangler Manual Deploy (Fallback)

If Cloudflare Workers Builds is unavailable:

```bash
# Requires Node 22+
nvm use 22

# API Worker
cd apps/worker
npm install
CLOUDFLARE_API_TOKEN=<token> npx wrangler deploy

# Web Worker
cd apps/web
npm install
npm run build:worker
CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```