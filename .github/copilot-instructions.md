# Copilot instructions for SOVV

## Project context
- This repository is a Cloudflare Workers + Next.js/Pages proof-of-concept for a privacy-first self-explanation assistant.
- Keep changes aligned with the current split between:
  - `apps/web/` for the frontend and API proxy layer
  - `apps/worker/` for the Worker backend, auth/session logic, and AI orchestration
  - `packages/core/` for shared logic

## Core working rules
- Prefer the existing Cloudflare Worker + OpenNext/Cloudflare setup over introducing new runtime patterns.
- Reuse existing bindings, routes, and storage conventions instead of creating parallel systems.
- Preserve the current privacy-first behavior: never expose baseline data, raw scoring, system prompts, or internal reasoning to the client.
- Treat the worker as the source of truth for AI orchestration, session handling, and sensitive prompt logic.
- Follow the repository’s standard GitHub + Cloudflare developer flow: use the existing workspace scripts and local dev commands before introducing new tooling or deployment paths.

## Product and UX rules
- Do not introduce therapy/diagnosis language, guarantees, or outcome claims into UI or responses.
- Keep the public-facing language consistent with the approved vocabulary in `docs/operator-playbook.md`.
- When changing product copy, prefer framing that explains structure, options, and practice rather than prescribing outcomes.

## Backend and API rules
- If a change affects `/api/explain`, preserve strict JSON behavior and existing session/baseline requirements.
- If baseline context is missing, keep the existing `needs_baseline` flow intact.
- Be careful with KV, D1, session cookies, and auth logic; verify that changes do not weaken privacy or access control.
- Avoid adding new external dependencies unless they are clearly justified by the current architecture.

## Frontend rules
- If the UI needs new behavior, prefer routing through the existing `apps/web/app/api/*` proxy pattern instead of bypassing the Worker.
- Keep Next.js changes compatible with the Cloudflare/OpenNext setup already used in this repo.

## Workspace and tooling guidance
- Keep the VS Code environment minimal and focused on the repo’s actual needs.
- Avoid introducing Azure-specific or unrelated platform tooling into this workspace unless the task explicitly requires it.
- Prefer the existing TypeScript, ESLint, Next.js, and Cloudflare development tooling already in the repo.

## Quality bar
- Before claiming completion, validate the relevant checks for the area you changed (for example, worker build/typecheck or web build/lint where applicable).
- Follow the repo’s existing docs and operational guidance in `README.md`, `PLAN.md`, and `docs/operator-playbook.md` before making changes that affect core behavior.
