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
| Root directory | `apps/worker` |
| Build command | `npm install` |
| Deploy command | `npx wrangler deploy` |
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