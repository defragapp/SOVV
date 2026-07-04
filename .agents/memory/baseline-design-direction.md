---
name: Baseline Design product direction
description: How Sovereign.os "Baseline Design" must work — two-layer seed+calibration model, and the rules for AI prompt injection
---

# Baseline Design — product direction (decided)

**Core call:** birth data is the *seed*; lived behavior is the *calibration layer*. The first computed profile is never treated as the whole truth.

## Two-layer system
1. **Computed baseline from birth data** (`dob`/`pob`/`tob`)
   - Stable starting map. Compute + store a Baseline Design profile.
   - Feed only *reduced, behavioral active signals* into AI prompts — never raw astrology / Human Design / Gene Keys / numerology.
   - Treat birth-time uncertainty honestly.
2. **User-refined psychological pattern layer** (self-reported)
   - Fields: default retreat, core boundary, repair mechanic, pressure response, communication preference, relationship triggers.
   - These *refine* the computed baseline, they do not replace it.
   - Store refinements separately from computed source data; merge both into the active-signal layer.

## Graceful degradation (required)
- Missing self-reported fields → AI still works from computed baseline.
- Missing birth data → AI still works from self-reported fields.

## Language rules
- **Product rule:** Baseline Design is NOT "astrology content." It is the private operating map of how the user processes, responds, protects, repairs, communicates, and returns to center.
- **Public/user-facing language:** "starting map", "pattern model", "response style", "pressure signals", "repair moves", "relational tendencies". Never expose raw framework/astrology terms in user output.
- **Internal engine:** may use birth-data-derived systems as source inputs, but output must be translated into clean behavioral signals.

**Why:** decided by the user during the platform audit (July 2026). Onboarding collects birth data but the AI historically only read self-reported psych fields, so baseline-derived output was derived from nothing the user entered. This two-layer model bridges that gap.

**How to apply:** any AI prompt in defrag/alignment/covenant must inject the merged active-signal layer (computed + refinements), reduced to behavioral signals, with graceful fallback when either layer is absent.

## Engine implementation approach
The compute engine is **fully deterministic and offline** — no astronomy/geocoding npm deps, no external APIs, no secrets. It derives a seasonal solar bucket (element + modality, date-only) and an approximate lunar phase (datetime, ~1-day accuracy) as *internal source inputs only*, then maps them through fixed behavioral rubrics into the six signals. Birth time absent → `degraded`/approximate confidence; present → `ready`/high. The `meta` block keeps element/modality/phase for debugging but is never shown to users; only `signals` and the reduced active-signal strings surface.

**Why offline/deterministic:** avoids dependency bloat and secret management, keeps output reproducible, and the product only needs *behavioral signals* — precise ephemeris/coordinates would add cost without changing the behavioral output tier.

**How to apply:** one shared engine module owns compute + the `toActiveSignals` reducer; all three AI routes call the reducer so signal formatting stays consistent. Recompute the profile on every birth-data save (compute is instant, so status goes straight to ready/degraded — no async pending state needed).
