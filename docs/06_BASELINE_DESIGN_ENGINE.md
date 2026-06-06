# Baseline Design Engine

## What Is the Baseline Design

The Baseline Design is the user's starting map. It is derived from date of birth (DOB), time of birth (TOB), and place of birth (POB). It shows how the user tends to process, respond, connect, protect, communicate, and return to center.

The Baseline Design is:
- **Private by design** — never exposed in client responses
- **Shared across all spaces** — Defrag and Covenant both use the same Baseline Design
- **Stored in KV** — keyed by session ID, not in D1
- **Used as hidden context** — injected into AI prompts server-side only

---

## Storage

| Layer | Key | Content |
|---|---|---|
| KV (binding: `KV`) | `baseline:{session_id}` | Serialized `Baseline` object (DOB, TOB, POB, version, timestamps) |
| KV (binding: `KV`) | `user:{session_id}` | User metadata (created, updated, baselineAt) |

The KV namespace is `SOVV_DATA` in the Cloudflare dashboard. The binding name in `wrangler.toml` is `KV`.

---

## Internal Code Identifiers

These identifiers use legacy naming but represent Baseline Design data. Do not rename without a coordinated migration.

| Identifier | File | Represents |
|---|---|---|
| `getBaseline(env, sid)` | `apps/worker/src/baseline.ts` | Fetch Baseline Design from KV |
| `saveBaseline(env, sid, data)` | `apps/worker/src/baseline.ts` | Save Baseline Design to KV |
| `formatBaseline(baseline)` | `apps/worker/src/baseline.ts` | Format Baseline Design for AI prompt injection |
| `BaselineRequest` | `packages/core/src/types.ts` | Input type for Baseline Design (DOB, TOB, POB) |
| `Baseline` | `packages/core/src/types.ts` | Full Baseline Design record with version and timestamps |
| `BASELINE_VERSION` | `packages/core/src/types.ts` | Current Baseline Design schema version |
| `BASELINE_KEY(sid)` | `apps/worker/src/baseline.ts` | KV key generator for Baseline Design |
| `baselineContext` | `apps/worker/src/prompt.ts` | Formatted Baseline Design string for AI prompt |
| `baseline_loaded` | `packages/core/src/types.ts` | Whether Baseline Design is loaded in thread metadata |

---

## AI Prompt Injection

The Baseline Design is injected into AI prompts as hidden context:

```
Baseline (internal only):
DOB: {dob}
TOB: {tob}
POB: {pob}
```

Rules:
- The AI must use the Baseline Design for consistency but must not mention it in the answer.
- The AI must not invent Baseline Design facts if none are provided.
- If Baseline Design is missing, the `needs_baseline` flow returns a structured error to the client.

---

## Baseline Design API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/baseline` | GET | Fetch current user's Baseline Design |
| `/api/baseline` | POST | Save / update Baseline Design |

Both routes require authentication. The Baseline Design is never returned in raw form to the client — only a confirmation that it exists.

---

## D1 Schema Note

The live D1 database (`vibesdk-db`) does **not** have a `designs` or `baseline_design` table. Baseline Design data is stored entirely in KV. The `PLAN.md` reference to a "Designs Table" is a legacy artifact — that table was never created.

---

## Baseline Design in Covenant Space

The Covenant space uses the same Baseline Design as the Defrag space. The `/api/covenant` route accepts an optional `baselineContext` parameter. The `sovereign-os-api` worker fetches the Baseline Design from KV using the authenticated session and injects it into the Covenant AI prompt.