# Cloudflare Workers Builds Setup

**See `docs/CLOUDFLARE_BUILDS_FINAL_STANDARD.md` for the canonical configuration.**

---

## Status

**Primary deploy path:** Cloudflare Workers Builds (Git integration) from GitHub `main`.

- `deploy-live.yml` has been **deleted**. Do not restore it.
- `sovv-platform` Pages project has been **deleted**. DNS points to Workers.
- `sovereign.os` domain is not in this Cloudflare account. Use `sovereign.defrag.app` as transitional platform entry.

---

## Node Version Requirement

**Node 22+ is required** for all build and deploy operations.

- `.nvmrc` in repo root: `22`
- `package.json` engines: `"node": ">=22"`
- `apps/web/package.json` engines: `"node": ">=22"`
- `apps/worker/package.json` engines: `"node": ">=22"`
- Workers Builds: set Node version to `22` in build settings

---

## sovv-web (Next.js App Router)

### Workers Builds Configuration

| Setting | Value |
|---|---|
| GitHub account | `defragapp` |
| Repository | `SOVV` |
| Branch | `main` |
| Root directory | `apps/web` |
| Build command | `npm install` |
| Deploy command | `npm run deploy` |
| Node version | `22` |

**Why `npm install` as build command:**
`apps/web/package.json` deploy script runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
Workers Builds runs build command first (installs deps), then deploy command (builds + deploys in one step).

Do NOT use `npm install && npm run build:worker` as build command — this runs OpenNext build twice.

### Key config (`apps/web/wrangler.json`)

```json
{
  "name": "sovv-web",
  "main": "./.open-next/worker.js",
  "compatibility_date": "2026-06-04",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets" }
}
```

### Production artifact

```
apps/web/.open-next/worker.js   ← Worker entry point (stub; full bundle built by wrangler)
apps/web/.open-next/assets/     ← Static assets
```

These are built by `npm run deploy` and are gitignored — built fresh on each deploy.

### Environment variables (set in Workers Builds dashboard)

| Variable | Value |
|---|---|
| `JWT_SECRET` | (secret) |
| `NEXT_PUBLIC_API_URL` | `https://api.defrag.app` |
| `NEXT_PUBLIC_AI_URL` | `https://ai.defrag.app` |

---

## sovereign-os-api (API Worker)

### Workers Builds Configuration

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

- `itty-router: ^5.0.23` — in `apps/worker/package.json` ✅
- `@sovereign/core: 0.0.1` — local workspace package ✅
- All committed in `package-lock.json` ✅

### Validation

```bash
curl -s https://api.defrag.app/
# Expected: { "service": "sovereign-os-api", "status": "ok" }

curl -s https://api.defrag.app/health
# Expected: { "ok": true, "service": "sovereign-os-api", "timestamp": "..." }
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

## Cloudflare Dashboard Tasks (still required)

See `docs/CLOUDFLARE_DASHBOARD_HANDOFF.md` for full click-by-click detail.

| # | Task | Priority |
|---|---|---|
| 1 | Connect `sovv-web` to Workers Builds (GitHub main) | 🔴 Blocking |
| 2 | Connect `sovereign-os-api` to Workers Builds (GitHub main) | 🔴 Blocking |
| 3 | Enable Email Routing on `defrag.app` | 🟡 High |
| 4 | Add `[[send_email]]` binding after Email Routing verified | 🟡 After 3 |
| 5 | Redeploy `sovereign-os-api` (KV binding rename) | 🟡 High |
| 6 | Delete orphaned `sovv` Worker | 🟡 High |
| 7 | Investigate/delete orphaned `BASELINE_KV` KV namespace | 🟢 Medium |

---

## Wrangler Manual Deploy (Fallback)

If Workers Builds is unavailable:

```bash
nvm use 22

# Web Worker
cd apps/web
npm install
npm run deploy   # runs opennextjs-cloudflare build && opennextjs-cloudflare deploy

# API Worker
cd apps/worker
npm install
npx wrangler deploy
```