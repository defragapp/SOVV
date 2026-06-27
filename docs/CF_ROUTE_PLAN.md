# Sovereign.os Cloudflare Route Plan

## 1. Web Frontend Routes (`apps/web`)

These routes define the user-facing application spaces:

- `/apps/defrag`: The Defrag space interface (understanding current context).
- `/apps/alignment`: The Alignment space interface (refining responses).
- `/apps/covenant`: The Covenant space interface (faith-context reflection).
- `/settings`: User settings and baseline configuration.
- `/pricing`, `/product`, `/about`: Marketing and informational pages.

## 2. Core API Worker Routes (`apps/worker`)

These routes handle all primary business logic, data access, and orchestration:

- `POST /api/explain`: General situational analysis (powers Defrag).
- `POST /api/alignment`: Generates the Best Next Response (powers Alignment).
- `POST /api/covenant`: Generates faith-context reflection (powers Covenant).
- `GET /api/baseline`: Retrieves current Baseline Design status.
- `POST /api/baseline`: Initializes or updates the Baseline Design.
- `GET /api/history`: Retrieves saved Library items.
- `POST /api/history`: Saves a result to the Library.
- `POST /api/billing/checkout`: Initiates Stripe checkout session.
- `POST /api/billing/portal`: Accesses Stripe customer portal.
- `POST /api/billing/webhook`: Handles incoming Stripe webhooks.

## 3. Worker Communication

The core API worker communicates with internal services via Cloudflare Service Bindings:

- `AI_SERVICE` -> `apps/worker-ai`: For prompt construction and inference.
- `SESSION_SERVICE` -> `apps/worker-session`: For interactive, multi-step flows.
