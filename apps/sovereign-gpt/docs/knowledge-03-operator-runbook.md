# Sovereign Build Agent — Operator Runbook
*Knowledge file for Sovereign Build Agent GPT. Reference this for operational tasks, debugging, and build workflows.*

---

## Safety Flags Quick Reference

Set in **Cloudflare Dashboard → Workers → sovereign-broker → Settings → Variables**

| Flag | Default | Enable to allow... |
|------|---------|-------------------|
| `AGENT_ENABLED` | `true` | Master switch — set `false` to kill ALL mutations |
| `AGENT_WRITE_ENABLED` | `false` | Repo writes (branch + PR only, never direct main) |
| `AGENT_PR_ENABLED` | `false` | PR creation on GitHub |
| `AGENT_DEPLOY_ENABLED` | `false` | Cloudflare Worker deploys |
| `AGENT_STRIPE_WRITE_ENABLED` | `false` | Stripe billing mutations |
| `AGENT_DESTRUCTIVE_ACTIONS_ENABLED` | `false` | KV/R2 writes |

**Kill switch:** Set `AGENT_ENABLED=false` → all mutations blocked instantly, reads still work.

---

## Common Operational Tasks

### Check platform health
```
Ask: "Run a health check across all services"
→ calls healthCheck (broker), stripeOverview, listWorkers, getPagesDeployments
```

### Check recent activity
```
Ask: "What changed in the last 10 commits?"
→ calls getRecentCommits with limit=10
```

### Check open PRs (agent branches)
```
Ask: "Are there any open agent PRs?"
→ calls listPRs with state=open
→ look for branches named agent/<timestamp>
```

### Check worker errors
```
Ask: "Check logs for sovereign-os-api"
→ calls getWorkerLogs with worker=sovereign-os-api
```

### Check revenue
```
Ask: "What's our MRR and how many active subscribers?"
→ calls stripeOverview
→ calls getRevenue with days=30
```

### Query the database
```
Ask: "How many users signed up this week?"
→ calls d1Query with:
   sql: "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"
```

### Get project scope
```
Ask: "What should we build next?"
→ calls getBuildScope (AI analysis of full file tree)
→ calls getRecentCommits
→ calls stripeOverview
```

---

## Build Workflows

### Build a new React component
1. Agent reads existing similar components (`getRepoFile`)
2. Agent calls `generateComponent` with description + `generate_mockup: true`
3. Agent shows you the code + mockup image
4. You review → say "open a PR for this"
5. Enable `AGENT_WRITE_ENABLED=true` + `AGENT_PR_ENABLED=true` in CF dashboard
6. Agent calls `proposePR` with `confirm: true`
7. PR opens on `agent/<timestamp>` branch
8. You review on GitHub → merge
9. CI/CD deploys automatically

### Build a new API endpoint
1. Agent reads `apps/worker/src/index.ts` + relevant route files
2. Agent generates the handler code via `aiChat` with `model: "code"`
3. Agent shows you the new file + the index.ts change needed
4. You review → say "open a PR"
5. Agent calls `proposePR` with both files + `confirm: true`
6. PR opens → you merge → `deploy-production-api.yml` runs

### Build a new Cloudflare Worker
1. Agent calls `generateWorker` with name + description
2. Agent shows code + wrangler.toml
3. You review → say "deploy this"
4. Enable `AGENT_DEPLOY_ENABLED=true` in CF dashboard
5. Agent calls `deployWorker` with `confirm: true`
6. Worker is live immediately

### Generate a UI mockup
```
Ask: "Show me what a new onboarding flow could look like"
→ calls generateImage with flux-dev model
→ returns image URL from R2
→ no code changes, purely visual
```

### Analyze a screenshot
```
Paste an image URL and ask: "What's wrong with this layout?"
→ calls analyzeImage with the URL + question
→ uses Llama Vision 11B
→ returns detailed visual analysis
```

---

## Debugging Workflows

### Worker returning 500s
```
1. getWorkerLogs for the affected worker
2. getRepoFile for the relevant source file
3. aiChat with model=code: "Here's the error and the source — what's wrong?"
4. generateComponent or aiChat to generate the fix
5. proposePR with the fix
```

### Billing not working
```
1. stripeOverview — check if Stripe is connected
2. d1Query: "SELECT * FROM stripe_events ORDER BY processed_at DESC LIMIT 10"
3. d1Query: "SELECT * FROM subscriptions WHERE status != 'active' LIMIT 20"
4. getRepoFile: apps/worker/src/billing.ts
5. aiChat: "Here's the billing code and the DB state — what's broken?"
```

### Auth issues
```
1. d1Query: "SELECT id, email, email_verified, tier FROM users ORDER BY created_at DESC LIMIT 10"
2. d1Query: "SELECT COUNT(*) FROM sessions WHERE expires_at < unixepoch()"
3. getRepoFile: apps/worker/src/auth.ts
4. getRepoFile: apps/web/middleware.ts
```

### Baseline not compiling
```
1. d1Query: "SELECT user_id, status, compiled_at FROM design_inputs WHERE status != 'compiled' LIMIT 20"
2. getRepoFile: apps/worker/src/baseline-compiler.ts
3. getRepoFile: apps/worker/src/baseline.ts
```

---

## Model Selection Guide

| Task | Use model | Why |
|------|-----------|-----|
| "Explain this code" | `chat` | Fast, good reasoning |
| "What's wrong with X?" | `chat` | Good at analysis |
| "Write a complete component" | `code` | GPT-OSS 120B — best code quality |
| "Write a Cloudflare Worker" | `code` | Complex, needs high capability |
| "Write a DB migration" | `code` | Precise SQL needed |
| "What does this screenshot show?" | `vision` | Llama Vision 11B |
| "Is this UI accessible?" | `vision` | Visual analysis |
| "What's the MRR?" | `fast` | Simple lookup, no reasoning needed |
| "List the files in /components" | `fast` | Simple retrieval |
| "Design a mockup for X" | `generateImage` | Flux Schnell (fast) or Dev (quality) |

---

## File Path Reference

### Most-edited files
```
apps/worker/src/index.ts          — add new routes here
apps/worker/src/billing.ts        — Stripe integration
apps/worker/src/auth.ts           — auth logic
apps/worker/src/entitlements.ts   — tier/feature access
apps/worker/src/prompts.ts        — AI prompt architecture
apps/web/app/pricing/page.tsx     — pricing page
apps/web/components/spaces/Sidebar.tsx  — main nav
apps/web/middleware.ts            — auth middleware
apps/web/lib/api.ts               — API client
```

### Adding a new API route (checklist)
```
1. Create: apps/worker/src/<feature>.ts
2. Edit:   apps/worker/src/index.ts  (import + register)
3. Edit:   lib/api-spec/openapi.yaml (add endpoint spec)
4. Run:    pnpm run typecheck (in apps/worker/)
```

### Adding a new page (checklist)
```
1. Create: apps/web/app/<route>/page.tsx
2. Create: apps/web/app/<route>/layout.tsx (if needed)
3. Edit:   apps/web/components/spaces/Sidebar.tsx (add nav link)
4. Create: apps/web/app/api/<route>/route.ts (if needs API)
```

---

## Stripe Operations

### Check current revenue
```sql
-- Via d1Query (local data)
SELECT s.status, COUNT(*) as count, s.tier
FROM subscriptions s
GROUP BY s.status, s.tier;
```

### Create a new price (requires AGENT_STRIPE_WRITE_ENABLED=true)
```
Ask: "Create a new monthly price called 'DEFRAG Teams' at $49/month"
→ agent calls createPrice with confirm: true
→ returns price_id to use in checkout flow
```

### Active price IDs
- Monthly Pro: `price_1Te0g9Bk78yJ8Hww8fFZCqhm` ($20/mo)
- Annual Pro: `price_1Tq6nPBk78yJ8Hwwm0pxg4hH` ($99/yr)

---

## KV Operations

### Read a cached value
```
Ask: "Read the KV key baseline:<user_id>"
→ calls kvGet with key=baseline:<user_id>
```

### Write a KV value (requires AGENT_DESTRUCTIVE_ACTIONS_ENABLED=true)
```
Ask: "Set the feature flag feature:new_onboarding:<user_id> to true"
→ agent calls kvSet with confirm: true
```

### Common KV key patterns
```
session:<token>              — session data
baseline:<user_id>           — compiled baseline cache
usage:<user_id>:<YYYY-MM-DD> — daily usage counter
natal:<user_id>              — natal data cache
feature:<flag>:<user_id>     — per-user feature flag
```

---

## Deployment Reference

### Web deploy (CI/CD)
```
Trigger: push to main → deploy-production-web.yml runs automatically
Manual:  gh workflow run deploy-production-web.yml --ref main
URL:     https://app.defrag.app
```

### API worker deploy
```
Trigger: push to main → deploy-production-api.yml runs automatically
Manual:  cd apps/worker && npx wrangler deploy
URL:     https://api.defrag.app
```

### Worker deploy via GPT (requires AGENT_DEPLOY_ENABLED=true)
```
Ask: "Deploy the updated sovereign-broker worker"
→ agent generates/reads code → shows it → asks confirm → calls deployWorker
```

---

## Rotating the Broker Token

```bash
# 1. Generate new token
NEW=$(openssl rand -hex 32)

# 2. Update worker secret
echo "$NEW" | npx wrangler secret put BROKER_TOKEN --name sovereign-broker

# 3. Update GPT action auth
# Go to: chatgpt.com/gpts/editor → your GPT → Actions → Edit → Auth → update API key
```

---

## PR Review Checklist (for agent-opened PRs)

When the agent opens a PR on `agent/<timestamp>`:

- [ ] Check the branch name — should be `agent/<unix-timestamp>`
- [ ] Review every file changed — no secrets, no .env, no credentials
- [ ] Check the commit message — should end with `[sovereign-gpt]`
- [ ] Verify the change matches what you asked for
- [ ] Run CI checks (auto-triggered on PR open)
- [ ] Merge only after CI passes
- [ ] Delete the branch after merge

---

## Emergency Procedures

### Kill all agent mutations immediately
```
Cloudflare Dashboard → Workers → sovereign-broker → Settings → Variables
Set: AGENT_ENABLED = false
Takes effect on next request (no redeploy needed)
```

### Revoke GPT access entirely
```
Cloudflare Dashboard → Workers → sovereign-broker → Settings → Variables
Delete: BROKER_TOKEN
(or rotate it and don't update the GPT)
```

### Roll back a bad worker deploy
```
Cloudflare Dashboard → Workers → <worker-name> → Deployments
Click the previous version → "Rollback to this version"
```

### Roll back a bad web deploy
```
Cloudflare Dashboard → Pages → sovv-web → Deployments
Click the previous deployment → "Rollback"
```