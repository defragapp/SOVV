# Repo Audit Report

## Repo Mapping
- **Baseline**: Managed via `apps/sovereign-control` and `packages/core`.
- **Defrag Space**: Standard web application features in `apps/web`.
- **Alignment/Covenant Spaces**: Requires entitlement checks and KMS integration.

## Missing Pieces (Phase 1)
- **KMS Integration**: No direct KMS implementation found in `lib/` or `packages/`.
- **Stripe Billing**: Entitlement logic for Alignment/Covenant tiers needs implementation.
- **Theme Standardization**: Clean dark theme components exist but need global enforcement to replace any 'Esoteric Brutalism' leftovers.

## Infra Hints
- Use **PostgreSQL** for multi-tenant space data.
- **KMS** for Covenant space encryption.
- **Stripe** for pro tier lifecycle management.
