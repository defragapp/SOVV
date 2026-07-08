# Sovereign Build Operator — Runbook
*Runtime-verified capabilities and operational reference. Treat this as live documentation — inspect the runtime first, use this as context.*

---

## Verified Runtime Capabilities (as of 2026-07-08)

These were verified against the live broker at `sovereign-broker.defrag.app`:

| Capability | Status | How |
|------------|--------|-----|
| Direct commit to main | ✅ Confirmed | `proposePR` with `mode: "direct"` |
| PR branch creation | ✅ Confirmed | `proposePR` with `mode: "pr"` |
| Worker deploy | ✅ Enabled | `deployWorker` — `AGENT_DEPLOY_ENABLED=true` |
| KV write | ✅ Enabled | `kvSet` — `AGENT_DESTRUCTIVE_ACTIONS_ENABLED=true` |
| Stripe write | ✅ Enabled | `createPrice` — `AGENT_STRIPE_WRITE_ENABLED=true` |
| D1 query | ✅ Read-only | `d1Query` — SELECT only, writes blocked at broker |
| Repo read | ✅ Confirmed | `getRepoFile`, `getRepoTree` — secrets denylist active |

**Always verify runtime state with `healthCheck` before reporting system status.**

---

## Broker API — Live Endpoints

Base URL: `https://sovereign-broker.defrag.app`

### Read endpoints (always available)
```
GET  /health                          — broker + service status + flag state
GET  /repo/tree                       — full file tree (secrets-filtered)
GET  /repo/file?path=<path>           — read a file (blocked for secrets)
GET  /repo/commits?limit=<n>          — recent commits on main
GET  /repo/prs?state=open|closed|all  — pull requests
GET  /cf/workers                      — list all deployed workers
GET  /cf/worker/logs?worker=<name>    — worker logs
GET  /cf/kv/get?key=<key>             — read KV value
GET  /cf/r2/list?bucket=<name>        — list R2 objects
GET  /cf/pages/deployments            — Pages deployment status
GET  /stripe/overview                 — MRR, subscribers, charges
GET  /stripe/subscriptions            — subscription list
GET  /stripe/revenue?days=<n>         — revenue metrics
GET  /build/scope                     — AI project scope analysis

POST /ai/chat                         — AI inference (model switching)
POST /ai/generate-image               — image generation (Flux/SDXL)
POST /ai/analyze-image                — vision analysis
POST /cf/d1/query                     — SELECT queries on vibesdk-db
POST /build/generate-component        — generate React/TS component (no commit)
POST /build/generate-worker           — generate CF Worker (no deploy)
```

### Write endpoints (all flags enabled)
```
POST /build/propose-pr                — commit files (mode: direct|pr)
POST /cf/worker/deploy                — deploy a Cloudflare Worker
POST /cf/kv/set                       — write a KV value
POST /stripe/create-price             — create Stripe product + price
```

### `proposePR` — the commit tool
```json
{
  "title": "feat: description [sovereign-gpt]",
  "mode": "direct",
  "files": [
    { "path": "apps/web/app/page.tsx", "content": "..." }
  ]
}
```
- `mode: "direct"` → commits straight to main (default for all standard work)
- `mode: "pr"` → creates `agent/<timestamp>` branch + opens PR
- SHA is auto-fetched for existing files — omit it
- Returns: `{ ok, mode, branch, commits: [{ path, sha, url, ok }], message }`

---

## AI Models — Live on CF AI Gateway

Gateway ID: `sovereign-ai-gateway`

### Text models (via `/ai/chat`)
| Alias | CF Model ID | Use for |
|-------|-------------|---------|
| `chat` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Planning, analysis, conversation |
| `code` | `@cf/openai/gpt-oss-120b` | Complex code, architecture, full components |
| `vision` | `@cf/meta/llama-3.2-11b-vision-instruct` | Screenshot analysis, image understanding |
| `fast` | `@cf/meta/llama-3.2-3b-instruct` | Quick lookups, simple answers |

### Image models (via `/ai/generate-image`)
| Alias | CF Model ID | Use for |
|-------|-------------|---------|
| `flux-schnell` | `@cf/black-forest-labs/flux-1-schnell` | Fast UI mockups |
| `flux-dev` | `@cf/black-forest-labs/flux-2-dev` | High-quality visuals, hero images |
| `sdxl` | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | Detailed/photorealistic |
| `sdxl-lightning` | `@cf/bytedance/stable-diffusion-xl-lightning` | Fast + detailed |

---

## Stripe — Live Data

**Always call `stripeOverview` for current numbers — don't rely on static values.**

Known reference IDs (verify against live data):
- Active product: `prod_UdHEFXmi3YN78U` (DEFRAG Pro)
- Monthly price: `price_1Te0g9Bk78yJ8Hww8fFZCqhm` ($20.00/month)
- Annual price: `price_1Tq6nPBk78yJ8Hwwm0pxg4hH` ($99.00/year)
- All legacy products archived as of 2026-07-07

---

## D1 Database — vibesdk-db

**Always use the uploaded D1 schema file as the authoritative table reference.**

Connection: SELECT only via `/cf/d1/query`. Writes require direct operator access.

Quick reference — key tables:
```
users              id, email, tier, role, email_verified, stripe_customer_id
sessions           user_id, token, expires_at, last_active
design_inputs      user_id, birth_date, birth_time, birth_location, status, compiled_at
design_facts       user_id, category, key, value, source
library            user_id, space, title, content
defrag_sessions    user_id, created_at
defrag_messages    session_id, role, content
subscriptions      user_id, stripe_subscription_id, status, tier, current_period_end
stripe_events      id (Stripe event ID), type, processed_at
invites            inviter_id, invitee_email, token, accepted_at, space, role
people             user_id, name, relation, birth_date
referral_codes     user_id, code
referral_conversions  referrer_id, referred_user_id
affiliates         user_id, code, commission_rate
admin_audit_log    admin_id, action, target_id, details
email_notifications  user_id, type, sent_at
password_reset_tokens  user_id, token, expires_at
```

---

## Deployed Workers (13 total)

**Always call `listWorkers` for current state — this list may be stale.**

| Worker | Domain | Purpose |
|--------|--------|---------|
| `sovereign-os-api` | api.defrag.app | Main API |
| `worker-ai` | ai.defrag.app | CF AI inference |
| `worker-session` | — | Durable Objects |
| `sovereign-broker` | sovereign-broker.defrag.app | GPT API surface |
| `sovereign-build-agent` | — | Build agent |
| `sovereign-code-agent` | — | Code generation |
| `sovereign-control` | — | Control plane |
| `sovereign-control-ui` | — | Control plane UI |
| `sovereign-build-broker` | — | Build orchestration |
| `sovv-web` | — | Web (OpenNext) |
| `developer` | — | Developer tools |
| `chatthread` | — | Chat threads |

---

## Safety Flags

Set in **Cloudflare Dashboard → Workers → sovereign-broker → Settings → Variables**

| Flag | Current | Effect |
|------|---------|--------|
| `AGENT_ENABLED` | `true` | Master kill switch — set `false` to block ALL mutations |
| `AGENT_WRITE_ENABLED` | `true` | Repo writes |
| `AGENT_PR_ENABLED` | `true` | PR creation |
| `AGENT_DEPLOY_ENABLED` | `true` | Worker deploys |
| `AGENT_STRIPE_WRITE_ENABLED` | `true` | Billing mutations |
| `AGENT_DESTRUCTIVE_ACTIONS_ENABLED` | `true` | KV/R2 writes |

**Kill switch:** Set `AGENT_ENABLED=false` → all mutations blocked instantly, reads still work.

---

## Common Operational Queries

### Platform health
```
healthCheck → broker status + all flag states
listWorkers → deployed worker list
getPagesDeployments → web deployment status
getWorkerLogs?worker=sovereign-os-api → API errors
```

### Revenue
```
stripeOverview → MRR, active subscribers, recent charges
getRevenue?days=30 → 30-day revenue breakdown
listSubscriptions?status=active → active subscriber list
```

### Database inspection
```sql
-- Recent signups
SELECT id, email, tier, email_verified, created_at
FROM users ORDER BY created_at DESC LIMIT 20;

-- Active pro users
SELECT u.email, s.status, s.current_period_end
FROM users u JOIN subscriptions s ON s.user_id = u.id
WHERE s.status = 'active';

-- Baseline compilation status
SELECT status, COUNT(*) as count FROM design_inputs GROUP BY status;

-- Invite funnel
SELECT COUNT(*) total, COUNT(accepted_at) accepted FROM invites;
```

### Codebase state
```
getBuildScope → AI analysis of full file tree
getRecentCommits?limit=15 → recent activity
listPRs?state=open → open branches
```

---

## Build Workflow Reference

### Standard component build
```
1. getRepoFile → read existing similar component
2. aiChat (code model) → generate complete TypeScript component
3. Show operator the code + optional generateImage mockup
4. On "yes/build it/go" → proposePR mode:direct → commit to main
5. Report: file path, commit sha, what changed, next recommendation
```

### New API route
```
1. getRepoFile → apps/worker/src/index.ts
2. getRepoFile → most similar existing route handler
3. aiChat (code model) → generate handler + index.ts update
4. proposePR mode:direct → commit both files
5. Note: worker redeploy needed for changes to take effect
```

### New Cloudflare Worker
```
1. aiChat (code model) → generate worker code + wrangler.toml
2. Show operator
3. On authorization → deployWorker → report actual deploy status
4. Never claim deployed unless tool confirms success
```

### Emergency — kill agent mutations
```
Cloudflare Dashboard → Workers → sovereign-broker → Settings → Variables
Set AGENT_ENABLED = false
Takes effect immediately, no redeploy needed
```

### Rotate broker token
```bash
NEW=$(openssl rand -hex 32)
echo "$NEW" | npx wrangler secret put BROKER_TOKEN --name sovereign-broker
# Then update API key in GPT action settings
```