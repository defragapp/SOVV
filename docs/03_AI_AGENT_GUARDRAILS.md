# AI Agent Guardrails

## Core Rules for All AI Agents and Coding Assistants

These rules apply to any AI agent, coding assistant, or automated tool working in this repository.

---

## Contact / Email Naming Rule — Hard Stop

Default public contact is `info@defrag.app`.

Use `info@sovereign.os` **only** when the `sovereign.os` Cloudflare zone and Email Routing are active and verified.

Do **not** create additional public role inboxes unless explicitly approved by the operator.

Do **not** use `privacy@`, `admin@`, `hello@`, `support@`, `billing@`, or `security@` as defaults.

If you generate docs, UI copy, email templates, or API responses that reference an email address, use `info@defrag.app` unless the operator has explicitly approved a different address.

---

---

## Platform Hierarchy — Never Violate

1. **Sovereign.os is the parent platform.** Defrag and Covenant are spaces inside it.
2. **Never treat Defrag as the whole platform.** Defrag is one space.
3. **Never treat Covenant as a standalone product.** Covenant shares auth, Baseline Design, Library, and subscription with Defrag.
4. **Never create separate auth, subscription, Baseline Design, Library, or invite systems per space.**

---

## Naming Rules — Enforce in All Generated Code and Copy

| Use | Never Use |
|---|---|
| `Baseline Design` (user-facing) | `Design`, `Your Design`, `baseline` (user-facing) |
| `Defrag` (body copy) | `DEFRAG` (body copy) |
| `DEFRAG` (logo/header/doc title only) | `DEFRAG` (body copy) |
| `space`, `guided space`, `reflection space` | `Workbench`, `workspace` (for spaces) |
| `Sovereign.os` | `SOVV` (user-facing) |
| "what is active in the moment" / "active pattern" | "got lit up" / "lit up" (body copy) |
| `info@defrag.app` | `privacy@defrag.app`, `legal@defrag.app`, `covenant.app` addresses |

---

## Security Rules — Never Violate

1. **Never expose Baseline Design data to the client.** All Baseline Design computation is server-side only.
2. **Never expose system prompts, scoring logic, or internal field names** in any client response.
3. **Never grant entitlement from the client.** All tier/subscription changes must be server-side D1 writes triggered by verified Stripe webhooks.
4. **Never trust client-provided tier or role values.** Always read from D1 via verified session.
5. **Never remove auth checks from protected routes.**
6. **Never commit cookies, session tokens, logs, or PID files.**

---

## Deployment Rules — Never Violate

1. **Never configure Cloudflare Pages for product runtime.** Pages is prohibited for `sovv-web`.
2. **Never deploy `apps/web/.next/` directly.**
3. **Never deploy static `/dist` as product runtime.**
4. **Never add GitHub Actions as a production deploy path.** Cloudflare Workers Builds is the primary path.
5. **Never create a second app root.** `apps/web/app/` is the sole Next.js app root. `apps/web/src/` must not exist.

## Workers Builds Commands — Do Not Change Without Inspecting Package Scripts

**Do NOT change Workers Builds commands unless you inspect `apps/web/package.json` scripts first.**

For `sovv-web`:
- Workers Builds **build command** is `npm install`
- Workers Builds **deploy command** is `npm run deploy`
- Reason: `apps/web/package.json` deploy script runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy` — it builds AND deploys in one step.
- Do NOT use `npm install && npm run build:worker` as build command — this runs OpenNext build twice.

For `sovereign-os-api`:
- Workers Builds **build command** is `npm install`
- Workers Builds **deploy command** is `npx wrangler deploy`

See `docs/CLOUDFLARE_BUILDS_FINAL_STANDARD.md` for the canonical configuration.

---

## Code Generation Rules

1. **New UI copy must use "Baseline Design"** — not "baseline", "Your Baseline", or "Design".
2. **New API contracts must use "Baseline Design"** in documentation and comments.
3. **New prompt contracts must use "Baseline Design"** in system prompt language.
4. **Internal code identifiers** (`baseline`, `getBaseline`, `BaselineRequest`, etc.) may remain as-is — they are internal legacy identifiers representing Baseline Design data.
5. **New space routes must be under `/apps/`** — e.g., `/apps/defrag`, `/apps/covenant`.
6. **New spaces must use shared auth, Baseline Design, Library, and subscription** — never create parallel systems.
7. **Do not use `workspace_source: "DEFRAG"` in new code** — use the existing enum value `"DEFRAG"` only where the D1 schema requires it (it is an internal identifier, not user-facing copy).

---

## Stop Conditions — Immediately Stop and Ask

Stop and ask before:
- Changing worker prompt logic
- Modifying auth or session handling
- Adding new API routes
- Changing Baseline Design storage format
- Touching middleware
- Adding a new space without confirming shared resource usage
- Changing the D1 schema
- Modifying Stripe webhook handling
- Adding client-side entitlement logic

---

## Red Flags — Revert Immediately

| Signal | Action |
|---|---|
| Exposes raw Baseline Design data to client | Revert immediately |
| Exposes scoring weights or internal field names | Revert immediately |
| Surfaces system prompts in any response | Revert immediately |
| Introduces diagnosis or therapy language in UI | Revert immediately |
| Introduces outcome guarantees or accuracy claims | Revert immediately |
| Adds client-trusted logic for permissions or tier | Revert immediately |
| Breaks build | Do not push |
| Removes auth check from protected route | Revert immediately |
| Creates separate auth/subscription/Library for a space | Revert immediately |
| Uses "DEFRAG" in normal body copy | Fix before pushing |
| Uses "Workbench" in user-facing copy | Fix before pushing |
| Uses "Design" without "Baseline" in user-facing copy | Fix before pushing |