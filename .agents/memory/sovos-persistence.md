---
name: Sovereign.os backend persistence
description: Auth, baseline, archive, covenants, and Stripe webhook — all implemented locally (replacing upstream proxy).
---

## What was built

The upstream proxy to `api.defrag.app` is now replaced with local implementations for all core user-facing routes. The proxy file still exists for `/chips, /history, /patterns, /admin, /invite, /promo` fallback.

## Auth system

- **Sessions**: httpOnly cookie named `sovv_session`, 30-day TTL, stored in `sessions` table.
- **Routes**: POST /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/refresh
- **User**: GET /api/user/me — returns `{ id, email, tier: 'free'|'pro' }`
- **Middleware**: `requireAuth` and `optionalAuth` in `artifacts/api-server/src/middlewares/auth.ts`
- **Password**: bcrypt rounds=11

**Why:** api.defrag.app never existed; all auth was 404/502 before this build.

**How to apply:** All protected routes must use `requireAuth` middleware. Stripe webhook uses raw body before JSON parser — critical ordering in app.ts.

## DB schema (Drizzle + Replit PostgreSQL)

Tables: `users`, `sessions`, `baselines` (one per user, unique FK), `archive_entries`, `covenants`.

DB declarations are in `lib/db/src/schema/index.ts`. After editing schema, run `cd lib/db && npx tsc -b --force` to regenerate declarations for API server typecheck.

## Stripe webhook security rule

webhook.ts: if STRIPE_WEBHOOK_SECRET is set, always verify signature. If secret is missing in production → reject with 400. Only in development (NODE_ENV !== 'production') AND secret is absent → allow unsigned (for local testing only).

## Frontend wiring

- `ArchiveContext`: fetches GET /api/archive on mount; POSTs on save; falls back to local-only if 401.
- `CovenantDashboard`: fetches GET /api/covenants on mount; POSTs on seal; offline fallback.
- `DefragPage`: MOCK_RESULT removed; state init is null; SaveBar POSTs to archive via context.
- `lib/baseline.ts`: saveBaseline() fires-and-forgets POST /api/baseline; hydrateBaseline() fetches if localStorage empty.
- `UserContext`: calls hydrateBaseline() after successful /api/user/me response.

## Billing origin validation

billing.ts: exact host match using URL constructor — `extractOriginHost(origin) === extractOriginHost(allowed)`. No startsWith() — prevents prefix spoofing.

## Covenant API/FE field mapping

Frontend Covenant type: `{ relationship, boundary, trigger }`
DB schema: `{ title, type, withWhom, boundary, costOfViolation, sealed }`
Mapping on save: `relationship→title`, `relationship→withWhom`, `trigger→type`, `costOfViolation=""` (optional).
Mapping on fetch: `title→relationship`, `type→trigger`.
