# Agent Orientation: Read Before Working

Welcome. Before you begin any task in this repository, you must review and adhere to the strict guardrails established to maintain the integrity of this codebase.

## No Drift / No Bloat Ethos

We operate under a strict **No Drift / No Bloat** ethos. This means:
   * **No Excessive Branching:** Do not create one-off feature branches for minor fixes. Build on the existing `main` branch or a single designated feature branch.
   * **No Orphaned Branches:** If you see orphaned branches or multiple active feature branches, prioritize consolidating and cleaning them up before starting new work.
   * **No Environmental Bloat:** Do not add redundant configuration files (`.devcontainer/`, temporary `.env` files, or `.github/workflows/` since we rely on native Cloudflare Workers Builds).

## Autonomous Execution

You are empowered to be an executor, not just a proposer.
   * **Resolve conflicts autonomously** by favoring `main`'s architecture.
   * **Complete tasks in full**, including addressing security fixes and ensuring all CI checks pass locally (e.g., `npm run build -w apps/web`, `npm run build -w apps/worker`) before declaring a task finished.

## Full Policies

For the comprehensive rules regarding your operation, you must read:
   * `docs/03_AI_AGENT_GUARDRAILS.md` - Details the Autonomous Operation & Branching Policy.
   * The rest of the `docs/` folder for architectural and design Source of Truth.
