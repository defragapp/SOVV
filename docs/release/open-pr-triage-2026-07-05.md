# Open PR triage — 2026-07-05

This note records the cleanup decision after the deployment recovery work and direct integration of the safe visual/agent prompt changes.

## Already merged or integrated

- PR #126 — merged to `main`: production web deployment routing guardrails, OpenNext Worker config, stale-page smoke checks, cache purge helper, and deploy workflow.
- PR #124 — integrated directly to `main`: platform-readiness checklist requirement added to both Sovereign agent prompts. Closed as superseded.
- PR #125 — mostly integrated directly to `main`: marketing route visual consistency cleanup. Closed as superseded. One principles-page micro-edit was intentionally not forced after connector replacement was blocked.

## Keep active, but do not merge blindly

### PR #123 — CI pipeline, KMS encryption, tier entitlements, motion components

Status: open draft, not mergeable.

This is the likely source-of-truth candidate for the next substantial release pass because it contains CI, KMS, entitlements, tests, and motion component work. It should be rebuilt or rebased into a fresh focused PR against current `main`, not merged as-is.

Files to review from #123:

- `.github/workflows/deploy.yml`
- `.env.example`
- `apps/worker/src/kms.ts`
- `apps/worker/src/entitlements.ts`
- `apps/worker/src/covenant.ts`
- `apps/worker/src/tests/entitlements.test.ts`
- `apps/worker/src/tests/kms.test.ts`
- `apps/web/components/marketing/motion-section.tsx`
- `apps/web/app/page.tsx`

## Supersede or split before continuing

### PR #122 — Phase 1 KMS, Stripe Billing, Dark Theme Enforcement

Status: open, not mergeable.

Risk: overlaps with #123 and deletes a large amount of code. Do not merge as-is. Any remaining useful ideas should be compared against #123 and rebuilt in a fresh focused PR.

### PR #114 — Agent instructions and worker safety follow-ups

Status: open, not mergeable.

Risk: mixed scope. Worker safety work that previously landed into this branch should be split into focused Worker runtime PRs against current `main`.

### PR #115 — Stabilize repo health and setup

Status: open draft, not mergeable.

Risk: old stabilization branch with broad package/deploy changes and very large deletion count. Superseded by PR #126 and direct deployment workflow changes unless a specific file is intentionally recovered.

### PR #116 — SOVV Engineering Chat vertical slice

Status: open draft, not mergeable.

Risk: valuable direction but not production-ready. Should be rebuilt after the release gate is stable, with explicit auth/approval boundaries.

### PR #117 — Read-only SOVV Operator API façade

Status: open draft, not mergeable.

Risk: useful concept but should be rebuilt after core deployment and release discipline are clean.

### PR #118 — Sovereign.os blueprint specification and mapping

Status: open draft, not mergeable.

Risk: docs/spec only, but stale. Pull any useful content into current docs manually if needed.

## Recommended next integration order

1. Stabilize current `main` after PR #126 and direct cleanup commits.
2. Verify deployment workflow and live production smoke checks.
3. Rebuild #123 as a fresh Phase 1 infrastructure PR against current `main`.
4. Only after #123 is clean, revisit operator/engineering-chat work from #116/#117.
5. Keep stale, non-mergeable branches closed unless they are intentionally rebuilt.
