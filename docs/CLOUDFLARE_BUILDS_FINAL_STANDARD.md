# Cloudflare Workers Builds — Final Standard

**Single source of truth for deployment configuration.**
All other docs defer to this file for build/deploy commands.

---

## A. Deployment Model

```
GitHub main → Cloudflare Workers Builds → Cloudflare Workers runtime
```

Every push to `main` triggers build and deploy via Cloudflare Workers Builds.
No Codespaces terminal required. No GitHub Actions required.

---

## B. Non-Goals

| Prohibited | Reason |
|---|---|
| Cloudflare Pages for product runtime | Deleted — Workers Builds is the standard |
| GitHub Pages | Not used |
| GitHub Actions production deploy | deploy-live.yml deleted |
| Static /dist product runtime | Not applicable |
| Direct .next/ deploy | OpenNext compiles to .open-next/worker.js |
| Old sovv-platform Pages project | Deleted |
| next-on-pages / .vercel/output/static | Legacy — not used |
| npm install && npm run build:worker as build command | Causes duplicate build |

---

## C. Worker Configuration

### sovv-web

| Setting | Value |
|---|---|
| Worker name | sovv-web |
| Root directory | apps/web |
| Config file | apps/web/wrangler.json |
| Build command | npm install |
| Deploy command | npm run deploy |
| Node version | 22 |
| Output | .open-next/worker.js and .open-next/assets/ |

### sovereign-os-api

| Setting | Value |
|---|---|
| Worker name | sovereign-os-api |
| Root directory | apps/worker |
| Config file | apps/worker/wrangler.toml |
| Build command | npm install |
| Deploy command | npx wrangler deploy |
| Node version | 22 |
| Health | api.defrag.app/ and api.defrag.app/health |

---

## D. Why sovv-web Uses npm install as Build Command

apps/web/package.json deploy script:

```
"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

Workers Builds runs:
1. Build command: npm install — installs dependencies
2. Deploy command: npm run deploy — runs OpenNext build AND Cloudflare deploy

Do NOT use npm install && npm run build:worker as build command.
This runs OpenNext build twice.

Do NOT use npm run build:worker as deploy command.
build:worker only builds, does not deploy.

---

## E. Dashboard Connection Steps

### sovv-web

1. dash.cloudflare.com → Workers and Pages → sovv-web → Settings → Build and Deployments
2. Click Connect Git → defragapp/SOVV
3. Branch: main | Root: apps/web | Build: npm install | Deploy: npm run deploy | Node: 22
4. Env vars: JWT_SECRET, NEXT_PUBLIC_API_URL=https://api.defrag.app, NEXT_PUBLIC_AI_URL=https://ai.defrag.app
5. Save and Deploy

### sovereign-os-api

1. dash.cloudflare.com → Workers and Pages → sovereign-os-api → Settings → Build and Deployments
2. Click Connect Git → defragapp/SOVV
3. Branch: main | Root: apps/worker | Build: npm install | Deploy: npx wrangler deploy | Node: 22
4. Save and Deploy

---

## F. Validation

```bash
curl -I https://defrag.app           # HTTP 307
curl -I https://app.defrag.app       # HTTP 200
curl -s https://api.defrag.app/      # { "service": "sovereign-os-api", "status": "ok" }
curl -s https://api.defrag.app/health # { "ok": true, "service": "sovereign-os-api" }
```

---

## G. Troubleshooting

| Symptom | Fix |
|---|---|
| Live site does not reflect repo | Check Workers Builds connected and latest commit deployed |
| Build fails | Check Node version is 22 |
| Worker name mismatch | Dashboard name must match wrangler config name |
| app.defrag.app does not resolve | DNS must be proxied AAAA 100:: |
| Pages project appears | Remove Pages custom domain, delete sovv-platform |
| Build runs twice | Build command must be npm install only |
| worker.js is 2278 bytes | Correct — stub template, full bundle built by wrangler during deploy |

---

## H. Local Build Verification

```bash
npm install
cd apps/web && npm install && npm run build:worker
test -f .open-next/worker.js && echo "OK"
test -d .open-next/assets && echo "OK"
cd ../worker && npm install && npx wrangler deploy --dry-run
```

---

## I. Node Version

| File | Value |
|---|---|
| .nvmrc | 22 |
| package.json engines | node >=22 |
| apps/web/package.json engines | node >=22 |
| apps/worker/package.json engines | node >=22 |
| Workers Builds Node version | 22 |