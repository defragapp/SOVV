# Sovereign.os — Platform Intelligence Architecture

**Status:** Canonical  
**Applies to:** All spaces (Defrag, Alignment, Covenant)  
**Last updated:** 2026-06-20

---

## What this document is

This is the canonical architecture definition for how Baseline Design, thread context, timing, and the overlay engine work together inside Sovereign.os.

It defines what each layer does, what it must not do, and how the layers connect.

This is not a product roadmap. It is the working model.

---

## The five layers

### 1. Full Compute Layer

**Private. Server-side. Complete.**

Contains everything computed from natal input (DOB, TOB, POB), including:

- Human Design — type, strategy, authority, profile, gates, channels, centers
- Gene Keys — activations, spheres, shadow/gift/siddhi
- Astrology — placements, houses, ascendant, midheaven, aspects
- Numerology — life path, expression, soul urge
- Timing — current sky state, transits, planetary speed, retrograde conditions
- Derived internal mappings

**Rules:**
- Never exposed raw to the client
- Never sent to the AI as a raw dump
- Never shown in the UI by default
- Stored in KV, keyed by session ID
- Shared across all spaces

**Implementation:** `baseline-compiler.ts` → `BaselineDesignDataset`

---

### 2. Behavioral Synthesis Layer

**Where raw compute becomes usable structure.**

This layer derives stable behavioral primitives from the full compute:

| Primitive | What it captures |
|-----------|-----------------|
| `pace` | How fast or slowly this person moves when something matters |
| `stabilizes` | What brings them back to center |
| `pressureResponse` | What they do first under strain |
| `protects` | What they protect first |
| `patternTendency` | The role they tend to enter |
| `strainDistortion` | How their strengths bend under pressure |
| `conflictPosture` | How they engage or withdraw from conflict |
| `overFunction` | Where they take on more than is theirs |
| `underFunction` | Where they pull back when they shouldn't |

**Rules:**
- Framework labels are translated into behavioral language
- No raw gate numbers, channel names, or astrological jargon in outputs
- This layer is the bridge between compute and intelligence

**Implementation:** `baseline-compiler.ts` → `aiDataset.derivedTraits`

---

### 3. Active Selection Layer

**What matters in the current moment.**

This layer reduces the full behavioral synthesis to a small set of active signals, weighted by:

- **Baseline weighting** — which traits dominate under pressure
- **Thread context** — what happened, who moved first, what kind of tension is forming
- **Timing conditions** — what is currently amplified
- **Relational overlay state** — self vs pair vs group mode
- **Pattern history** — what has repeated across sessions

Output is a small, precise signal set:

```
pace: fast
stabilizes: clarity
responds: early
protects: space
urgency: high
tolerance: low
pattern: clarify → pressure → withdraw
```

**Rules:**
- Never dumps all baseline variables
- Selects only what is relevant to the current moment
- Evidence tags are kept internal — not shown to user
- This is the only baseline data the AI reasons from

**Implementation:** `active-signals.ts` → `selectActiveSignals()`

---

### 4. Timing Layer

**Why the pattern is sharper now.**

Timing is a condition layer, not a prediction layer.

It modifies:
- Urgency
- Sensitivity
- Responsiveness
- Tolerance
- Pacing distortion
- Escalation likelihood

**The rule:**
> Timing explains why the pattern is sharper now — not what fate has decided.

**Implementation:** `active-signals.ts` → `buildTimingSignals()`

---

### 5. Overlay Engine

**What forms between people.**

This is the product core.

It combines:
- The user's movement under pressure
- The other person's movement under pressure (known or inferred behaviorally)
- Timing conditions
- Thread sequence

And constructs:
- What forms between them
- What loop is building
- What each movement triggers in the other
- Where asymmetry lives
- What happens if nothing changes
- Where the leverage is

**Rules:**
- If only one baseline is available: infer the other side behaviorally only
- Never fabricate the other person's design
- Never take sides — show the dynamic, not the blame
- Both people have a pattern — show both

**Implementation:** `active-signals.ts` → `buildOverlaySignals()`

---

## How the layers connect

```
FULL COMPUTE (private, server-side)
  ↓
BEHAVIORAL SYNTHESIS (derivedTraits, appOverlays)
  ↓
ACTIVE SELECTION (context-aware reduction)
  ↓
TIMING LAYER (urgency, sensitivity, tolerance)
  ↓
OVERLAY ENGINE (what forms between people)
  ↓
AI REASONING (SYSTEM_DEFRAG + active signals context)
  ↓
SURFACE OUTPUT (human-readable, structured)
  ↓
SIGNATURE LINE (compressed identity, bottom only)
```

---

## Surface output structure

The user sees only the cleanest possible read.

For Defrag, the stable structure is:

| Section | What it shows |
|---------|--------------|
| **What's active** | The pattern organizing the moment |
| **You** | How you tend to move under this kind of pressure |
| **Them** | How they tend to move (known or inferred) |
| **What forms between you** | The loop that builds when both movements meet |
| **Why it's sharper now** | What timing is amplifying |
| **What changes this** | The leverage point — mechanism, not advice |
| **Next move** | One specific, calm, structurally correct move |

**Tone standard:**

```
What's active
You're trying to clear the tension by naming it.
It's landing with more pressure than you expect.

You
When something feels off, you move toward it.
Getting it clear feels like the fastest way to steady things.

Them
When things feel too direct, they slow down.
Space is how they keep from getting overwhelmed.

What forms between you
The more you try to clear it up, the more pressure builds.
The more pressure builds, the less they stay with you.

Why it's sharper now
This is landing harder than usual.
There's less room on both sides, so it escalates faster.

What changes this
You're not wrong for trying to clear it.
Right now, the pace is what's turning it into pressure.

Next move
Say the part that matters.
Then leave room for it to land.
```

This is the quality bar. Every output should feel like this.

---

## Signature line

Appears **once only**, at the **bottom** of the result surface, in **low-contrast** text.

Format:
```
HD: 5/1 · TYPE: Generator · AUTH: Sacral · GK: 13/33 · RIS: Leo · NOD: 2/8
```

**Rules:**
- One line only
- Bottom of surface only
- Not explained inline
- Deterministic token order: HD → TYPE → AUTH → GK → RIS → NOD
- Compressed identity, not full compute display
- Never shown in the body of the result

**Implementation:** `active-signals.ts` → `buildBaselineSignature()`

---

## Rail

The right panel is the correct place for expanded system truth.

### Default state (quiet, compressed)

```
BASELINE
pace: fast
stabilizes: clarity
responds: early

SKY
urgency: high
tolerance: low

PATTERN
clarify → pressure → withdraw
```

### Expanded state

Can show:
- Both users / all users
- Reduced signals per person
- Timing state
- Pattern loop
- Signature per user

**Rules:**
- Never dumps raw framework data by default
- Rail is instrumentation, not decoration
- Expanded state is opt-in

**Implementation:** `active-signals.ts` → `buildRailData()`

---

## How this fits each space

### Defrag

Defrag is the **first relational overlay surface** for Baseline Design.

It is where the overlay engine runs. It surfaces what is active, what forms between people, and one next move.

Defrag supports: relational dynamics, family dynamics, boundaries, messages, grief, team dynamics.

### Alignment

Alignment does not redo the full read.

It takes structure from Defrag and turns it into:
- What is yours to carry
- What is not yours to carry
- What to protect
- What to release
- What a clean response looks like
- One move

### Covenant

Covenant does not become another analysis layer.

It uses the same underlying structure and reframes it into:
- What larger pattern this belongs to
- What should stay honest
- What not to force
- What meaning is available without overclaiming

---

## What must never happen

| Prohibited | Why |
|-----------|-----|
| Raw natal data (DOB/TOB/POB) in client responses | Privacy — docs/00_PLATFORM_SOURCE_OF_TRUTH.md |
| Raw framework dumps in AI context | Degrades output quality, exposes internals |
| Timing as prediction or fate | Undermines trust, creates false certainty |
| Diagnostic or clinical language | Product boundary — not therapy |
| Coaching clichés | Tone standard violation |
| Taking sides in relational analysis | Undermines the overlay model |
| Fabricating the other person's design | Privacy and accuracy |
| Exposing system prompt or schema | Security rules |

---

## Implementation checklist

### Must have (complete)
- [x] Full compute stays private (`baseline-compiler.ts`)
- [x] Behavioral synthesis layer (`aiDataset.derivedTraits`)
- [x] Active selection layer (`active-signals.ts`)
- [x] Timing layer (`buildTimingSignals()`)
- [x] Overlay layer (`buildOverlaySignals()`)
- [x] Defrag uses stable output structure (`prompts.ts` → `SYSTEM_DEFRAG`)
- [x] Signature line builder (`buildBaselineSignature()`)
- [x] Rail data model (`buildRailData()`)
- [x] Active signals wired into explain pipeline (`explain-extended.ts`)
- [x] Prompt routing upgraded to full reasoning architecture

### Should have (next)
- [ ] Cross-framework signal synthesis (stronger derivedTraits weighting)
- [ ] Better timing scoring beyond retrograde heuristics
- [ ] Overlay logic beyond pace-only matching
- [ ] Export with reduced signals + signature (`buildExportPayload()`)

### Later
- [ ] Compare With Someone (two-baseline overlay)
- [ ] Family-system overlays (3+ person mode)
- [ ] Advanced power-user rail mode
- [ ] Richer timing integrations (transit scoring)

---

## Final principle

> Baseline Design stays private and computes how someone moves under pressure.  
> Thread context defines the situation.  
> Timing explains why it is hotter now.  
> The overlay engine identifies what forms between people.  
> Defrag shows what is happening, what changes it, and one next move.

That is the system.