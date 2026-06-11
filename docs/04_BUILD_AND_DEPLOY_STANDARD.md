# Build and Deploy Standard

**See `docs/CLOUDFLARE_BUILDS_FINAL_STANDARD.md` for the canonical Workers Builds configuration.**

---

## Development Environment

- **Editor / runtime**: GitHub Codespaces (browser-only)
- **Source control**: GitHub repository `defragapp/SOVV`
- **Local preview**: Wrangler (`wrangler dev --local`)
- **D1 migrations**: Wrangler (`wrangler d1 execute`)
- **Resource creation**: Wrangler or Cloudflare dashboard

---

## Primary Deployment Path

**Cloudflare Workers Builds** (Git integration) is the primary deployment path.

- Cloudflare builds and deploys from the connected GitHub `main` branch.
- GitHub Actions is **not** the primary deployment path.
- `deploy-live.yml` has been **deleted**.
- `fix-lockfile.yml` has been **deleted**.

---

## Workers Builds Configuration

### sovv-web

| Setting | Value |
|---|---|
| Root directory | `apps/web` |
| Build command | `npm install` |
| Deploy command | `npm run deploy` |
| Node version | `22` |
| Env vars | `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_URL` |

**Why `npm install` as build command:**
`apps/web/package.json` deploy script runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
Workers Builds runs build command first (installs deps), then deploy command (builds + deploys).
Do NOT use `npm install && npm run build:worker` — this runs OpenNext build twice.

### sovereign-os-api

| Setting | Value |
|---|---|
| Root directory | (Leave blank) |
| Build command | `npm install` |
| Deploy command | `cd apps/worker && npx wrangler deploy` |
| Node version | `22` |

### worker-ai

| Setting | Value |
|---|---|
| Root directory | (Leave blank) |
| Build command | `npm install` |
| Deploy command | `cd apps/worker-ai && npx wrangler deploy` |
| Node version | `22` |

### worker-session

| Setting | Value |
|---|---|
| Root directory | (Leave blank) |
| Build command | `npm install` |
| Deploy command | `cd apps/worker-session && npx wrangler deploy` |
| Node version | `22` |

---

## Runtime Stack

```
Next.js App Router
  → OpenNext (@opennextjs/cloudflare)
    → Cloudflare Workers (sovv-web)
```

---

## Production Artifact

```
apps/web/.open-next/worker.js   ← Worker entry point (stub; full bundle built by wrangler)
apps/web/.open-next/assets/     ← Static assets
```

**Never deploy:**
- `apps/web/.next/` directly
- Static `/dist` output
- `apps/web/.vercel/output/` (legacy next-on-pages path — not used)
- Cloudflare Pages for product runtime

---

## Manual Deploy (Fallback)

If Workers Builds is unavailable:

```bash
# Requires Node 22+
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

---

## Local Development

```bash
npm run dev:all       # all workers in parallel
npm run dev:api       # sovereign-os-api on :8787
npm run dev:web       # sovv-web (OpenNext preview)
```

---

## D1 Migrations

```bash
# Apply migration to remote (production) database
wrangler d1 execute vibesdk-db --remote --file=apps/worker/migrations/<file>.sql
```

---

## Ship Script

`scripts/push-live.sh` commits and pushes to `main`.
Pushing to `main` triggers Cloudflare Workers Builds automatically.

```bash
npm run ship -- "short description of change"
```

# Cloudflare Workers Deployments

The Sovereign.os API (`sovereign-os-api`) and frontend (`sovv-web`) utilize Cloudflare Workers and Pages infrastructure. Currently, deployments are executed **manually** via the Wrangler CLI.

## `sovereign-os-api` Bindings 

The API worker relies on specific binding strings mapped to explicit Cloudflare resource IDs. 

| Resource Type | Resource Name | Binding (Code) | ID |
| ------------- | ------------- | -------------- | -- |
| D1 Database | `vibesdk-db` | `DB` | `c8c2fd8d-5297-46fc-8594-7629c8bad74d` |
| KV Namespace| `SOVV_DATA` | `KV` | `3bd3ff5048a8468e82c574d7d66045c3` |
| R2 Bucket | `vibesdk-templates` | `R2` | n/a |

**CRITICAL NOTE:** The binding name for the database in code is `DB` (e.g. `env.DB`), not `vibesdk-db`. The `wrangler.toml` must enforce this explicitly. 

## Expected `wrangler.toml` for `sovereign-os-api`

```toml
name = "sovereign-os-api"
main = "src/index.ts"
compatibility_date = "2026-06-04"

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

[vars]
FREE_DAILY_LIMIT = "15"
```

## Secrets
Do not place secrets in `wrangler.toml`. Manage the following using `npx wrangler secret put <NAME>`:
- `TURNSTILE_SECRET_KEY`
- `TEAM_DOMAIN`
- `POLICY_AUD`


# Cloudflare Workers Builds — Final Standard

**Single source of truth for deployment configuration.**
All other docs defer to this file for build/deploy commands.

---

## A. Deployment Model

```
GitHub main → Cloudflare Workers Builds → Cloudflare Workers runtime
```

Every push to `main` triggers build and deploy via Cloudflare Workers Builds.
No Codespaces terminal required. No GitHub Actions required.

---

## B. Non-Goals

| Prohibited | Reason |
|---|---|
| Cloudflare Pages for product runtime | Deleted — Workers Builds is the standard |
| GitHub Pages | Not used |
| GitHub Actions production deploy | deploy-live.yml deleted |
| Static /dist product runtime | Not applicable |
| Direct .next/ deploy | OpenNext compiles to .open-next/worker.js |
| Old sovv-platform Pages project | Deleted |
| next-on-pages / .vercel/output/static | Legacy — not used |
| npm install && npm run build:worker as build command | Causes duplicate build |

---

## C. Worker Configuration

### sovv-web

| Setting | Value |
|---|---|
| Worker name | sovv-web |
| Root directory | apps/web |
| Config file | apps/web/wrangler.json |
| Build command | npm install |
| Deploy command | npm run deploy |
| Node version | 22 |
| Output | .open-next/worker.js and .open-next/assets/ |

### sovereign-os-api

| Setting | Value |
|---|---|
| Worker name | sovereign-os-api |
| Root directory | (Leave blank) |
| Config file | apps/worker/wrangler.toml |
| Build command | npm install |
| Deploy command | cd apps/worker && npx wrangler deploy |
| Node version | 22 |
| Health | api.defrag.app/ and api.defrag.app/health |

### worker-ai

| Setting | Value |
|---|---|
| Worker name | worker-ai |
| Root directory | / |
| Config file | apps/worker-ai/wrangler.toml |
| Build command | npm install |
| Deploy command | cd apps/worker-ai && npx wrangler deploy |
| Node version | 22 |

### worker-session

| Setting | Value |
|---|---|
| Worker name | worker-session |
| Root directory | (Leave blank) |
| Config file | apps/worker-session/wrangler.toml |
| Build command | npm install |
| Deploy command | cd apps/worker-session && npx wrangler deploy |
| Node version | 22 |

---

## D. Why sovv-web Uses npm install as Build Command

apps/web/package.json deploy script:

```
"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

Workers Builds runs:
1. Build command: npm install — installs dependencies
2. Deploy command: npm run deploy — runs OpenNext build AND Cloudflare deploy

Do NOT use npm install && npm run build:worker as build command.
This runs OpenNext build twice.

Do NOT use npm run build:worker as deploy command.
build:worker only builds, does not deploy.

---

## E. Dashboard Connection Steps

### sovv-web

1. dash.cloudflare.com → Workers and Pages → sovv-web → Settings → Build and Deployments
2. Click Connect Git → defragapp/SOVV
3. Branch: main | Root: apps/web | Build: npm install | Deploy: npm run deploy | Node: 22
4. Env vars: JWT_SECRET, NEXT_PUBLIC_API_URL=https://api.defrag.app, NEXT_PUBLIC_AI_URL=https://ai.defrag.app
5. Save and Deploy

### sovereign-os-api

1. dash.cloudflare.com → Workers and Pages → sovereign-os-api → Settings → Build and Deployments
2. Click Connect Git → defragapp/SOVV
3. Branch: main | Root: (leave blank) | Build: npm install | Deploy: cd apps/worker && npx wrangler deploy | Node: 22
4. Save and Deploy

---

## F. Validation

```bash
curl -I https://defrag.app           # HTTP 307
curl -I https://app.defrag.app       # HTTP 200
curl -s https://api.defrag.app/      # { "service": "sovereign-os-api", "status": "ok" }
curl -s https://api.defrag.app/health # { "ok": true, "service": "sovereign-os-api" }
```

---

## G. Troubleshooting

| Symptom | Fix |
|---|---|
| Live site does not reflect repo | Check Workers Builds connected and latest commit deployed |
| Build fails | Check Node version is 22 |
| Worker name mismatch | Dashboard name must match wrangler config name |
| app.defrag.app does not resolve | DNS must be proxied AAAA 100:: |
| Pages project appears | Remove Pages custom domain, delete sovv-platform |
| Build runs twice | Build command must be npm install only |
| worker.js is 2278 bytes | Correct — stub template, full bundle built by wrangler during deploy |

---

## H. Local Build Verification

```bash
npm install
cd apps/web && npm install && npm run build:worker
test -f .open-next/worker.js && echo "OK"
test -d .open-next/assets && echo "OK"
cd ../worker && npm install && npx wrangler deploy --dry-run
```

---

## I. Node Version

| File | Value |
|---|---|
| .nvmrc | 22 |
| package.json engines | node >=22 |
| apps/web/package.json engines | node >=22 |
| apps/worker/package.json engines | node >=22 |
| Workers Builds Node version | 22 |