# Sovereign.os Worker Route Map

## Frontend Routes (Next.js / `web`)
- `/apps/defrag`: The primary understanding space.
- `/apps/alignment`: The response refinement space.
- `/apps/covenant`: The faith-context reflection space.
- `/settings`, `/product`, `/pricing`, `/about`: Standard application pages.

## API Worker Routes (`api.defrag.app`)
- `GET /api/baseline`: Retrieve current Baseline Design status (not raw payload).
- `POST /api/baseline`: Initialize or update Baseline Design.
- `POST /api/explain`: General situational analysis (Defrag).
- `POST /api/alignment`: Generate Best Next Response.
- `POST /api/covenant`: Generate faith-context reflection.
- `GET /api/history`: Retrieve saved Library items.
- `POST /api/history`: Save a specific result to the Library.
- `POST /api/billing/checkout`: Initiate Stripe checkout.
- `POST /api/billing/portal`: Access Stripe customer portal.
- `POST /api/billing/webhook`: Handle Stripe events to update D1 entitlements.
- `/api/auth/*`: Authentication endpoints.

## Internal Service Bindings (Not exposed to public internet)
- `worker-session`: Exposes DO methods for interactive flows.
- `worker-ai`: Exposes methods for prompt construction and inference execution.
