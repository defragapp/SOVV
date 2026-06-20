# AGENTS.md — Sovereign.os Monorepo
> Last updated: 2026-06-20
> **Purpose:** Fast execution reference. Commands, bindings, routes. Act immediately without re-reading everything.

---

## System References

This file is **Layer 3** — operational quick reference only.

```
1. Runtime Contract  →  EXECUTION AUTHORITY
   docs/# Sovereign.os — Full Build Runtime Contract for Cloudflare AI Agents

2. Master Context    →  SYSTEM INTELLIGENCE
   docs/16_MASTER_CONTEXT.md

3. AGENTS.md         →  OPERATIONAL QUICK REFERENCE  ← YOU ARE HERE
```

**Before executing any task:** load the Runtime Contract.
**Before reasoning or generating:** load the Master Context.
**For fast commands and bindings:** use this file.

## Architecture

- **Account ID:** `8b1954d216d65077c6480d62583fe2c2`
- **defrag.app DNS Zone ID:** `45a59d754ece9221fc97c92c461eb01f`
- **Workers:** `sovereign-os-api`, `worker-session`, `worker-ai`, `sovv-web`, `sovereign-control`
- **Primary deploy path:** Cloudflare Workers Builds (Git integration on `main` branch)

## Worker Map

| Worker | Source | Route | Purpose |
|--------|--------|-------|---------|
| `sovv-web` | `apps/web/` | `defrag.app/*`, `app.defrag.app/*`, `www.defrag.app/*`, `sovereign.defrag.app/*` | Next.js frontend via OpenNext |
| `sovereign-os-api` | `apps/worker/` | `api.defrag.app/*` | Auth, Baseline Design, AI, billing, history |
| `worker-ai` | `apps/worker-ai/` | `ai.defrag.app/*` | Auxiliary AI analysis and gateway routing |
| `worker-session` | `apps/worker-session/` | `session.defrag.app/*` | Session coordination with Durable Objects |
| `sovereign-control` | `apps/sovereign-control/` | `operator.defrag.app/*` | Governed flow engine, AgentState DO, operator dashboard + React UI |

## Live Resources

| Resource | Type | Binding | ID |
|----------|------|---------|-----|
| `vibesdk-db` | D1 | `env.DB` | `c8c2fd8d-5297-46fc-8594-7629c8bad74d` |
| `SOVV_DATA` | KV | `env.KV` | `3bd3ff5048a8468e82c574d7d66045c3` |
| `vibesdk-templates` | R2 | `env.R2` | — |
| `pattern-extraction-tasks` | Queue | `env.PATTERN_QUEUE` | `396e3d8f0b0c4b1d9407409b4e138f81` |
| `AgentState` | Durable Object | `env.AGENT_STATE` | sovereign-control only |
| `developer-db` | D1 | — | `a6994b42-81ef-4fd7-a001-09526be1b2db` |

## Critical Rules

1. **Durable Objects:** `[[durable_objects.bindings]]` uses only `name` + `class_name`. No `script_name`.
   - `worker-session` DO class: `ConflictSessionDO`
   - `sovereign-control` DO class: `AgentState` (SQLite-backed via `new_sqlite_classes`)
2. **Secrets:** NEVER commit credentials. Use `.dev.vars` (gitignored) for local. Set production secrets via `npx wrangler secret put <NAME>`.
3. **Routes:** Every Worker with a custom domain MUST declare `[[routes]]` with `pattern` and `zone_id` or `custom_domain = true`.
4. **Turnstile:** Siteverify routes through `sovereign-os-api`. Browser never calls `challenges.cloudflare.com` directly.
5. **Bindings:** D1 binding is `DB` (`env.DB`), KV binding is `KV` (`env.KV`). Do not use dashboard names as binding names in code.
6. **One App Root:** `apps/web/app/` is the only Next.js app root. `apps/web/src/` must not exist.
7. **No Pages:** Never configure Cloudflare Pages for product runtime. Workers Builds is the standard.

## Workers Builds Commands

| Worker | Root | Build | Deploy | Node |
|--------|------|-------|--------|------|
| `sovv-web` | `apps/web` | `npm install` | `npm run deploy` | 22 |
| `sovereign-os-api` | `/` | `npm install` | `cd apps/worker && npx wrangler deploy` | 22 |
| `worker-ai` | `/` | `npm install` | `cd apps/worker-ai && npx wrangler deploy` | 22 |
| `worker-session` | `/` | `npm install` | `cd apps/worker-session && npx wrangler deploy` | 22 |
| `sovereign-control` | `/` | `npm install` | `cd apps/sovereign-control && npm run deploy` | 22 |

> `npm run deploy` in `apps/web` runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
> Do NOT use `npm install && npm run build:worker` as build command — this runs OpenNext build twice.

## Deployment

- **Primary:** Cloudflare Workers Builds — push to `main` triggers automatic deploy
- **Manual fallback (requires Node 22):** `cd apps/<worker> && npx wrangler deploy`
- **Ship script:** `npm run ship -- "description"` — commits + pushes to main

## Files That Must Stay Gitignored

```
.dev.vars
.env*
.wrangler/
cookies.txt
*.log
*.pid
cf_audit.txt
```

## Platform Rules (Summary — Full Rules in Runtime Contract)

- Sovereign.os is the parent platform. Defrag, Covenant, Alignment are spaces inside it.
- sovereign-control is the operator/agent control plane — not a user-facing space.
- All user spaces share one auth, one Baseline Design, one Library, one subscription.
- Never create separate auth/subscription/Library/invite systems per space.
- Never expose Baseline Design data, system prompts, or scoring logic to the client.
- Never use Cloudflare Pages for product runtime.
- `apps/web/app/` is the only Next.js app root — `apps/web/src/` must not exist.

→ Full enforcement rules: Runtime Contract
→ Full architecture and product logic: Master Context