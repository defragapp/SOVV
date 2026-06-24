# Sovereign.os — Intelligence Layer Audit
**Date:** 2026-06-24  
**Scope:** Edge cases, output quality comparison, post-launch conversion risk

---

## 1. Intelligence Layer Edge Cases

### 1.1 Defrag — Edge Cases

| Edge Case | Current Behavior | Risk | Fix Status |
|-----------|-----------------|------|------------|
| **Empty input** (`""` or whitespace) | Blocked client-side (`!input.trim()`) | ✅ Handled | Done |
| **Very short input** (`"I'm tired"`) | AI returns 2-3 fields (conditional OMIT rules) | ✅ Handled | Done |
| **No Baseline Design set** | Returns `type: "needs_baseline"` → error state shown | ✅ Handled | Done |
| **Daily limit reached** | Returns `daily_limit_reached` → upgrade CTA shown | ✅ Handled | Done |
| **AI returns empty JSON** | `parseJsonFromText` returns `{}` → all fields undefined → ResultCard shows nothing | ⚠️ Silent failure | Needs empty-result guard |
| **AI returns malformed JSON** | `parseJsonFromText` catches and returns `{}` → same as above | ⚠️ Silent failure | Needs empty-result guard |
| **AI omits `activePattern`** | Required field — result renders with no "What's active" section | ⚠️ Broken UX | Needs fallback |
| **AI omits `alignment`** | Required field — result renders with no "What changes this" | ⚠️ Broken UX | Needs fallback |
| **Relational mode, no target baseline** | Infers behaviorally only (correct per privacy rules) | ✅ Handled | Done |
| **Input > 3000 chars** | No client-side limit — worker may truncate or fail | ⚠️ No guard | Add textarea maxLength |
| **Network timeout** | Generic "Unable to connect" error | ✅ Acceptable | Done |
| **429 rate limit** | Handled as daily_limit_reached | ✅ Handled | Done |

### 1.2 Alignment — Edge Cases

| Edge Case | Current Behavior | Risk | Fix Status |
|-----------|-----------------|------|------------|
| **No Baseline Design** | API returns error → generic error shown | ⚠️ Not specific | Should say "Add Baseline Design first" |
| **Daily limit reached** | Now shows upgrade CTA | ✅ Fixed | Done |
| **AI omits `theShift`** | Most important field — result missing key section | ⚠️ Quality risk | Validator checks this |
| **AI omits `nextStep`** | Result has no "One move" | ⚠️ Quality risk | Validator checks this |
| **Input is a question** | AI may answer instead of analyze | ⚠️ Prompt drift | Guardrails block some patterns |
| **Input references God/faith** | Alignment guardrails block scripture references | ✅ Handled | Done |

### 1.3 Covenant — Edge Cases

| Edge Case | Current Behavior | Risk | Fix Status |
|-----------|-----------------|------|------------|
| **No Baseline Design** | API returns error → generic error shown | ⚠️ Not specific | Should say "Add Baseline Design first" |
| **Daily limit reached** | Now shows upgrade CTA | ✅ Fixed | Done |
| **AI picks wrong biblical figure** | No validation — any figure accepted | ⚠️ Quality risk | Validator checks figure is non-empty |
| **AI makes certainty claims** | Guardrails block "god told you", "you must repent" etc. | ✅ Handled | Done |
| **Input is not faith-related** | Covenant still runs — may produce weak output | ⚠️ Scope drift | Acceptable — user chose the space |
| **AI omits `forYou`** | Most important field — result missing personal connection | ⚠️ Quality risk | Validator checks this |
| **Scriptures array empty** | Result shows no scripture chips | ✅ Graceful | Section hidden if empty |

### 1.4 Cross-Space Edge Cases

| Edge Case | Current Behavior | Risk |
|-----------|-----------------|------|
| **User navigates Defrag → Alignment** | Flow suggestion links to workspace — no context passed | ⚠️ Context lost |
| **User saves result, then edits** | [id] page allows update — creates new result, old saved | ✅ Acceptable |
| **Pattern memory not loading** | `formatPatternsForPrompt` returns empty string — AI has no history | ✅ Graceful degradation |
| **Active signals fail** | `selectActiveSignals` wrapped in try/catch — falls back to raw baseline | ✅ Handled |
| **Baseline compute not ready** | `dataset?.status === "ready"` check — falls back to raw baseline text | ✅ Handled |

---

## 2. Output Quality Comparison Across Spaces

### 2.1 Defrag — Output Quality Assessment

**Strengths:**
- Conditional field rendering — depth matches input complexity
- Evidence chips connect Baseline Design data to output rows
- "Baseline Design active" chip confirms grounding
- Flow suggestion guides to next space
- Pattern history used in future sessions

**Weaknesses:**
- `activePattern` and `alignment` are always required but validator was not enforcing this
- No retry logic when AI returns empty output
- `conversationalSteering` often redundant with `bestNextResponse` — OMIT rule helps but not guaranteed
- `giftUnderStrain` field is the weakest — often generic ("you care deeply")

**Quality floor:** If AI returns only `activePattern` + `alignment` + `bestNextResponse`, the result is still useful and complete.

### 2.2 Alignment — Output Quality Assessment

**Strengths:**
- Clear ownership structure: what is yours / what isn't / what shifts / one move
- `theShift` is the highest-value field — specific, actionable
- `skyContext` adds timing layer (when available)
- Guardrails prevent Covenant drift

**Weaknesses:**
- `skyContext` is often generic ("the current moment is asking for clarity") — timing data not always available
- `avoid` field sometimes repeats `theShift` in negative form — redundant
- No Baseline Design statements shown in result (only in sidebar)
- No flow suggestion back to Defrag if user needs more pattern work

**Quality floor:** `whatIsTrue` + `whatIsYours` + `whatIsNotYours` + `theShift` + `nextStep` = complete useful result.

### 2.3 Covenant — Output Quality Assessment

**Strengths:**
- Biblical figure matching is the most distinctive feature — high differentiation
- `forYou` field creates personal connection
- `howGodMet` distinction (presence, not rescue) is theologically careful
- Guardrails are the strongest of the three spaces
- Scripture chips add credibility

**Weaknesses:**
- Figure matching quality depends entirely on AI — no validation that figure is appropriate
- `story` field sometimes too brief to be meaningful
- `reflectionPrompts` often generic ("What would it look like to trust?")
- No Baseline Design data visible in result (only in sidebar)
- Covenant is the most Pro-gated space — free users never see it

**Quality floor:** `figure` + `story` + `forYou` + `nextStep` = complete useful result.

### 2.4 Cross-Space Quality Comparison

| Dimension | Defrag | Alignment | Covenant |
|-----------|--------|-----------|----------|
| Baseline Design grounding | ✅ Strong (chips visible) | ⚠️ Sidebar only | ⚠️ Sidebar only |
| Output specificity | ✅ High (conditional fields) | ✅ High (ownership structure) | ⚠️ Medium (figure-dependent) |
| Actionability | ✅ "Next move" is specific | ✅ "One move" is specific | ⚠️ "One honest move" varies |
| Guardrail strength | ✅ Strong | ✅ Strong | ✅ Strongest |
| Retry logic | ❌ Not wired | ❌ Not wired | ❌ Not wired |
| Confidence scoring | ❌ Not surfaced | ❌ Not surfaced | ❌ Not surfaced |
| Flow to next space | ✅ Wired | ❌ No back-flow | ❌ No back-flow |

---

## 3. Post-Launch Conversion Risk Points

### 3.1 Critical Conversion Risks (Fix Before Scale)

**Risk 1: Empty result on AI failure**
- Trigger: AI returns malformed JSON or empty object
- User experience: ResultCard renders with zero sections — blank white space
- Conversion impact: User thinks product is broken → churns immediately
- Fix: Add empty-result guard in explain-extended.ts — show "Something went wrong, try again" if `activePattern` is missing

**Risk 2: No Baseline Design → confusing error**
- Trigger: New user enters workspace without setting Baseline Design
- Current: "Baseline Design is needed to begin" with link to settings
- Risk: User doesn't understand what Baseline Design is or why it's needed
- Fix: Add one-sentence explanation in the error state: "Your Baseline Design is the private map that grounds every result. It takes 30 seconds to set."

**Risk 3: Free user hits 5-session limit on first day**
- Trigger: Engaged user runs 5 sessions
- Current: "You've reached your free daily limit. Upgrade to continue." + "See Pro plans →"
- Risk: User is engaged but not yet convinced — upgrade CTA may feel premature
- Fix: Add social proof or result preview: "Pro users save results and build continuity over time."

**Risk 4: Defrag result feels generic**
- Trigger: Brief or vague input ("I'm stressed")
- Current: AI returns 2-3 fields — may feel thin
- Risk: User thinks the product doesn't work
- Fix: Add input guidance in placeholder: "The more specific you are, the more specific the result."

**Risk 5: No path from Alignment/Covenant back to Defrag**
- Trigger: User starts in Alignment or Covenant without having run Defrag first
- Current: No flow suggestion back to Defrag
- Risk: User gets a weaker result (no pattern context) and doesn't know why
- Fix: Add "Run Defrag first for deeper context" suggestion in Alignment/Covenant empty state

### 3.2 Medium Conversion Risks

**Risk 6: Library is empty on first visit**
- Trigger: New user opens Library tab
- Current: "Nothing saved yet. Save to Library after each session."
- Risk: Feels like a dead end — no value demonstration
- Fix: Show example saved results or a "Your first save will appear here" prompt

**Risk 7: Covenant is Pro-only but not clearly explained**
- Trigger: Free user clicks Covenant in nav
- Current: UpgradeBanner shown
- Risk: User doesn't understand why Covenant costs money
- Fix: Add one line: "Covenant uses your Baseline Design to find the biblical story that fits your moment — this requires Pro."

**Risk 8: Flow suggestion appears but user doesn't understand it**
- Trigger: Defrag result shows "Alignment can help you find the clearest response."
- Current: Link to Alignment workspace
- Risk: User doesn't know what Alignment is
- Fix: Add micro-description: "Alignment separates what is yours to carry from what isn't."

**Risk 9: Settings page is not discoverable**
- Trigger: User wants to update Baseline Design
- Current: "Baseline Design" link in space-shell nav
- Risk: Users on mobile may not see the nav link
- Fix: Add "Edit Baseline Design" link in Defrag workspace sidebar footer (already there — verify it's visible)

### 3.3 Low Conversion Risks (Monitor)

**Risk 10: Audio overview not generating**
- Trigger: Pro user clicks "Generate audio overview"
- Current: Calls /api/audio — may fail silently
- Risk: Pro feature not working → churn signal
- Fix: Ensure audio error state is visible (already implemented)

**Risk 11: Invite Privately flow is unclear**
- Trigger: User clicks "Invite Privately" in ResultCard
- Current: InviteModal opens
- Risk: User doesn't understand what they're inviting someone to
- Fix: Add one-line description in InviteModal header

**Risk 12: Pattern history not building**
- Trigger: User runs multiple sessions but history doesn't appear
- Current: Pattern extraction runs via queue — may fail silently
- Risk: Pro feature (continuity) not working
- Fix: Add "Pattern history" indicator in sidebar when history is active

---

## 4. Immediate Action Items

### Fix now (before any marketing push)

1. **Empty result guard** — if `activePattern` is missing after AI call, show error not blank
2. **Input length limit** — add `maxLength={2000}` to all workspace textareas
3. **Baseline Design explanation** — improve the "needs_baseline" error state copy
4. **Alignment/Covenant → Defrag back-flow** — add "Run Defrag first" suggestion

### Fix this week

5. **Retry logic** — wire `validateAndScore` properly for empty output cases
6. **Confidence scoring** — surface confidence in result header (subtle, not prominent)
7. **Library empty state** — improve with value demonstration
8. **Covenant upgrade explanation** — add one-line description of why it's Pro

### Monitor post-launch

9. **Audio generation failure rate** — track /api/audio errors
10. **Pattern history build rate** — track queue success rate
11. **Flow suggestion click-through** — track Defrag → Alignment/Covenant navigation
12. **Session-to-save rate** — track how many sessions result in Library saves

---

## 5. Intelligence Layer Integrity Checklist

| Check | Status |
|-------|--------|
| DEFRAG_REQUIRED matches prompt contract | ✅ Fixed (activePattern + alignment only) |
| Guardrails defined for all 3 spaces | ✅ Present in output-validator.ts |
| Guardrail check wired into pipeline | ⚠️ Partial (dynamic import — verify works) |
| Retry logic for empty output | ❌ Not wired |
| Confidence scoring surfaced to user | ❌ Not surfaced |
| Active signals in all 3 spaces | ✅ Defrag + Alignment + Covenant |
| Pattern memory extraction | ✅ Wired via queue |
| Flow suggestion Defrag → Alignment | ✅ Wired |
| Flow suggestion Defrag → Covenant | ✅ Wired |
| Back-flow Alignment → Defrag | ❌ Not wired |
| Back-flow Covenant → Defrag | ❌ Not wired |
| Input length validation | ❌ No client-side limit |
| Empty result guard | ❌ Not implemented |