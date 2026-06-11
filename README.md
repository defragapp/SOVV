# Sovereign.os Platform

Sovereign.os is a privacy-first relational intelligence platform. It is the private home base for a user's account, Baseline Design, subscription, saved Library, and connected spaces.

## Platform Hierarchy

- **Sovereign.os** — the parent platform
- **Defrag** — the relational intelligence space inside Sovereign.os
- **Covenant** — the optional faith-context reflection space inside Sovereign.os
- **Alignment** — the response integration and action choice space inside Sovereign.os

All three spaces share one auth system, one Baseline Design, one Library, and one subscription.

## Architecture

- **Frontend**: Next.js App Router deployed as a Cloudflare Worker via OpenNext (`sovv-web`)
- **API Worker**: `sovereign-os-api` — auth, Baseline Design, explain, history, billing, and workspace logic
- **Session Worker**: `worker-session` — session coordination with Durable Objects
- **AI Worker**: `worker-ai` — auxiliary AI analysis and gateway routing
- **Database**: Cloudflare D1 (`vibesdk-db`)
- **Cache / Session State**: Cloudflare KV (binding: `KV`)
- **Object Storage**: Cloudflare R2
- **Queue**: Cloudflare Queue for background pattern extraction
- **Security**: Cloudflare Turnstile and Cloudflare Access where applicable

## Core Principle

One user. One Baseline Design. One Library. Three guided spaces.

## Domains

| Domain | Purpose |
|---|---|
| `defrag.app` / `www.defrag.app` | Sovereign.os platform landing (Defrag highlighted) |
| `sovereign.defrag.app` | Transitional Sovereign.os landing host |
| `app.defrag.app` | Authenticated Sovereign.os app shell |
| `api.defrag.app` | API Worker |
| `ai.defrag.app` | AI Worker |
| `session.defrag.app` | Session Worker |

## Space Routes

| Route | Space |
|---|---|
| `/apps/defrag` | Defrag space (relational intelligence) |
| `/apps/covenant` | Covenant space (faith-context reflection) |
| `/apps/alignment` | Alignment space (response integration and action choice) |

## Database Schema

- **users**: Primary user records, auth metadata, subscription status, role
- **sessions**: Session tokens and expiry
- **library**: Unified saved-work layer for all spaces (`workspace_source` distinguishes space)
- **interactions**: AI interaction history
- **patterns**: Extracted behavioral patterns
- **people**: User-defined people for relational threads
- **subscriptions**: Stripe subscription records
- **promo_codes**: Ambassador promo codes

## Development

```bash
# Install dependencies
npm install

# Run all workers locally
npm run dev:all

# Run individual workers
npm run dev:api      # sovereign-os-api
npm run dev:web      # sovv-web (OpenNext preview)
npm run dev:ai       # worker-ai
npm run dev:session  # worker-session
```

## Deployment

Primary deployment is via **Cloudflare Workers Builds** (Git integration on `main` branch).

```bash
# Ship to production (commit + push → triggers Cloudflare Builds)
npm run ship -- "short description"

# Manual deploy (fallback — requires Node 22)
cd apps/web && npm run deploy        # sovv-web
cd apps/worker && npx wrangler deploy # sovereign-os-api
```

**Workers Builds configuration:**

| Worker | Root | Build | Deploy | Node |
|---|---|---|---|---|# Sovereign.os Platform

Sovereign.os is a privacy-first relational intelligence platform. It is the private home base for a user's account, Baseline Design, subscription, saved library, and connected spaces.

## Platform Hierarchy

- **Sovereign.os** - the parent platform
- **Defrag** - the relational intelligence space inside Sovereign.os
- **Covenant** - the optional faith-context reflection space inside Sovereign.os
- **Alignment** - the response integration and action choice space inside Sovereign.os

All three spaces share one auth system, one Baseline Design, one Library, and one subscription.

## Architecture

- **Frontend**: Next.js App Router deployed as a Cloudflare Worker via OpenNext (`sovv-web`)
- **API Worker**: `sovereign-os-api` - auth, Baseline Design, explain, history, billing, and workspace logic
- **Session Worker**: `worker-session` - session coordination with Durable Objects
- **AI Worker**: `worker-ai` - auxiliary AI analysis and gateway routing
- **Database**: Cloudflare D1 (`vibesdk-db`)
- **Cache / Session State**: Cloudflare KV (binding: `KV`)
- **Object Storage**: Cloudflare R2
- **Queue**: Cloudflare Queue for background pattern extraction
- **Security**: Cloudflare Turnstile and Cloudflare Access where applicable

## Core Principle

One user. One Baseline Design. One Library. Three guided spaces.

## Domains

| Domain | Purpose |
|---|---|
| `defrag.app` / `www.defrag.app` | Sovereign.os platform landing (Defrag highlighted) |
| `sovereign.defrag.app` | Transitional Sovereign.os landing host |
| `app.defrag.app` | Authenticated Sovereign.os app shell |
| `api.defrag.app` | API Worker |
| `ai.defrag.app` | AI Worker |
| `session.defrag.app` | Session Worker |

## Space Routes

| Route | Space |
|---|---|
| `/apps/defrag` | Defrag space (relational intelligence) |
| `/apps/covenant` | Covenant space (faith-context reflection) |
| `/apps/alignment` | Alignment space (response integration and action choice) |

## Database Schema

- **users**: Primary user records, auth metadata, subscription status, role
- **sessions**: Session tokens and expiry
- **library**: Unified saved-work layer for all spaces (`workspace_source` distinguishes space)
- **interactions**: AI interaction history
- **patterns**: Extracted behavioral patterns
- **people**: User-defined people for relational threads
- **subscriptions**: Stripe subscription records
- **promo_codes**: Ambassador promo codes

## Development

```bash
# Install dependencies
npm install

# Run all workers locally
npm run dev:all

# Run individual workers
npm run dev:api     # sovereign-os-api
npm run dev:web     # sovv-web (OpenNext preview)
npm run dev:ai      # worker-ai
npm run dev:session # worker-session
```

## Deployment

Primary deployment is via **Cloudflare Workers Builds** (Git integration on `main` branch).

```bash
# Ship to production (commit + push -> triggers Cloudflare Builds)
npm run ship -- "short description"

# Manual deploy (fallback - requires Node 22)
cd apps/web && npm run deploy        # sovv-web
cd apps/worker && npx wrangler deploy # sovereign-os-api
```

**Workers Builds configuration:**

| Worker | Root | Build | Deploy | Node |
|---|---|---|---|---|
| sovv-web | apps/web | npm install | npm run deploy | 22 |
| sovereign-os-api | apps/worker | npm install | npx wrangler deploy | 22 |
| worker-ai | apps/worker-ai | npm install && npm run build | npx wrangler deploy | 22 |
| worker-session | apps/worker-session | npm install && npm run build | npx wrangler deploy | 22 |

`npm run deploy` in `apps/web` runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.

See `docs/CLOUDFLARE_BUILDS_FINAL_STANDARD.md` for the canonical configuration.

## Documentation

| Doc | Purpose |
|---|---|
| `docs/00_PLATFORM_SOURCE_OF_TRUTH.md` | Platform hierarchy, naming, domains, resources |
| `docs/01_BUILD_AND_DEPLOY_STANDARD.md` | Build and deployment standard |
| `docs/02_ROUTE_OWNERSHIP.md` | Worker routes, DNS, orphaned resources |
| `docs/03_AI_AGENT_GUARDRAILS.md` | Rules for AI agents and coding assistants |
| `docs/04_REPO_CLEANUP_AND_DRIFT_CONTROL.md` | Cleanup history and drift prevention |
| `docs/05_PRODUCT_LANGUAGE.md` | Canonical terms, naming rules, forbidden terms |
| `docs/06_BASELINE_DESIGN_ENGINE.md` | Baseline Design storage, API, and AI injection |
| `docs/07_APP_SPACES_ARCHITECTURE.md` | Space architecture, routes, Library schema (Defrag, Covenant, Alignment) |
| `docs/08_CLOUDFLARE_WORKERS_BUILDS.md` | Workers Builds setup steps |
| `docs/09_ACCEPTANCE_TESTS.md` | Pre-release compliance checks |
| `docs/operator-playbook.md` | Day-to-day operational guidance |
| `docs/product-boundaries.md` | Product capability and boundary definitions |
| `docs/legal-positioning.md` | Legal positioning and claims guidance |

| sovv-web | apps/web | npm install | npm run deploy | 22 |
| sovereign-os-api | apps/worker | npm install | npx wrangler deploy | 22 |

`npm run deploy` in `apps/web` runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.

See `docs/CLOUDFLARE_BUILDS_FINAL_STANDARD.md` for the canonical configuration.

## Documentation

| Doc | Purpose |
|---|---|
| `docs/00_PLATFORM_SOURCE_OF_TRUTH.md` | Platform hierarchy, naming, domains, resources |
| `docs/01_BUILD_AND_DEPLOY_STANDARD.md` | Build and deployment standard |
| `docs/02_ROUTE_OWNERSHIP.md` | Worker routes, DNS, orphaned resources |
| `docs/03_AI_AGENT_GUARDRAILS.md` | Rules for AI agents and coding assistants |
| `docs/04_REPO_CLEANUP_AND_DRIFT_CONTROL.md` | Cleanup history and drift prevention |
| `docs/05_PRODUCT_LANGUAGE.md` | Canonical terms, naming rules, forbidden terms |
| `docs/06_BASELINE_DESIGN_ENGINE.md` | Baseline Design storage, API, and AI injection |
| `docs/07_APP_SPACES_ARCHITECTURE.md` | Space architecture, routes, Library schema (Defrag, Covenant, Alignment) |
| `docs/08_CLOUDFLARE_WORKERS_BUILDS.md` | Workers Builds setup steps |
| `docs/09_ACCEPTANCE_TESTS.md` | Pre-release compliance checks |
| `docs/operator-playbook.md` | Day-to-day operational guidance |
| `docs/product-boundaries.md` | Product capability and boundary definitions |
| `docs/legal-positioning.md` | Legal positioning and claims guidance |
| `docs/support-escalation.md` | Support response tiers |
