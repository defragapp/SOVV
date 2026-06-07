# Sovereign.os Platform Architecture

## Core Logic
The platform operates on a strictly server-side intelligence model. The client layer (Next.js) serves as a thin UI for the data retrieved from the Cloudflare Worker API.

## Platform Hierarchy
- **Sovereign.os** — the parent platform
- **Defrag** — the relational intelligence space inside Sovereign.os
- **Covenant** — the optional faith-context reflection space inside Sovereign.os

Both spaces share one auth system, one Baseline Design, one Library, and one subscription.

## Database Layer (Cloudflare D1 — `vibesdk-db`)
- **library**: Unified saved-work layer for all spaces. Strict row-level isolation using `user_id`. `workspace_source` column distinguishes space (internal values: `DEFRAG`, `COVENANT`).
- **users**: Authentication state, subscription status, role.
- **sessions**: Session tokens and expiry.
- **interactions**: AI interaction history.
- **patterns**: Extracted behavioral patterns.
- **subscriptions**: Stripe subscription records.

## Baseline Design Layer (Cloudflare KV — binding: `KV`)
- Baseline Design data stored in KV, keyed by session ID.
- Internal identifier: `baseline:{session_id}`.
- Never exposed in client responses.
- Shared across all spaces.

## Security Layer
- **Authentication**: JWT-based sessions managed by `sovereign-os-api`.
- **Bot Protection**: Silent Turnstile validation on all critical workspace inputs.
- **Isolation**: All database queries hard-code a `WHERE user_id = ?` clause derived from the verified session.

## Spaces
1. **Defrag** — Real-time pattern analysis for relational moments. Route: `/apps/defrag`.
2. **Covenant** — Optional faith-context reflection space. Route: `/apps/covenant`.

## Design System
- **Esoteric Brutalism**: Pure black backgrounds, 1px white borders, monospaced typography, zero gradients, zero rounded corners.