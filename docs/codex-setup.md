# Codex setup for SOVV

This document describes the minimum setup needed before Codex or another coding agent should work on deployment-sensitive tasks in `defragapp/SOVV`.

## 1. GitHub connection

Codex must be connected to GitHub and authorized for this repository:

- repository: `defragapp/SOVV`
- default branch: `main`

Codex can inspect code, propose branches, and open PRs only when the GitHub connector has the required repository access.

## 2. Required GitHub secrets

Store deploy credentials only as GitHub repository or environment secrets. Do not commit them and do not paste values into chat, logs, issues, or PRs.

Required for Cloudflare deploys:

- `CLOUDFLARE_API_TOKEN`
- `CF_ACCOUNT_ID`

Likely required by runtime features, depending on what is enabled:

- `TURNSTILE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY` only if runtime inference uses OpenAI
- `ANTHROPIC_API_KEY` only if runtime inference uses Anthropic

Public runtime keys may appear in client configuration only when intentionally public. Secret keys must never be committed.

## 3. Cloudflare resources to verify

Before release work, verify live Cloudflare resources by name only. Do not print secret values.

Expected resource names include:

- web Worker: `sovv-web`
- API Worker: `sovereign-os-api`
- AI Worker: `worker-ai`
- session Worker: `worker-session`
- D1 database: `vibesdk-db`
- KV namespace: `SOVV_DATA`
- R2 bucket: `vibesdk-templates`
- Queue: `pattern-extraction-tasks`
- Workers AI binding: `AI`
- service bindings: `AI_SERVICE`, `SESSION_SERVICE`
- Durable Object: `ConflictSessionDO`

If extra live Cloudflare resources exist, classify them before touching anything:

- likely unrelated
- possible backup/manual resource
- possible drift
- needs human decision

## 4. Web deploy target

Web releases are scoped to:

- app path: `apps/web`
- Cloudflare Worker: `sovv-web`

A web-only deploy must not touch:

- `sovereign-os-api`
- `worker-ai`
- `worker-session`
- `sovereign-control`

## 5. Route baseline

Verify the live Cloudflare route baseline before and after deployment:

- `defrag.app/*`
- `www.defrag.app/*`
- `app.defrag.app/*`
- `sovereign.defrag.app/*`
- `*defrag.app/_next/static/*`

Some routes may be dashboard-managed instead of represented in `apps/web/wrangler.json`. In that case, route preservation must be confirmed from Cloudflare before deploy.

## 6. Commands Codex should know

General commands:

```bash
npm install
npm run verify
npm run lint
npm run build
```

Web checks:

```bash
node scripts/secret-scan.js
npm run -w apps/web lint
npx tsc -p apps/web/tsconfig.json --noEmit
npm --workspace apps/web run build
cd apps/web && npx @opennextjs/cloudflare build
cd apps/web && npx wrangler deploy --dry-run --env production --config wrangler.json
git diff --check
```

Development commands:

```bash
npm run dev:api
npm run dev:ai
npm run dev:session
npm run dev:web
```

## 7. Credential exposure policy

Any credential pasted into chat, shell commands, logs, PRs, docs, or issue comments must be treated as compromised.

Required response:

1. Revoke the exposed token.
2. Create a replacement token with least privilege.
3. Store the replacement only as a GitHub/Cloudflare/Codex-managed secret.
4. Re-run secret scanning.
5. Do not deploy until rotation is confirmed.

## 8. PR expectations

Deployment-sensitive PRs must include:

- exact target Worker
- exact branch/SHA
- files changed
- checks run
- dry-run result if deploy config changed
- route baseline handling
- secret-scan result
- explicit statement that no production deploy was performed
- any remaining blockers

Do not claim a PR exists unless an actual GitHub PR URL is available.
