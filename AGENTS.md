# Agent Instructions for Sovereign.os

If you are an AI agent working on this repository, you **must** read and adhere to the following rules.

## Core Directives

1.  **Read the Guardrails:** Immediately review `docs/03_AI_AGENT_GUARDRAILS.md`. This file contains the non-negotiable rules regarding product language, visual aesthetics, and architectural boundaries.
2.  **No "Chatbot" Interfaces:** Sovereign.os is a structured insight tool, not a conversational agent. Never implement chat bubbles, "Ask me anything" prompts, or unstructured text blobs in the UI.
3.  **Strict Language Adherence:** You must never use banned terms like "therapy", "diagnosis", "attachment style", or "workspace" (in user-facing UI). Use canonical terms like "Baseline Design", "Defrag space", and "Sovereign.os Library".
4.  **Preserve State & Logic:** When updating UI components (especially inside `apps/web/components/spaces/` or `apps/web/app/`), you must preserve existing React state, API calls (`fetch`), and authentication/billing checks.
5.  **Honest Fallbacks:** If a backend feature is missing (e.g., Audio generation, Covenant API), build a graceful, visually consistent "unavailable" state. Do not fake data or create mock endpoints.
6.  **Verification is Mandatory:** Before marking any task as complete, you must run:
    *   `npm run build -w apps/web`
    *   `npm run build -w apps/worker`
    *   A `git grep` check for banned language (see `docs/08_ACCEPTANCE_TESTS.md` or `docs/13_OPERATOR_PLAYBOOK.md` if available).

## Deployment

*   **Canonical Path:** GitHub `main` -> Cloudflare Workers Builds.
*   **Do not modify `wrangler.toml`** or build scripts to support alternative deployment platforms (like Render or Vercel) unless specifically requested.

By proceeding, you acknowledge that you have read and understood these constraints.
