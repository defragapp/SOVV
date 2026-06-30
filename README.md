# SOVV: Open Source Visual Vocabulary

A distributed, multi-app platform for collaborative intelligence built on Cloudflare Workers, Next.js, and a modular package architecture.

## Architecture overview

```text
SOVV
├── apps/
│   ├── web                 # Next.js frontend deployed as sovv-web
│   ├── worker              # API Worker deployed as sovereign-os-api
│   ├── worker-ai           # AI inference Worker
│   └── worker-session      # Session / Durable Object Worker
├── packages/
│   ├── core                # Shared React components and utilities
│   └── prompts             # Prompt templates and system prompts
├── scripts/                # Utility scripts
├── docs/                   # Architecture, setup, runbooks, platform guides
└── ops/                    # Point-in-time operational inventories
```

## Marketing docs

Launch copy, short-video concepts, caption guidance, and campaign operating docs live in [`docs/marketing`](docs/marketing/README.md). Current campaign language centers on "You are not broken. You are patterned," "The personal operating system for relational intelligence," and the primary CTA "Start with your baseline."

## Prerequisites

- Node.js 22 or newer
- pnpm 9, as declared in `package.json`
- Cloudflare credentials only when performing authorized release or infrastructure work

## Setup

```bash
git clone https://github.com/defragapp/SOVV.git
cd SOVV
pnpm install
cp .env.example .env.local
```

Do not commit `.env`, `.env.local`, `.dev.vars`, tokens, or secret values.

## Common commands

```bash
pnpm run dev          # Start the web app
pnpm run dev:api      # Start the API Worker
pnpm run dev:ai       # Start the AI Worker
pnpm run dev:session  # Start the session Worker
pnpm run dev:all      # Start all local services
pnpm run verify       # Secret scan, worker tests/typecheck, web lint/build
```

## CI and release flow

- `.github/workflows/ci.yml` performs blocking repository verification on PRs and pushes to `main`.
- `.github/workflows/deploy-sovv-web.yml` is a manual web release workflow for `sovv-web` only.
- Production releases require explicit authorization and a successful dry-run.
- The legacy all-worker deploy workflow has been removed to avoid accidental unrelated Worker releases.

## Cloudflare operations

Use these docs before changing any Cloudflare Worker, binding, route, or release workflow:

- [`docs/cloudflare.md`](docs/cloudflare.md) — stable platform conventions
- [`ops/cloudflare-inventory-2026-06-29.md`](ops/cloudflare-inventory-2026-06-29.md) — point-in-time live inventory and drift report

Git is the intended source of truth. Dashboard changes must be backfilled into Wrangler configuration or explicitly documented as managed drift.

## Safety and security hardening

AI-facing endpoints are protected by shared request validation, rate limiting, and safety logging. The platform expects:

- JSON content-type enforcement
- bounded request sizes
- schema validation
- rate limiting by user/IP where applicable
- request correlation IDs in logs
- no secret values in logs, reports, PRs, or commits

Run the secret scanner before releasing:

```bash
node scripts/secret-scan.js
```

## Development workflow

1. Create a feature branch from `main`.
2. Keep changes scoped to the task.
3. Run `pnpm run verify` before opening a PR.
4. Include checks run, files changed, release impact, and secret-scan status in the PR body.
5. Do not perform production releases from chat, local shell transcripts, or unverified credentials.

## License

See `LICENSE`.
