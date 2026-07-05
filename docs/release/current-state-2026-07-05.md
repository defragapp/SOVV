# Current repo state — 2026-07-05

## What moved forward

- Production web recovery PR #126 was merged.
- The production web deploy workflow now exists on `main`.
- Stale-page smoke checks now exist.
- Cloudflare cache purge helper now exists.
- Safe visual consistency cleanup from PR #125 was applied directly to `main` where the connector allowed it.
- Platform-readiness prompt guardrails from PR #124 were applied directly to `main`.
- Stale draft PRs were closed or queued for rebuild instead of being left as false release state.

## Current active release path

1. Verify the current `main` build and deploy workflow.
2. Confirm production no longer serves the legacy Defrag page.
3. Rebuild Phase 1 infrastructure from `docs/release/phase-1-infrastructure-rebuild.md` in focused PRs.
4. Revisit Engineering Chat / Operator API only after deployment, CI, auth, and entitlement gates are stable.

## PR queue policy

- Closed stale drafts are not deleted. Their branches remain recoverable if a specific file is needed.
- Do not reopen stale broad PRs just to merge them.
- Rebuild needed work against current `main` in narrow PRs.
- Avoid large PRs that combine CI, billing, KMS, visual motion, and product copy.

## Known unresolved items

- Replit app `Sovereign OS Cleanup` exists, but Replit Agent timed out during clean-state inspection.
- The principles-page micro visual edit from PR #125 was not forced because the connector blocked the full-file replacement.
- Live Cloudflare route ownership still needs direct verification from Cloudflare or from a successful GitHub Actions deploy run.
- GitHub Actions run visibility from this connector is limited for push/workflow-dispatch runs.

## Next operator instruction

Do not treat old draft PRs as active work. Start from current `main`, verify production deployment, then rebuild Phase 1 infrastructure in small PRs.
