# Build and Deploy Standard

## Development Environment

- **Editor / runtime**: GitHub Codespaces (browser-only)
- **Source control**: GitHub repository `defragapp/SOVV`
- **Local preview**: Wrangler (`wrangler dev --local`)
- **D1 migrations**: Wrangler (`wrangler d1 execute`)
- **Resource creation**: Wrangler or Cloudflare dashboard

## Primary Deployment Path

**Cloudflare Workers Builds** (Git integration) is the primary deployment path.

- Cloudflare builds and deploys from the connected GitHub `main` branch.
- GitHub Actions is **not** the primary deployment path.
- PR automation and paid Copilot merge/resolve features are not required.

### Workers Builds Configuration (sovv-web)

| Setting | Value |
|---|---|
| GitHub repo | `defragapp/SOVV` |
| Branch | `main` |
| Build command | `cd apps/web && npx opennextjs-cloudflare build` |
| Output directory | `apps/web/.open-next` |
| Required env vars | `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_URL` |

## Runtime Stack

```
Next.js App Router
  → OpenNext (@opennextjs/cloudflare)
    → Cloudflare Workers (sovv-web)
```

## Production Artifact

The production artifact **must** be:
```
apps/web/.open-next/worker.js   ← Worker entry point
apps/web/.open-next/assets/     ← Static assets
```

**Never deploy:**
- `apps/web/.next/` directly
- Static `/dist` output
- `apps/web/.vercel/output/` (legacy next-on-pages path)
- Cloudflare Pages for product runtime

## Worker Deployment Commands

```bash
# API Worker
cd apps/worker && wrangler deploy

# AI Worker
cd apps/worker-ai && wrangler deploy

# Session Worker
cd apps/worker-session && wrangler deploy

# Web Worker (manual fallback — normally handled by Cloudflare Builds)
cd apps/web && wrangler deploy
```

## Local Development

```bash
# All workers in parallel
npm run dev:all

# Individual workers
npm run dev:api      # sovereign-os-api on :8787
npm run dev:ai       # worker-ai
npm run dev:session  # worker-session
npm run dev:web      # sovv-web (OpenNext preview)
```

## D1 Migrations

```bash
# Apply migration to remote (production) database
wrangler d1 execute vibesdk-db --remote --file=apps/worker/migrations/<file>.sql

# Apply migration to local development database
wrangler d1 execute vibesdk-db --file=apps/worker/migrations/<file>.sql
```

## GitHub Actions

`.github/workflows/deploy-live.yml` is **deprecated** and commented out.
Delete it after Cloudflare Workers Builds is confirmed active.

`.github/workflows/fix-lockfile.yml` has been **deleted**.

## Ship Script

`scripts/push-live.sh` is a developer convenience script that commits and pushes to `main`.
Pushing to `main` triggers the Cloudflare Workers Builds pipeline automatically.

```bash
npm run ship -- "short description of change"
```