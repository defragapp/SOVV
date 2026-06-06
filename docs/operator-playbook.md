# Operator Playbook — Sovereign.os

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

**Approved:** Your Baseline Design, The sky over you, What got lit up, The Loop, The Twist, Your Strengths, Connection Loop, Pressure Loop, Best Next Response, Alignment, Practice, Your Story, Watch It, Try It Out, Defrag space, Covenant space, Sovereign.os Library

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