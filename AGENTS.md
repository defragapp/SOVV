# AGENTS.md

This repository contains the SOVV / Defrag platform: a multi-app Cloudflare Workers and Next.js codebase for Sovereign.os and related services.

These instructions are for Codex and other coding agents working in this repo.

## Operating rules

- Do not commit secrets, tokens, private keys, `.env` files, Cloudflare API tokens, GitHub PATs, R2 access keys, Stripe secret keys, or provider API keys.
- Do not print secret values in logs, PRs, comments, commit messages, or reports.
- Treat any credential pasted into chat, logs, shell history, or PR text as compromised until it has been revoked and rotated.
- Do not perform production releases unless the user explicitly authorizes the release after the release gates are satisfied.
- Verify GitHub state and Cloudflare state before making release claims.
- Keep changes scoped to the task. Do not mix web release changes with API, AI, session, billing, database, or prompt changes.
- For web releases, the target is `sovv-web` only.

## Package/runtime expectations

- Node: 22 or newer.
- Package manager: pnpm 9, as declared by the root `packageManager` field.
- Use `pnpm install --frozen-lockfile` in CI.
- Do not introduce npm lockfiles unless the package-manager decision is intentionally revisited in a separate PR.

## Common commands

Root-level commands:

```bash
pnpm install
pnpm run verify
pnpm run lint
pnpm run build
pnpm run dev:api
pnpm run dev:ai
pnpm run dev:session
pnpm run dev:web
```

Web-focused checks:

```bash
node scripts/secret-scan.js
pnpm --filter web lint
pnpm --filter web build
cd apps/web && pnpm exec opennextjs-cloudflare build
cd apps/web && pnpm exec wrangler deploy --dry-run --env production --config wrangler.json
git diff --check
```

Worker-focused checks should be run only when the task touches worker code:

```bash
pnpm --filter @sovereign/worker test
pnpm --filter @sovereign/worker typecheck
pnpm --filter @sovereign/worker-ai typecheck
pnpm --filter @sovereign/worker-session typecheck
```

## Web release target

For web releases, release only:

- app path: `apps/web`
- Cloudflare Worker: `sovv-web`

Do not touch these Workers during a web-only release:

- `sovereign-os-api`
- `worker-ai`
- `worker-session`
- `sovereign-control`
- `developer`
- `sovereign-build-agent`
- `sovereign-code-agent`

## Cloudflare source of truth

Use these docs before changing any Worker, binding, route, or release workflow:

- `docs/cloudflare.md`
- `ops/cloudflare-inventory-2026-06-29.md`

Git is the intended source of truth. Dashboard changes must be backfilled into checked-in Wrangler configuration or explicitly documented as dashboard-managed drift.

## Cloudflare route baseline for `sovv-web`

Before and after a web release, verify the live Cloudflare route set by API or dashboard. Do not treat `wrangler.json` as the only source of route truth.

The expected live route baseline is:

- `defrag.app/*`
- `www.defrag.app/*`
- `app.defrag.app/*`
- `sovereign.defrag.app/*`
- `*defrag.app/_next/static/*`

If any route is dashboard-managed rather than represented in `apps/web/wrangler.json`, document that explicitly and keep release blocked until route preservation is confirmed.

## Release rules

- Prefer a GitHub Action or trusted local environment with secrets injected securely.
- Do not use pasted credentials.
- Do not deploy with credentials from chat or shell transcripts.
- The web release command must target production explicitly.
- Run a Wrangler dry-run before any real release.
- After release, verify live routes and content.

## Live web verification

Verify these URLs after any web release:

- `https://www.defrag.app/`
- `https://www.defrag.app/campaign/sovereign-os`
- `https://www.defrag.app/product`
- `https://www.defrag.app/product/defrag`
- `https://www.defrag.app/product/alignment`
- `https://www.defrag.app/product/covenant`
- `https://www.defrag.app/pricing`

Expected launch copy includes:

- `You are not broken. You are patterned.`
- `The personal operating system`
- `Start with your baseline`

## Release reporting

Every release report must include:

1. GitHub branch/SHA reviewed.
2. Files changed.
3. Checks run and results.
4. Cloudflare Worker target.
5. Cloudflare route verification result.
6. Secret-scan result.
7. Whether credentials were rotated if any were exposed.
8. Confirmation that no unrelated Workers were touched.
9. Confirmation that no secret values were printed.
10. Whether a production release was performed.
