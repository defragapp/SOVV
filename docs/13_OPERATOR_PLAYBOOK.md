# Operator Playbook

 — Sovereign.os

## Purpose

How to run the platform day-to-day without breaking it, exposing private engine data, or drifting from the product definition.

---

## 1. System Principles

**The engine is proprietary.**
The Baseline Design synthesis logic, pattern extraction, prompt chains, and scoring are server-side only. They are never sent to the client. They are never explained in detail to users.

**The UI shows useful summaries, not raw computation.**
Users see: what is active in the moment, the loop, the twist, the strength, the Best Next Response. They do not see: gate weights, transit scores, raw Baseline Design objects, system prompts, or model chain reasoning.

**The user is never told what to do — only shown structure and options.**
Defrag shows patterns and responses. The user decides what to do with them. Never frame output as instruction, prediction, or guarantee.

**No guarantees of outcomes.**
The platform helps users see patterns and practice responses. It does not predict what will happen. It does not guarantee relationship outcomes, behavioral change, or emotional resolution.

**Private by design.**
Birth details, thread content, notebook entries, and relationship data are never shared, sold, or used outside the user's own session context.

---

## 2. When Something Breaks

### AI output feels wrong or weak
1. Verify Baseline Design is present — check `/api/baseline` returns a valid baseline
2. Check thread context — was the message clear enough for the AI to work with?
3. Check API health — is the worker responding normally?
4. If output is consistently weak, check pattern extraction is running

### Blank or empty results
1. Check Baseline Design exists — the worker returns `needs_baseline` if missing
2. Check the explain route is reachable
3. Check Cloudflare Worker logs for errors

### User confusion about output
1. Point them to the "Why this answer?" summary (when built)
2. Remind them: Defrag shows structure, not final answers
3. Suggest they add more context to the thread

### Build fails after a patch
1. Run `npm run build` from the repo root
2. Check TypeScript errors first
3. Do not push until build passes clean

---

## 3. Release Discipline

### Recommended release flow

1. Validate the app with `npm run build` and `npm run build -w apps/worker` before pushing.
2. Use Node.js 22+ for Cloudflare deploy jobs.
3. Use `npm run ship -- "short summary"` to move the current work onto `main` and push it to GitHub.
4. Cloudflare Workers Builds handles the deploy automatically after the push.
5. If Workers Builds is not yet active, use `npm run deploy:all` as a fallback.

Every patch must:
- Build successfully (0 errors)
- Not expose private engine data to the client
- Not change the product definition without explicit approval
- Not introduce new claims about outcomes or accuracy
- Not assume external services unless confirmed in code or Cloudflare bindings
- Have its own commit with a clear message
- Be reported with exact files changed
- Pass the naming compliance checks in `docs/09_ACCEPTANCE_TESTS.md`

**Stop and ask before:**
- Changing worker prompt logic
- Modifying auth or session handling
- Adding new API routes
- Changing Baseline Design storage format
- Touching middleware

---


### Workers Builds Configuration for Monorepo (worker-ai & worker-session)
When configuring Cloudflare Workers Builds for workers within an npm workspace (like `worker-ai` and `worker-session`), you must set the root directory to the repository root so `npm install` can resolve the workspace packages (e.g., `@sovereign/core`).

| Setting | Value |
|---|---|
| Root directory | `.` (repo root) |
| Build command | `npm install` |
| Deploy command | `cd apps/worker-ai && npx wrangler deploy` (or worker-session) |

## 4. Red Flags — STOP Conditions

Immediately stop and review if a patch:

| Signal | Action |
|---|---|
| Exposes raw Baseline Design object to client | Revert immediately |
| Exposes scoring weights or gate/channel data | Revert immediately |
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

---

## 5. Vocabulary Discipline

Always use approved terms. Never use rejected terms in UI, marketing, or support.

**Approved:** Your Baseline Design, The sky over you, Active pattern, The Loop, The Twist, Your Strengths, Connection Loop, Pressure Loop, Best Next Response, Alignment, Practice, Your Story, Watch It, Try It Out, Defrag space, Covenant space, Sovereign.os Library

**Rejected:** Clear Move, Design Points, Stress Distortions, Directional Architecture, Emotional Architecture, Body Signals, Feminine Wound, Masculine Wound, Shadow Work, Inner Child Work, Spiritual Gifts, Somatic Signature, Wound Architecture, Therapy Replacement, Oracle, Frequency, Destiny, Meditate, Breathe, Workbench, DEFRAG (in body copy)

---

## 6. Current Stack

- **Platform**: Sovereign.os (parent) with Defrag and Covenant spaces
- **Frontend**: Next.js 15, Cloudflare Worker (`sovv-web`) via OpenNext. **Do not use Pages.**
- **API Worker**: Cloudflare Worker (`api.defrag.app`)
- **Database**: D1 (`vibesdk-db`) — users, sessions, library, interactions, patterns, subscriptions
- **Baseline Design storage**: KV (binding: `KV`) — Baseline Design data, session state, usage counters
- **AI**: Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fast`)
- **Auth**: Session token + JWT
- **Billing**: Stripe (keys in Worker env, not in source)

Do not assume services beyond this list without confirming in code or Cloudflare bindings.

---

## 7. Domains

| Domain | Purpose |
|---|---|
| `defrag.app` | Sovereign.os platform landing (Defrag highlighted) |
| `www.defrag.app` | Sovereign.os platform landing |
| `app.defrag.app` | Authenticated Sovereign.os app shell |
| `sovereign.defrag.app` | Transitional Sovereign.os landing host |
| `api.defrag.app` | Cloudflare Worker API |
| `ai.defrag.app` | Cloudflare AI Worker |
| `session.defrag.app` | Cloudflare Session Worker |

---

## 8. Spaces

| Space | Route | Purpose |
|---|---|---|
| Defrag | `/apps/defrag` | Relational intelligence — the default space |
| Covenant | `/apps/covenant` | Optional faith-context reflection — user-initiated |

Both spaces share: auth, Baseline Design, Library, subscription, invites, permissions, admin roles.

---

## 9. Contact

Public contact: `info@defrag.app`

Do not expose private forwarding destination in any code, UI, or documentation committed to the repo.

---

## 10. Public Tone and Visual Assets

- Public pages should read calm, direct, restrained, and precise.
- Avoid therapy language, prophetic language, spiritual authority language, and hype copy.
- Marketing copy can be warm, but it should stay concrete and product-led.
- AI output should be short, structural, and practical.
- Keep visual assets simple and consistent with the black/white product system.

## AI Agent Guardrails



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

## Repo Cleanup and Drift Control



## Files Removed in Realignment (2026-06-06)

The following files were removed from git tracking and added to `.gitignore`:

### Sensitive / Operational Files
| File | Reason |
|---|---|
| `cookies.txt` | Session cookie dump — credentials |
| `apps/worker/cookies.txt` | Session cookie dump — credentials |
| `apps/worker/login.log` | Runtime log |
| `apps/worker/login.pid` | Process ID file |
| `apps/worker/wrangler.log` | Wrangler runtime log |
| `cf_audit.txt` | Cloudflare audit output |
| `fix_billing.js` | Ad-hoc script |
| `update_index.js` | Ad-hoc script |
| `tatus` | Mistyped `git status` output |
| `deploy-worker.yml` | Misplaced workflow file |
| `apps/worker/src/deploy.yml` | Misplaced workflow file |
| `apps/worker/src/deploy-worker.yml` | Misplaced workflow file |

**⚠️ ACTION REQUIRED**: Rotate any session tokens that were present in `cookies.txt` files.

### Stale App Files
| File | Reason |
|---|---|
| `apps/web/src/` (entire directory) | Duplicate app root — stale scaffold |
| `apps/web/wrangler.old.json` | Legacy Cloudflare Pages config |
| `apps/web/tailwind.config.js` | Duplicate — `.ts` version is correct |
| `apps/web/app/todo.md` | Operational file inside app directory |

### Rogue Workflows
| File | Reason |
|---|---|
| `.github/workflows/fix-lockfile.yml` | Auto-committed to all branches on every push |
| `.github/workflows/deploy-live.yml` | Deprecated — replaced by Cloudflare Workers Builds |

---

## Drift Prevention Rules

### Files That Must Never Be Committed
```
cookies.txt
apps/worker/cookies.txt
apps/worker/login.log
apps/worker/login.pid
apps/worker/wrangler.log
*.log
*.pid
cf_audit.txt
fix_billing.js
update_index.js
tatus
deploy-worker.yml
apps/worker/src/deploy.yml
apps/worker/src/deploy-worker.yml
apps/web/wrangler.old.json
apps/web/tailwind.config.js
apps/web/src/
apps/web/app/todo.md
```

All of the above are in `.gitignore`.

### Build Artifacts That Must Not Be Committed
```
apps/web/.open-next/          ← gitignored at root
apps/web/.next/               ← gitignored at root
apps/worker/index.js          ← gitignored
apps/worker/index.js.map      ← gitignored
apps/worker/src/*.js.map      ← gitignored
apps/worker/src/*.d.ts.map    ← gitignored
```

### The One App Root Rule
`apps/web/app/` is the **only** Next.js app root. `apps/web/src/` must not exist.
If `apps/web/src/` reappears, delete it immediately.

---

## Periodic Drift Checks

Run these checks before any release:

```bash
# Check for sensitive files
git ls-files | grep -E "cookies\.txt|\.log$|\.pid$|wrangler\.log"

# Check for duplicate app root
ls apps/web/src/ 2>/dev/null && echo "ERROR: src/ exists — delete it"

# Check for stale configs
ls apps/web/wrangler.old.json 2>/dev/null && echo "ERROR: wrangler.old.json exists"

# Check for DEFRAG in body copy (should only appear in titles/headers)
grep -rn '"DEFRAG' apps/web/app/ apps/web/components/ apps/web/data/ | grep -v "title\|metadata\|eyebrow\|header\|logo\|SOVEREIGN"

# Check for Workbench in user-facing copy
grep -rn "Workbench\|WORKBENCH" apps/web/app/ apps/web/components/

# Check for "workspace" where "space" is required
grep -rn "ENTER WORKBENCH\|Enter Workspace\|Open Workspace\|Go to Workspace" apps/web/
```

---

## Branch Policy

| Branch | Purpose | Deploy |
|---|---|---|
| `main` | Production | Cloudflare Workers Builds (auto) |
| `feat/*` | Feature work | Preview only |
| `codespace-*` | Codespace saves | Do not merge directly — review first |

### Branches Requiring Review Before Merge
- `feat/host-routing` — routing concept is valid but destination mapping conflicts with platform hierarchy. Must be updated before merge.
- `feat/api-wireup` — contains API wireup work. Review for naming compliance before merge.
- `codespace-expert-umbrella-*` — emergency saves. Cherry-pick useful commits only.
- `codespace-symmetrical-meme-*` — emergency saves. Cherry-pick useful commits only.
## Emergency Protocol: Systemic Drift Reset

If any output, copy, or UI uses:
- diagnostic language (anxious, avoidant, attachment style)
- identity-based labeling
- therapy framing
- spiritual authority tone
- vague abstraction

Then:

1. HALT execution
2. IDENTIFY violating term
3. REPLACE with system-neutral wording
4. APPEND:
   "This explains a pattern — not who you are."
5. REVALIDATE against docs/01_PRODUCT_LANGUAGE.md

This rule overrides all others.
