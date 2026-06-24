# Sovereign.os — Recommended Further Tasks
**Date:** 2026-06-24 | **Priority:** Ordered by impact

---

## TIER 1 — High Impact, Ship Soon

### 1.1 Signal Scoring Upgrade (Intelligence)
**What:** Replace field-count scoring with semantic quality scoring
**Why:** Current scoring counts fields. A 3-word `activePattern` scores the same as a 30-word specific one.
**How:**
- Add minimum specificity check: does `activePattern` name a role/pattern or just describe a feeling?
- Penalize generic phrases: "you care deeply", "you feel overwhelmed"
- Reward structural language: "the fixer", "pursue/withdraw", "over-function"
**Files:** `apps/worker/src/output-validator.ts`

### 1.2 Cross-Framework Signal Synthesis (Intelligence)
**What:** Improve `selectActiveSignals()` to synthesize across HD + astrology + Gene Keys
**Why:** Currently selects from one framework at a time. Cross-framework signals are stronger.
**How:**
- When HD type = Projector AND Moon in Pisces: compound signal "absorbs others' emotional states, needs invitation to act"
- When Gate 51 + Sun in Aries: "moves fast under shock, initiates before others are ready"
**Files:** `apps/worker/src/active-signals.ts`

### 1.3 Timing Scoring Beyond Retrograde (Intelligence)
**What:** Add transit-based timing signals (not just retrograde flags)
**Why:** Current timing is binary (retrograde/not). Real timing is about aspects and transits.
**How:**
- Saturn conjunct natal Sun → pressure, restriction, accountability
- Jupiter trine natal Moon → emotional expansion, openness
- Mars square natal Mercury → communication friction, urgency
**Files:** `apps/worker/src/active-signals.ts`, `apps/worker/src/baseline-compiler.ts`

### 1.4 Compare With Someone (Product)
**What:** Two-person Baseline Design overlay in Defrag
**Why:** The most differentiated feature — no other product does this
**How:**
- Invite flow already exists (`/api/invite/*`)
- Need: two-baseline overlay in `explain-extended.ts`
- Need: UI for selecting "compare with [person]" in Defrag workspace
- Need: result format showing both sides of the pattern
**Files:** `apps/worker/src/explain-extended.ts`, `apps/web/app/apps/defrag/workspace/page.tsx`

### 1.5 Pattern History Continuity (Intelligence)
**What:** Surface recurring patterns across sessions in the result
**Why:** The memory system extracts patterns but doesn't show them to the user
**How:**
- After 3+ sessions, show "This pattern has appeared before" in result
- Link to previous sessions where same pattern appeared
- Show pattern frequency in sidebar
**Files:** `apps/worker/src/memory.ts`, `apps/web/app/apps/defrag/workspace/page.tsx`

---

## TIER 2 — Medium Impact, Ship This Week

### 2.1 Alignment Back-Flow to Defrag (UX)
**What:** After Alignment result, suggest running Defrag for deeper pattern work
**Why:** Users may start in Alignment without Defrag context — result is weaker
**How:**
- After Alignment result: "Want to understand the pattern beneath this? Run Defrag."
- Link to Defrag workspace with prefilled context
**Files:** `apps/web/app/apps/alignment/workspace/page.tsx`

### 2.2 Covenant Back-Flow to Defrag (UX)
**What:** Same as above for Covenant
**Files:** `apps/web/app/apps/covenant/workspace/page.tsx`

### 2.3 Audio Overview Quality (Product)
**What:** Improve the text sent to audio generation
**Why:** Current audio text is raw field concatenation — sounds robotic
**How:**
- Build a narrative summary from fields instead of concatenating
- Add natural transitions between sections
- Limit to 3 most important fields for audio
**Files:** `apps/web/app/apps/defrag/workspace/page.tsx`, `apps/web/app/apps/alignment/workspace/page.tsx`

### 2.4 Invite Privately — Clearer UX (Product)
**What:** Improve InviteModal copy and flow
**Why:** Users don't understand what they're inviting someone to
**How:**
- Add one-line description: "They'll add their Baseline Design. You'll both see how your patterns interact."
- Show what the other person will see before they send
- Add "Private by design" reassurance
**Files:** `apps/web/components/spaces/InviteModal.tsx`

### 2.5 Session Counter — Visual Polish (UX)
**What:** Improve the session counter in Sidebar
**Why:** Current counter is functional but not premium
**How:**
- Show sessions remaining as a progress bar that depletes
- Add "5 sessions left today" copy when at limit
- Animate the bar when a session is used
**Files:** `apps/web/components/spaces/Sidebar.tsx`

### 2.6 Result Save Confirmation (UX)
**What:** After saving to Library, show a brief confirmation
**Why:** Current "Saved ✓" is too subtle — users may not notice
**How:**
- Brief toast or inline confirmation: "Saved to your Library"
- Auto-dismiss after 2 seconds
- Link to Library in confirmation
**Files:** `apps/web/components/spaces/ResultCard.tsx`

---

## TIER 3 — Polish, Ship When Ready

### 3.1 Family System Overlays (Intelligence)
**What:** 3+ person pattern analysis
**Why:** Family dynamics are a core use case — currently only 1-2 person
**How:**
- Extend overlay engine to handle 3+ baselines
- Identify who carries, who withdraws, who escalates
- Show system-level pattern, not just pair pattern
**Files:** `apps/worker/src/active-signals.ts`, `apps/worker/src/flow.ts`

### 3.2 Watch Preview (Product)
**What:** Short visual scene output for Pro users
**Why:** Listed as Pro feature but `watchPreviewAvailable: false` everywhere
**How:**
- Generate a short text-based "scene" from the result
- Display as a formatted visual card
- Could use Cloudflare AI image generation
**Files:** `apps/worker/src/explain-extended.ts`

### 3.3 Export Payload (Product)
**What:** Download result as PDF or structured text
**Why:** Users want to save results outside the platform
**How:**
- Add "Export" button to ResultCard footer
- Generate clean text export with all sections
- Optional: PDF via wkhtmltopdf or Cloudflare
**Files:** `apps/web/components/spaces/ResultCard.tsx`, `apps/worker/src/active-signals.ts`

### 3.4 Defrag Entry Page — Personalized (UX)
**What:** When Baseline Design is set, show personalized entry content
**Why:** `getTranslation("defrag")` is called but often returns null — fallback shown
**How:**
- Ensure `derive-profile` runs on first login
- Cache translation result in KV
- Show personalized behavioral statements on entry page
**Files:** `apps/web/app/apps/defrag/page.tsx`, `apps/worker/src/derive-profile.ts`

### 3.5 Alignment Entry Page — Personalized (UX)
**What:** Same as above for Alignment
**Files:** `apps/web/app/apps/alignment/page.tsx`

### 3.6 Onboarding Flow (Product)
**What:** Guided first-session experience
**Why:** New users don't know where to start
**How:**
- After Baseline Design is set: "Here's what Defrag can show you"
- First session: pre-filled example prompt
- After first result: "Save this to your Library"
**Files:** New component, `apps/web/components/spaces/AuthGuard.tsx`

### 3.7 Pattern Frequency Dashboard (Product)
**What:** Show which patterns appear most often across sessions
**Why:** The memory system tracks this but never surfaces it
**How:**
- In Library: "Your most common pattern: [pattern]"
- Show frequency count
- Link to sessions where it appeared
**Files:** `apps/web/app/app/page.tsx`, `apps/worker/src/memory.ts`

---

## TIER 4 — Future / Strategic

### 4.1 Advanced Power-User Rail Mode
**What:** Expanded rail showing full active signals, timing details, overlay breakdown
**Why:** Power users want to see the intelligence layer
**How:**
- Expandable rail section: "Show full context"
- Display all active signals, timing state, overlay signals
- Show signature line with token explanations
**Files:** `apps/web/components/spaces/ResultCard.tsx`

### 4.2 Richer Timing Integrations
**What:** Live sky data from ephemeris API
**Why:** Current timing is static (retrograde flags only)
**How:**
- Integrate JPL Horizons or similar for live planetary positions
- Calculate current transits to natal chart
- Feed into `buildTimingSignals()`
**Files:** `apps/worker/src/active-signals.ts`, `apps/worker/src/baseline-compiler.ts`

### 4.3 Multi-Language Support
**What:** Platform in Spanish, Portuguese, French
**Why:** Relational intelligence is universal
**How:**
- i18n for UI strings
- AI prompts in target language
- Baseline Design labels translated

### 4.4 Therapist/Coach Mode
**What:** Professional account type with client management
**Why:** Therapists and coaches are natural power users
**How:**
- Multiple client Baseline Designs
- Session notes
- Pattern tracking across clients

### 4.5 Mobile App (iOS/Android)
**What:** Native app
**Why:** The product is deeply personal — mobile is the right context
**How:**
- React Native or Expo
- Push notifications for pattern reminders
- Offline result viewing

---

## Day 3 vs Day 7 Review Criteria

### Day 3 — Behavior Signals
**Watch for:**
- Homepage → sign-in conversion rate (target: > 40%)
- First Defrag completion rate (target: > 60% of sign-ups)
- Session-to-save rate (target: > 20%)
- Flow suggestion click-through (target: > 15%)
- Daily limit hit rate (target: < 30% of free users)

**If weak:**
- Homepage hero not converting → hero copy or CTA
- Low Defrag completion → input friction or empty state
- Low save rate → save button not visible or compelling
- High limit hit rate → free tier too restrictive

### Day 7 — Quality Signals
**Watch for:**
- Return rate (target: > 30% of users return within 7 days)
- Pro upgrade rate (target: > 5% of active free users)
- Output quality complaints (target: < 5% of sessions)
- Audio generation success rate (target: > 90%)
- Pattern history appearing (target: > 50% of users with 3+ sessions)

**If weak:**
- Low return rate → output not feeling recognized
- Low upgrade rate → Pro value not clear or price friction
- Quality complaints → AI output generic or wrong
- Audio failures → /api/audio errors
- No pattern history → queue failures

---

## What Breaks First Under Real User Load

### Most Likely Failure Points (in order)

1. **Cloudflare AI rate limits** — `/api/explain` calls CF Workers AI. At scale, the AI Gateway rate limit (100 req/min on sovereign-ai-gateway) will be hit. Fix: upgrade AI Gateway tier or add request queuing.

2. **Pattern extraction queue** — `QUEUE.send()` in explain-extended.ts. If queue is misconfigured or at capacity, pattern extraction silently fails. Fix: monitor queue error rate, add dead-letter queue.

3. **KV read latency** — Baseline Design is read from KV on every request. At scale, KV reads add latency. Fix: cache baseline in memory for session duration.

4. **D1 write contention** — `insertInteraction()` writes to D1 on every Defrag session. D1 has write limits. Fix: batch writes or use queue for interaction logging.

5. **Derive-profile endpoint** — `/api/derive-profile` calls CF Workers AI to generate behavioral statements. Called on every workspace load. Fix: cache result in KV with 24h TTL (already implemented — verify cache hit rate).

6. **Audio generation** — `/api/audio` calls CF Workers AI for TTS. Expensive and slow. Fix: add loading state, timeout handling, and graceful degradation.

7. **Invite flow** — `/api/invite/*` creates invite tokens in D1. At scale, invite acceptance creates two-baseline overlay computation. Fix: queue the overlay computation.

8. **Session cookie expiry** — JWT sessions expire. If user is mid-session when cookie expires, they get a silent auth failure. Fix: add session refresh logic.
