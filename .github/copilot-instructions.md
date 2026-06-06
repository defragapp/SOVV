# Copilot Instructions — Sovereign.os Platform

## Platform Context

This repository is the Sovereign.os platform — a privacy-first relational intelligence platform built on Cloudflare Workers and Next.js App Router.

**Platform hierarchy:**
- **Sovereign.os** is the parent platform
- **Defrag** is the relational intelligence space inside Sovereign.os
- **Covenant** is the optional faith-context reflection space inside Sovereign.os
- Both spaces share one auth system, one Baseline Design, one Library, and one subscription

**Read `docs/00_PLATFORM_SOURCE_OF_TRUTH.md` before making any changes.**

---

## Repository Structure

```
apps/web/          — Next.js App Router + OpenNext (sovv-web Worker)
apps/worker/       — sovereign-os-api Worker (D1, KV, R2, Queue, AI)
apps/worker-ai/    — worker-ai Worker (AI inference + gateway)
apps/worker-session/ — worker-session Worker (Durable Objects)
packages/core/     — Shared TypeScript library (@sovereign/core)
docs/              — Platform documentation (source of truth)
scripts/           — Developer convenience scripts
```

---

## Core Working Rules

- Prefer the existing Cloudflare Worker + OpenNext/Cloudflare setup over introducing new runtime patterns.
- Reuse existing bindings, routes, and storage conventions instead of creating parallel systems.
- Preserve the current privacy-first behavior: never expose Baseline Design data, raw scoring, system prompts, or internal reasoning to the client.
- Treat the worker as the source of truth for AI orchestration, session handling, and sensitive prompt logic.
- Follow the repository's standard GitHub + Cloudflare developer flow: use the existing workspace scripts and local dev commands before introducing new tooling or deployment paths.

---

## Naming Rules (Enforce in All Generated Code and Copy)

| Use | Never Use |
|---|---|
| `Baseline Design` (user-facing) | `Design`, `Your Baseline`, `baseline` (user-facing) |
| `Defrag` (body copy) | `DEFRAG` (body copy) |
| `DEFRAG` (logo/header/doc title only) | `DEFRAG` (body copy) |
| `space`, `guided space`, `reflection space` | `Workbench`, `workspace` (for spaces) |
| `Sovereign.os` | `SOVV` (user-facing) |

---

## Product and UX Rules

- Do not introduce therapy/diagnosis language, guarantees, or outcome claims into UI or responses.
- Keep the public-facing language consistent with the approved vocabulary in `docs/05_PRODUCT_LANGUAGE.md`.
- When changing product copy, prefer framing that explains structure, options, and practice rather than prescribing outcomes.
- New spaces must be added under `/apps/{space-name}/` and must use shared auth, Baseline Design, Library, and subscription.

---

## Backend and API Rules

- If a change affects `/api/explain`, preserve strict JSON behavior and existing session/baseline requirements.
- If Baseline Design context is missing, keep the existing `needs_baseline` flow intact.
- Be careful with KV, D1, session cookies, and auth logic; verify that changes do not weaken privacy or access control.
- Avoid adding new external dependencies unless they are clearly justified by the current architecture.
- The KV binding is named `KV` in `wrangler.toml` and `env.KV` in source code.

---

## Frontend Rules

- If the UI needs new behavior, prefer routing through the existing `apps/web/app/api/*` proxy pattern instead of bypassing the Worker.
- Keep Next.js changes compatible with the Cloudflare/OpenNext setup already used in this repo.
- `apps/web/app/` is the **only** app root. Do not create or restore `apps/web/src/`.

---

## Deployment Rules

- Primary deployment: Cloudflare Workers Builds (Git integration on `main` branch).
- Do not use GitHub Actions as a production deploy path.
- Do not use Cloudflare Pages for product runtime.
- Production artifact: `.open-next/worker.js` and `.open-next/assets/`.
- See `docs/01_BUILD_AND_DEPLOY_STANDARD.md` for full deployment standard.

---

## Quality Bar

- Before claiming completion, validate the relevant checks for the area you changed.
- Run the naming compliance checks in `docs/09_ACCEPTANCE_TESTS.md` before pushing.
- Follow the platform documentation in `docs/` before making changes that affect core behavior.
- Stop and ask before: changing worker prompt logic, modifying auth or session handling, adding new API routes, changing Baseline Design storage format, or touching middleware.