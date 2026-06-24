# Implementation Gaps

## 1. Directory Structure

While we have `apps/worker-ai`, `apps/worker-session`, and `apps/worker`, there's a need to ensure the AI and session workers are correctly implemented and wired to the main `apps/worker`.

We also need to align the `apps/web` with the intended routing (Defrag, Alignment, Covenant).

## 2. Shared Packages

The user mentioned adding:
- `packages/prompts` for space prompts
- `packages/safety` for banned language, moderation gates, faith mode rules
- `packages/billing` for Stripe helpers
- `packages/ui` for shared app-shell components

Currently, only `packages/core` exists. We need to create these packages to properly encapsulate logic.

## 3. Storage and Data

The D1 database (`vibesdk-db`) and KV namespace (`SOVV_DATA`) are configured in `apps/worker/wrangler.toml`, but we need to ensure the schema and usage matches the plan (D1 for users/history/billing, KV for Baseline Design).

## 4. Routing and Spaces

The frontend (`apps/web`) needs to reflect the three spaces: Defrag, Alignment, Covenant.
The backend (`apps/worker`) needs endpoints for these spaces.
