# SOVV Setup Guide

This guide describes the supported local setup path for the SOVV monorepo.

## Package-manager decision

SOVV uses **pnpm 9** for workspace management. The canonical lockfile is `pnpm-lock.yaml`, and the root `package.json` declares the package manager.

Do not add `package-lock.json` or npm-only workflow steps unless the package-manager decision is intentionally revisited in a separate PR.

## Prerequisites

- Node.js 22 or newer
- pnpm 9
- Cloudflare account and API token only for authorized release or infrastructure work

## Initial setup

```bash
git clone https://github.com/defragapp/SOVV.git
cd SOVV
pnpm install
cp .env.example .env.local
```

Never commit `.env`, `.env.local`, `.dev.vars`, API tokens, private keys, or secret values.

## Root commands

```bash
pnpm run dev          # Start the web app
pnpm run dev:api      # Start the API Worker
pnpm run dev:ai       # Start the AI Worker
pnpm run dev:session  # Start the session Worker
pnpm run dev:all      # Start all local services
pnpm run lint         # Web lint + API typecheck
pnpm run build        # Web build
pnpm run verify       # Full repository verification gate
```

`pnpm run verify` is the golden command for local readiness and CI.

## Per-application commands

### Web frontend

Path: `apps/web`  
Cloudflare Worker: `sovv-web`

```bash
pnpm --filter web dev
pnpm --filter web lint
pnpm --filter web build
pnpm --filter web build:worker
```

Use `apps/web/scripts/deploy.sh` or the manual GitHub Actions workflow only after explicit release authorization.

### API Worker

Path: `apps/worker`  
Cloudflare Worker: `sovereign-os-api`

```bash
pnpm --filter @sovereign/worker dev
pnpm --filter @sovereign/worker typecheck
pnpm --filter @sovereign/worker test
```

### AI Worker

Path: `apps/worker-ai`  
Cloudflare Worker: `worker-ai`

```bash
pnpm --filter @sovereign/worker-ai dev
pnpm --filter @sovereign/worker-ai typecheck
pnpm --filter @sovereign/worker-ai build
```

### Session Worker

Path: `apps/worker-session`  
Cloudflare Worker: `worker-session`

```bash
pnpm --filter @sovereign/worker-session dev
pnpm --filter @sovereign/worker-session typecheck
pnpm --filter @sovereign/worker-session build
```

## Cloudflare references

Use these documents before modifying Cloudflare configuration:

- `docs/cloudflare.md`
- `ops/cloudflare-inventory-2026-06-29.md`
- `AGENTS.md`

The inventory currently records drift between live Cloudflare state and checked-in Wrangler config. Do not perform a production release until that drift is either committed to config or explicitly documented as dashboard-managed and verified safe.

## Release guardrails

- CI must pass before release.
- Run `node scripts/secret-scan.js` before release.
- Run a Wrangler dry-run before any real release.
- Web-only releases must target `sovv-web` only.
- Do not release API, AI, session, developer, build-agent, or code-agent Workers from a web-only change.
- Do not use pasted credentials or credentials from chat logs.

## Troubleshooting

### Clean install

```bash
rm -rf node_modules
pnpm store prune
pnpm install
```

### TypeScript errors

```bash
pnpm --filter @sovereign/worker typecheck
pnpm --filter @sovereign/worker-ai typecheck
pnpm --filter @sovereign/worker-session typecheck
```

### Web build errors

```bash
pnpm --filter web lint
pnpm --filter web build
```

### Cloudflare credential check

```bash
cd apps/web
pnpm exec wrangler whoami
```

Do not print token values when troubleshooting.
