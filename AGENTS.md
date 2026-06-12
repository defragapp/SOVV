# AGENTS.md — Cloudflare Workers Monorepo

## Architecture
- Account ID: `8b1954d216d65077c6480d62583fe2c2`
- 4 Workers: `sovereign-os-api`, `worker-session`, `worker-ai`, `sovv-web`
- All deploys MUST use: `wrangler deploy --env production`
- NEVER use plain `wrangler deploy` (causes ghost resources)

## Critical Rules
1. **Durable Objects**: `[[durable_objects.bindings]]` only uses `name` + `class_name`. No `script_name`.
2. **Secrets**: NEVER commit credentials. Use `.dev.vars` (gitignored) for local, GitHub Secrets for CI.
3. **Routes**: Every Worker with a custom domain MUST declare `[[routes]]` with `pattern = "subdomain.defrag.app/*"` and `custom_domain = true`.
4. **Turnstile**: Siteverify routes through `sovereign-os-api`. Browser never calls `challenges.cloudflare.com` directly.
5. **Env Blocks**: All `wrangler.toml` changes must include both base config AND `[env.production]` duplication.

## Live Resources
- DB: `vibesdk-db` (ID: `c8c2fd8d-5297-46fc-8594-7629c8bad74d`)
- KV: `SOVV_DATA` (ID: `3bd3ff5048a8468e82c574d7d66045c3`)
- R2: `vibesdk-templates`
- DO Class: VERIFY before changing — live class name may be `ConflictSessionDO` not `ConflictSession`

## Files That Must Stay Gitignored
- `.dev.vars`
- `.env*`
- `.wrangler/`

## Deployment
- GitHub Actions handles production deploys on `main` push
- Local deploy only for testing: `cd apps/<worker> && npx wrangler deploy --env production`
