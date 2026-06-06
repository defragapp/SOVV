# Sovereign.os — Platform Source of Truth

## Platform Identity

**Sovereign.os** is the parent platform. It is the private home base for a user's account, Baseline Design, subscription, saved Library, and connected spaces.

**Defrag** is a space inside Sovereign.os. It is the relational intelligence space for working through what is active now — the pattern, the loop, the response that gives the moment a better chance.

**Covenant** is a space inside Sovereign.os. It is an optional faith-context reflection space. User-initiated, plain-language, and private by design.

Future spaces are added under the same Sovereign.os architecture. They do not get separate accounts, subscriptions, or Libraries.

---

## What Is Shared Across All Spaces

| Resource | Shared? | Notes |
|---|---|---|
| User account | ✅ Yes | One account per user across all spaces |
| Auth / session | ✅ Yes | Single JWT session, `sovereign-os-api` |
| Baseline Design | ✅ Yes | Stored in KV, keyed by session ID |
| Library | ✅ Yes | D1 `library` table, `workspace_source` column distinguishes space |
| Subscription / entitlement | ✅ Yes | D1 `users.tier`, managed by Stripe webhook |
| Invite / permission system | ✅ Yes | D1 `promo_codes`, invite flow |
| Owner / Ambassador admin | ✅ Yes | D1 `users.role` |

---

## Canonical Naming Rules

| Context | Correct | Incorrect |
|---|---|---|
| Platform name | Sovereign.os | SOVV, Defrag (as platform) |
| Defrag in body copy | Defrag | DEFRAG |
| Defrag in logo / header / doc title | DEFRAG | Defrag |
| Covenant in body copy | Covenant | COVENANT |
| Baseline Design (user-facing) | Baseline Design | Design, Your Design, baseline |
| Spaces (user-facing) | space, guided space, reflection space | Workbench, workspace (for spaces) |
| Workspace (app shell) | space, your space | Workbench |

---

## Domain Hierarchy

| Domain | Purpose | Served By |
|---|---|---|
| `defrag.app` | Sovereign.os platform landing (Defrag highlighted) | `sovv-web` Worker |
| `www.defrag.app` | Same as `defrag.app` | `sovv-web` Worker |
| `sovereign.defrag.app` | Transitional Sovereign.os landing host | `sovv-web` Worker |
| `app.defrag.app` | Authenticated Sovereign.os app shell | `sovv-web` Worker |
| `api.defrag.app` | API Worker | `sovereign-os-api` Worker |
| `ai.defrag.app` | AI Worker | `worker-ai` Worker |
| `session.defrag.app` | Session Worker | `worker-session` Worker |

If `sovereign.os` hostnames are configured, they become canonical alongside `defrag.app`.

---

## Space Routes

| Route | Space | Notes |
|---|---|---|
| `/apps/defrag` | Defrag space | Default space for authenticated users |
| `/apps/covenant` | Covenant space | Optional, user-initiated |

---

## Cloudflare Platform Resources

| Resource | Name | Notes |
|---|---|---|
| D1 database | `vibesdk-db` | Sovereign.os platform database (legacy name) |
| KV namespace | `SOVV_DATA` (binding: `KV`) | Session state, Baseline Design cache, usage counters |
| R2 bucket | `vibesdk-templates` | Media, exports, templates |
| R2 bucket | `web-opennext-cache` | OpenNext ISR cache |
| Queue | `pattern-extraction-tasks` | Background pattern extraction |
| AI Gateway | `sovereign-ai-gateway` | No auth, 100 req/min |
| AI Gateway | `vscode-codespace-agent` | Auth-enabled, 500 req/min, 3 retries |
| Turnstile | `defrag-app-managed` | Public form protection |

---

## Internal Code Identifier Notes

The following internal identifiers use legacy naming but represent Baseline Design data. Do not rename without a coordinated migration:

| Identifier | Location | Represents |
|---|---|---|
| `baseline`, `getBaseline`, `saveBaseline` | `apps/worker/src/baseline.ts` | Baseline Design storage functions |
| `BaselineRequest`, `Baseline` | `packages/core/src/types.ts` | Baseline Design TypeScript types |
| `BASELINE_KEY` | `apps/worker/src/baseline.ts` | KV key prefix for Baseline Design |
| `baselineContext` | `apps/worker/src/prompt.ts` | Baseline Design context in AI prompts |
| `baseline_loaded` | `packages/core/src/types.ts` | Whether Baseline Design is loaded in thread |
| `workspace_source` | D1 `library` table | Identifies which space saved the Library item |