# Sovereign.os — Post-Launch Review System

**Version:** 1.0  
**Use after:** every major deployment  
**Applies to:** product, visual, output quality, conversion, stability

---

## Part 1 — 7-Day Post-Launch Review Template

Run this review at Day 1, Day 3, and Day 7 after any major deployment.

---

### Day 1 — Stability + First Impressions

**Goal:** confirm nothing is broken, catch immediate regressions.

#### Technical
- [ ] Homepage loads correctly on desktop Chrome, Safari, Firefox
- [ ] Homepage loads correctly on iPhone Safari (test on real device)
- [ ] Hero image crop feels balanced on both
- [ ] Embedded Defrag preview is readable and not visually heavy
- [ ] Auth flow works (sign in, sign up, session persistence)
- [ ] Defrag output renders in correct 7-section order
- [ ] Signature line appears once only, at bottom only
- [ ] Rail appears only when data exists
- [ ] Session counter shows correct remaining count
- [ ] Pricing / checkout flow works end-to-end
- [ ] No console errors on public pages
- [ ] No 500 errors in worker logs

#### Visual
- [ ] No pill buttons visible anywhere
- [ ] No hover scale / bounce on any interactive element
- [ ] Hero feels product-led, not poster-like
- [ ] All public pages feel visually consistent with homepage
- [ ] Mobile hero crop holds up on actual iPhone hardware

#### Output quality (first 5 real sessions)
- [ ] Defrag outputs feel specific, not generic
- [ ] "What changes this" lands clearly
- [ ] "Next move" feels useful, not obvious
- [ ] No output feels like "AI wording"

---

### Day 3 — Behavior + Patterns

**Goal:** identify where users drop off, what they engage with, what confuses them.

#### Conversion
- [ ] Homepage → sign-in / sign-up flow: where do people drop?
- [ ] First Defrag completion rate: are people finishing a session?
- [ ] Pricing page engagement: are people reading it or bouncing?
- [ ] Upgrade flow: any friction or confusion?

#### Hero effectiveness
- [ ] Primary CTA clickthrough: is "Enter Sovereign.os" being clicked?
- [ ] Secondary CTA clickthrough: is "See how it works" being used?
- [ ] Scroll depth from hero: are people scrolling past the hero?
- [ ] Embedded preview engagement: do people interact with it?

#### Output quality (10+ sessions)
- [ ] Are outputs feeling recognized or generated?
- [ ] Is "What forms between you" consistently accurate?
- [ ] Is "Why it's sharper now" adding value or feeling vague?
- [ ] Are any sections consistently weak or skipped?

#### Visual quality
- [ ] Does any page feel behind the homepage in quality?
- [ ] Does any page still feel generic SaaS?
- [ ] Does mobile feel like a premium native surface?

---

### Day 7 — Quality + Direction

**Goal:** decide what to tune, what to leave, what to build next.

#### Product understanding
- [ ] Can users explain Sovereign.os in one sentence?
- [ ] Is "Baseline Design" understood from the way it is presented?
- [ ] Is the Defrag / Alignment / Covenant distinction clear?

#### Output quality (20+ sessions)
- [ ] Which section of Defrag output is most useful to users?
- [ ] Which section is most often ignored?
- [ ] Does "Next move" feel helpful or generic across different inputs?
- [ ] Are outputs improving with more Baseline Design context?

#### Stability
- [ ] Any auth failures or session issues?
- [ ] Any API timeouts or rate limit hits?
- [ ] Any rail / signature missing states?
- [ ] Any mobile layout issues reported?

#### Decision
- [ ] What is the one thing that most needs tuning?
- [ ] What is working better than expected?
- [ ] What should not be touched?

---

## Part 2 — Real-User Interview Script

Use with 5–10 real users. Run sessions of 20–30 minutes.

**Intro:**
> "Use the site naturally. Don't try to be nice. I want to know where it feels clear, unclear, strong, or off. There are no wrong answers."

---

### First impression (2 min)

1. In your own words, what is this product?
2. What do you think it helps with?
3. What feels different about it from other AI tools you've used?

---

### Homepage / hero (3 min)

4. When you land on the homepage, what draws your eye first?
5. Does the hero feel like a product or like a brand page?
6. Does the embedded preview make sense immediately — or does it feel like a demo?
7. Is any part of the homepage confusing or too abstract?
8. What would make you want to keep reading?

---

### Trust and clarity (3 min)

9. Do you feel like the system is reading something real, or generating polished text?
10. Does "Baseline Design" make sense from the way it is presented?
11. Does anything feel too vague, too mystical, or too complicated?
12. What would make you trust this more?

---

### Defrag output (5 min)

*Have the user run a real Defrag session with something they are actually working through.*

13. Which section of the result feels most useful?
14. Does "What changes this" make sense immediately?
15. Does "Next move" feel helpful or generic?
16. Does anything in the output feel repetitive or over-written?
17. Does the result feel like it understood your situation — or like it could apply to anyone?

---

### Visual and interaction (3 min)

18. Does the interface feel premium?
19. Does anything feel noisy, crowded, or too "designed"?
20. Does anything feel too much like a startup app or chatbot?
21. Does the mobile version feel like a real product?

---

### End (2 min)

22. What would make you want to use this again?
23. What feels unfinished, if anything?
24. Who would you recommend this to?

---

### What to listen for

**Good signals:**
- "It felt like it already knew something."
- "I didn't expect it to be that specific."
- "It's not like other AI tools."
- "I want to use this before I send that message."

**Warning signals:**
- "This sounds smart but generic."
- "I don't know what to do with this."
- "It feels like AI wording."
- "I'm not sure what Baseline Design actually is."
- "It feels like a lot of sections."

---

## Part 3 — Product Quality Scorecard

Use this after every major release or output quality review.

Score each dimension 1–5. Target: 4+ across all dimensions.

---

### Visual quality

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Hero feels product-led, not poster-like | | |
| All pages feel like one system | | |
| No generic SaaS visual language | | |
| Motion is subtle and controlled | | |
| Radius / spacing / typography consistent | | |
| Mobile feels premium, not shrunken desktop | | |

---

### Output quality

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Outputs feel specific to the situation | | |
| "What's active" names the pattern clearly | | |
| "You" and "Them" feel accurate | | |
| "What forms between you" identifies the loop | | |
| "Why it's sharper now" adds timing context | | |
| "What changes this" identifies the mechanism | | |
| "Next move" is specific and usable | | |
| No output feels like generic AI text | | |

---

### Product clarity

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Users can explain the product in one sentence | | |
| "Baseline Design" is understood without explanation | | |
| Defrag / Alignment / Covenant distinction is clear | | |
| The system feels private and trustworthy | | |
| The product feels different from other AI tools | | |

---

### Technical integrity

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Active signals are driving outputs (not raw baseline) | | |
| No raw framework data visible in UI | | |
| Signature line is deterministic and correct | | |
| Rail is quiet by default, useful when expanded | | |
| Auth / session / billing flows work cleanly | | |
| No regressions from last deployment | | |

---

### Scoring guide

| Score | Meaning |
|-------|---------|
| 5 | Excellent — no action needed |
| 4 | Good — minor tuning only |
| 3 | Acceptable — schedule improvement |
| 2 | Weak — prioritize fix |
| 1 | Broken or missing — fix immediately |

**Target:** 4+ across all dimensions before any major marketing push.

---

## Final principle

> The right user reaction is: "That's exactly it."  
> Not: "That sounds smart."  
> Not: "That's interesting."  
>  
> If outputs consistently produce recognition instead of admiration,  
> the system is working.