# Human Behavior Translation Layer

## Core Rule

**Platform computes facts. AI only translates facts into simple, grounded human language.**

The AI must never invent:
- Gate numbers, channel names, or Human Design mechanics
- Astrological placements, house positions, or aspect interpretations
- Gene Key numbers, shadows, gifts, or siddhis
- Numerology values
- Planetary transits or sky positions
- Relationship facts about people not in the loaded dataset
- Diagnoses, predictions, or clinical labels
- Spiritual claims or metaphysical assertions

The AI receives a structured dataset of computed facts and returns plain-language behavioral descriptions.

---

## Architecture Position

```
BaselineDesignDataset (computed by baseline-compiler.ts)
  + LiveSkyContext (current planetary positions, optional)
  → HumanBehaviorTranslation (AI translation layer)
  → appRender objects (consumed by Alignment, Defrag, Covenant entry pages)
```

This layer sits between the computation layer and the app layer.
It does not replace the workspace mode — workspaces remain unchanged.

---

## Types

### LiveSkyContext

```ts
interface LiveSkyContext {
  date: string                    // ISO date
  bodies: Record<string, {
    sign: string
    degree: number
    retrograde: boolean
    aspect?: string               // e.g. "square Saturn"
  }>
  tone?: string                   // Plain-language summary of current sky tone
}
```

### HumanBehaviorTranslation

```ts
interface HumanBehaviorTranslation {
  version: "translation.v1"
  status: "ready" | "failed" | "partial"
  computedAt: string
  userId: string
  app: "alignment" | "defrag" | "covenant"

  // Validated output — safe to render directly
  appRender: AlignmentEntryTranslation | DefragEntryTranslation | CovenantEntryTranslation

  // Source evidence — for debugging and tag rendering
  sourceEvidence: Array<{
    tag: string           // Short label: "Sun in Aries", "Gate 51", "GK 51"
    framework: string     // "astrology" | "humanDesign" | "geneKeys" | "numerology"
    glossary: string      // One sentence: what this tag means in plain language
  }>
}
```

### AlignmentEntryTranslation

```ts
interface AlignmentEntryTranslation {
  hero: {
    anchor: string          // 1-2 lines: grounding identity statement
    tags: string[]          // Evidence tags
  }
  aligned: Array<{
    key: string
    lines: string[]         // 2-4 observable behavior lines
    tags: string[]
  }>
  misaligned: {
    over: Array<{
      key: string
      lines: string[]       // What over-expression looks like in real life
      tags: string[]
    }>
    under: Array<{
      key: string
      lines: string[]       // What under-expression looks like in real life
      tags: string[]
    }>
  }
  currentSky?: string[]     // 1-2 lines about current sky tone (if LiveSkyContext provided)
  action: string[]          // 1-2 immediately usable lines
  workspaceHref: string     // Always "/apps/alignment/workspace"
}
```

### DefragEntryTranslation

```ts
interface DefragEntryTranslation {
  hero: {
    anchor: string          // 1-2 lines: what this person tends to do under pressure
    tags: string[]
  }
  likelyLoops: Array<{
    key: string
    label: string           // Short label: "The fixer loop"
    description: string     // 1-2 lines: what this loop looks like in real life
    trigger: string         // What tends to activate it
    tags: string[]
  }>
  pressurePattern: {
    lines: string[]         // How this person behaves under pressure
    tags: string[]
  }
  repairMoves: string[]     // 2-3 concrete things that tend to help
  workspaceHref: string     // Always "/apps/defrag"
}
```

### CovenantEntryTranslation

```ts
interface CovenantEntryTranslation {
  hero: {
    anchor: string          // 1-2 lines: the core theme for this person
    tags: string[]
  }
  reflectionThemes: Array<{
    key: string
    theme: string           // Short theme label
    description: string     // 1-2 lines: what this theme means for this person
    tags: string[]
  }>
  redemptivePatterns: Array<{
    key: string
    pattern: string         // What the growth pattern looks like
    tags: string[]
  }>
  workspaceHref: string     // Always "/apps/covenant/workspace"
}
```

---

## AI System Prompt: SYSTEM_HUMAN_TRANSLATION

```
You are the Human Behavior Translation Layer for Sovereign.os.

Your job: translate a computed baseline dataset into plain-language behavioral descriptions.

ABSOLUTE RULES:
1. You receive computed facts. You translate them. You do not invent new facts.
2. Every gate number, channel name, placement, gene key, and numerology value in your output must appear in the input data.
3. Do not diagnose. Do not predict. Do not label identity.
4. Do not use therapy language ("it sounds like", "you may be experiencing", "this suggests").
5. Do not use spiritual authority language ("you are called to", "your soul purpose", "the universe is").
6. Do not write paragraphs. Write short, direct, observable lines.
7. Every visible line must describe something that can be seen, heard, felt, or noticed in real life.
8. Tags are evidence labels — short, factual, secondary to the behavior lines.
9. Different input data must produce materially different output. Do not produce generic copy.
10. If the input data is insufficient, return status: "partial" with what you can translate.

FORBIDDEN LANGUAGE:
- "your design"
- "you are meant to"
- "your purpose"
- "you are a [type] person"
- "this means you"
- "according to your chart"
- "your soul"
- "the cosmos"
- "divine"
- "healing"
- "trauma" (as identity label)
- "trigger" (as identity label)
- Any clinical diagnosis language

REQUIRED LANGUAGE PATTERN:
- Observable behavior: "You move fast when something needs a decision."
- Not summary: "You are a fast decision-maker."
- Not system: "Your Sun in Aries indicates decisiveness."

Return valid JSON only. No markdown. No code fences.
```

---

## Validator Rules

`validateHumanBehaviorTranslation(translation)` must check:

1. **No forbidden phrases** — scan all string fields for forbidden language list
2. **No invented tags** — every tag in output must appear in `sourceEvidence`
3. **Line length** — no single line exceeds 35 words
4. **Minimum content** — hero.anchor exists, at least 1 aligned/loop/theme block
5. **workspaceHref** — must match expected path for app
6. **No paragraph text** — no field contains more than 2 sentences

If validation fails:
- Log the failure
- Return `status: "partial"` with whatever passed validation
- Never block the user

---

## Builder Function

```ts
async function buildHumanBehaviorTranslation(
  env: Env,
  userId: string,
  app: "alignment" | "defrag" | "covenant",
  context?: { liveSky?: LiveSkyContext; recentPatterns?: string[] }
): Promise<HumanBehaviorTranslation>
```

Steps:
1. Load `BaselineDesignDataset` from KV (`baseline-dataset:{userId}`)
2. If dataset status is not "ready", return `status: "partial"` with fallback
3. Build source evidence array from `aiDataset.derivedTraits`
4. Build app-specific prompt from `aiDataset.appOverlays[app]` + `derivedTraits`
5. Call AI with `SYSTEM_HUMAN_TRANSLATION`
6. Parse and validate output
7. Store result in KV: `translation:{userId}:{app}` with 24h TTL
8. Return `HumanBehaviorTranslation`

---

## KV Storage

```
translation:{userId}:alignment   → HumanBehaviorTranslation (24h TTL)
translation:{userId}:defrag      → HumanBehaviorTranslation (24h TTL)
translation:{userId}:covenant    → HumanBehaviorTranslation (24h TTL)
```

Translations are cached for 24 hours. Invalidated when baseline is re-saved.

---

## API Endpoint

```
POST /api/baseline/translate
Body: { app: "alignment" | "defrag" | "covenant", refresh?: boolean }
Auth: required (session cookie)
Subscription: required for covenant + alignment, free for defrag
Returns: HumanBehaviorTranslation
```

---

## appRender Consumption

Each app entry page calls `POST /api/baseline/translate` with its app name.
The response `appRender` object is rendered directly — no further AI calls needed.

The workspace mode is unchanged — it continues to use `getBaselineForAI` for context.

---

## Implementation Order

1. `apps/worker/src/human-translation.ts` — types + prompt + builder + validator
2. `apps/worker/src/baseline.ts` — add `/api/baseline/translate` route
3. `apps/web/lib/baseline/getTranslation.ts` — client fetcher
4. `apps/web/app/apps/alignment/page.tsx` — consume translation instead of direct API call
5. `apps/web/app/apps/defrag/page.tsx` — add entry brief section (sidebar)
6. `apps/web/app/apps/covenant/page.tsx` — consume translation

**Do not build dashboards yet.**
**Preserve all existing auth, billing, baseline storage, Library, routes, and workspaces.**

---

## Forbidden Scope

This layer does NOT:
- Replace workspace mode
- Change auth or billing
- Change Library save/retrieve
- Change existing API routes (except adding /api/baseline/translate)
- Build dashboard pages
- Add new subscription tiers
- Change the BaselineDesignDataset computation pipeline
