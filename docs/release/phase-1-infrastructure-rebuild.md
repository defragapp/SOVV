# Phase 1 infrastructure rebuild plan

This replaces the stale, non-mergeable draft PR #123 as the tracked path for CI, KMS, entitlement, and motion-system hardening.

## Source material

Use PR #123 as source material only. Do not merge that branch directly.

Relevant files from PR #123:

- `.env.example`
- `.github/workflows/deploy.yml`
- `apps/web/app/page.tsx`
- `apps/web/components/marketing/motion-section.tsx`
- `apps/worker/.gitignore`
- `apps/worker/src/covenant.ts`
- `apps/worker/src/entitlements.ts`
- `apps/worker/src/kms.ts`
- `apps/worker/src/tests/entitlements.test.ts`
- `apps/worker/src/tests/kms.test.ts`
- `apps/worker/src/types-env.ts`
- `apps/worker/vitest.config.ts`
- `docs/runbook-vercel-removal.md`

## Rebuild rules

1. Start from current `main`.
2. Do not resurrect broad stale workflow changes that conflict with the current OpenNext web deploy path.
3. Keep web deployment focused on `sovv-web-production` and keep `api.defrag.app` on the API Worker.
4. Add KMS and entitlement work as isolated modules with tests.
5. Avoid changing visual direction unless the motion component is actively used by current pages.
6. Do not mutate live Cloudflare, Stripe, or database state from the PR.
7. Require CI and smoke checks before merge.

## Target PR sequence

### PR A — Worker KMS module and tests

- Add or update `apps/worker/src/kms.ts`.
- Add tests for encrypt/decrypt, invalid keys, malformed payloads, and runtime compatibility.
- Update worker type definitions only as needed.

### PR B — Server-authoritative entitlements

- Add or update `apps/worker/src/entitlements.ts`.
- Cover free, pro, alignment, covenant, active, trialing, past due, canceled, unpaid, promo/manual access.
- Add tests before wiring into billing or product routes.

### PR C — Covenant entitlement wiring

- Replace raw subscription checks in Covenant routes with the entitlement helper.
- Preserve existing auth, safety, and response behavior.
- Add route-level tests or focused unit tests where practical.

### PR D — CI and workflow repair

- Add missing CI checks only after package/workspace coverage is confirmed.
- Do not reintroduce stale all-worker deploy behavior.
- Keep production deploy gated and environment-scoped.

### PR E — Motion component cleanup

- Add composable motion primitives only if current pages use them.
- Preserve dark visual system and avoid large homepage rewrites in the same PR.

## Done criteria

- No stale draft PRs are required to understand the active work.
- Each rebuild PR is mergeable against current `main`.
- Each PR has a narrow scope and clear rollback path.
- Tests cover KMS and entitlements before product wiring is merged.
- Production deployment remains explicit and gated.
