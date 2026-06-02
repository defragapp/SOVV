# Operator Playbook — Sovereign.os / DEFRAG

## Purpose

How to run the product day-to-day without breaking it, exposing private engine data, or drifting from the product definition.

---

## 1. System Principles

**The engine is proprietary.**
The baseline synthesis logic, pattern extraction, prompt chains, and scoring are server-side only. They are never sent to the client. They are never explained in detail to users.

**The UI shows useful summaries, not raw computation.**
Users see: what got lit up, the loop, the twist, the strength, the Best Next Response. They do not see: gate weights, transit scores, raw baseline objects, system prompts, or model chain reasoning.

**The user is never told what to do — only shown structure and options.**
DEFRAG shows patterns and responses. The user decides what to do with them. Never frame output as instruction, prediction, or guarantee.

**No guarantees of outcomes.**
The product helps users see patterns and practice responses. It does not predict what will happen. It does not guarantee relationship outcomes, behavioral change, or emotional resolution.

**Private by design.**
Birth details, thread content, notebook entries, and relationship data are never shared, sold, or used outside the user's own session context.

---

## 2. When Something Breaks

### AI output feels wrong or weak
1. Verify baseline is present — check `/api/baseline` returns a valid baseline
2. Check thread context — was the message clear enough for the AI to work with?
3. Check API health — is the worker responding normally?
4. If output is consistently weak, check pattern extraction is running

### Blank or empty results
1. Check baseline exists — the worker returns `needs_baseline` if missing
2. Check the explain route is reachable
3. Check Cloudflare Worker logs for errors

### User confusion about output
1. Point them to the "Why this answer?" summary (when built)
2. Remind them: DEFRAG shows structure, not final answers
3. Suggest they add more context to the thread

### Build fails after a patch
1. Run `node_modules/next/dist/bin/next build` from `apps/web`
2. Check TypeScript errors first
3. Do not push until build passes clean

---

## 3. Release Discipline

Every patch must:
- Build successfully (26 pages, 0 errors as of current state)
- Not expose private engine data to the client
- Not change the product definition without explicit approval
- Not introduce new claims about outcomes or accuracy
- Not assume external services unless confirmed in code or Cloudflare bindings
- Have its own commit with a clear message
- Be reported with exact files changed

**Stop and ask before:**
- Changing worker prompt logic
- Modifying auth or session handling
- Adding new API routes
- Changing baseline storage format
- Touching middleware

---

## 4. Red Flags — STOP Conditions

Immediately stop and review if a patch:

| Signal | Action |
|---|---|
| Exposes raw baseline object to client | Revert immediately |
| Exposes scoring weights or gate/channel data | Revert immediately |
| Surfaces system prompts in any response | Revert immediately |
| Introduces diagnosis or therapy language in UI | Revert immediately |
| Introduces outcome guarantees or accuracy claims | Revert immediately |
| Adds client-trusted logic for permissions or tier | Revert immediately |
| Breaks build | Do not push |
| Removes auth check from protected route | Revert immediately |

---

## 5. Vocabulary Discipline

Always use approved terms. Never use rejected terms in UI, marketing, or support.

**Approved:** Your Baseline, The sky over you, What got lit up, The Loop, The Twist, Your Strengths, Connection Loop, Pressure Loop, Body Clue, Back to Center, Best Next Response, Alignment, Practice, Your Story, Watch It, Try It Out

**Rejected:** Clear Move, Design Points, Stress Distortions, Directional Architecture, Emotional Architecture, Body Signals, Feminine Wound, Masculine Wound, Shadow Work, Inner Child Work, Spiritual Gifts, Somatic Signature, Wound Architecture, Therapy Replacement, Oracle, Frequency, Destiny, Meditate, Breathe

---

## 6. Current Stack

- Frontend: Next.js 15, Cloudflare Worker static assets (`sovv-web`)
- Worker: Cloudflare Worker (`api.defrag.app`)
- Database: D1 (interactions, patterns)
- Storage: KV (baseline, session)
- AI: Cloudflare Worker AI (`@cf/meta/llama-3.1-8b-instruct-fast`)
- Auth: Session token + JWT
- Billing: Stripe (keys in Worker env, not in source)

Do not assume services beyond this list without confirming in code or Cloudflare bindings.

---

## 7. Domains

| Domain | Purpose |
|---|---|
| `defrag.app` | Public marketing site |
| `www.defrag.app` | Public marketing site |
| `app.defrag.app` | Authenticated workspace |
| `sovereign.defrag.app` | Public marketing (alias) |
| `api.defrag.app` | Cloudflare Worker API |

---

## 8. Contact

Public contact: `info@defrag.app`

Do not expose private forwarding destination in any code, UI, or documentation committed to the repo.