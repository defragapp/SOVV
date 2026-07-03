# Sovereign.os — Improvement Roadmap
*Generated: 2026-07-03*

## Current State Assessment

### ✅ Working
- Auth: login, register, password reset (email), session management
- Defrag AI: active signals, timing, output validation, retry logic
- Covenant AI: faith-context reflection with guardrails
- Alignment AI: response integrity layer
- Baseline Design: natal chart compilation via JPL Horizons
- Live sky timing: current planetary positions (just added)
- Library: save/load/delete results
- Stripe billing: checkout, webhooks, tier gating
- Marketing site: 7-section homepage, product pages

### 🔴 Critical Gaps

**1. Baseline compilation not triggered on settings save**
- User saves birth data → baseline.ts stores raw data in KV
- `compileBaselineDataset()` is called but may not complete before user enters workspace
- The derive-profile endpoint uses raw baseline, not compiled dataset
- Result: AI gets minimal context instead of full HD/astro/GK synthesis

**2. AI model is too small for the task**
- `@cf/meta/llama-3.1-8b-instruct-fast` — 8B params, fast but shallow
- For pattern recognition + behavioral synthesis, needs more capacity
- Should test `@cf/meta/llama-3.3-70b-instruct-fp8-fast` or similar

**3. Alignment and Covenant don't use live sky**
- Only Defrag (explain-extended.ts) fetches live sky
- Alignment and Covenant use dataset.astronomy (natal, not current)
- All 3 spaces should use current sky for timing

**4. No streaming responses**
- All AI responses are blocking (wait for full completion)
- Users see nothing for 3-8 seconds then full result appears
- Should stream tokens as they arrive

**5. Baseline compilation status not surfaced**
- User has no feedback on whether their baseline is compiled
- If compilation fails (JPL timeout), user gets degraded AI responses silently

### 🟠 Structural Improvements

**6. Session-based vs user-based storage**
- Many routes use `sid` (session ID) as the KV key
- This means baseline data is tied to a session, not a user
- If session expires, baseline context is lost
- Should migrate to user-ID-based keys

**7. No conversation history in workspaces**
- Each Defrag submission is independent
- AI has no memory of previous exchanges in the same session
- Should maintain a thread of recent exchanges

**8. Pattern extraction not wired to AI responses**
- `extractPatterns()` exists but may not be called after every response
- Patterns should accumulate over time to improve future responses

**9. Audio Overview only in Defrag**
- Covenant and Alignment don't have audio generation
- Should be available in all 3 spaces

### 🟡 Visual/UX Improvements

**10. Workspace empty states need Baseline Design preview**
- When baseline is compiled, show the user's actual traits
- Currently shows generic prompts

**11. No progress indicator for baseline compilation**
- Settings page saves birth data but no feedback on compilation status
- Should show "Compiling your Baseline Design..." with progress

**12. Mobile workspace layout**
- 3-panel layout collapses to tabs on mobile
- Tab switching loses scroll position
- Should persist scroll position per tab

## Priority Implementation Order

### Phase 1 — AI Quality (Highest ROI)
1. Upgrade AI model to 70B for better pattern recognition
2. Wire live sky to Alignment and Covenant
3. Add conversation history to workspace thread
4. Fix baseline compilation trigger on settings save

### Phase 2 — Streaming
5. Implement streaming responses in all 3 spaces
6. Show token-by-token output as AI generates

### Phase 3 — Baseline UX
7. Baseline compilation status in settings
8. Show compiled baseline traits in workspace sidebar
9. Migrate to user-ID-based KV keys

### Phase 4 — Feature Completeness
10. Audio Overview in Covenant and Alignment
11. Pattern accumulation wired to all spaces
12. Mobile workspace improvements
