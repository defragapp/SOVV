# AI Agent Guardrails

### Autonomous Operation & Branching Policy

   * **Cohesive Development:** Agents must prioritize building on the existing `main` branch or a single active feature branch. The creation of "one-off" feature branches for minor fixes or audits is strictly prohibited to prevent repository drift.
   * **Autonomous PR Resolution:** Agents are empowered and expected to work all assigned Pull Requests to a "Ready to Merge" state. This includes:
      * Resolving merge conflicts autonomously by favoring the `main` branch's architectural Source of Truth.
      * Integrating requested security fixes (e.g., CORS `Vary: Origin` headers) without requiring multiple iterations.
      * Validating that all CI checks (Workers Builds) pass before marking a PR as resolved.

   * **Drift Prevention:** Before initiating any new task, agents must audit the current branch count. If more than one non-main branch exists, agents must prioritize consolidating or closing orphaned branches before starting new work.
