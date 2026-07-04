---
name: Baseline async compile & signal reduction
description: How the ported rich Baseline engine runs (async), its casing contract, and the single string[] reducer between frameworks and prompts
---

# Baseline async compile & signal reduction

The rich Baseline engine (ported from the archived Cloudflare worker) computes a
`BaselineDesignDataset` (`version: "baseline.v2"`) from birth data using external
services (Nominatim geocode, timeapi.io tz, JPL Horizons ephemeris, OpenAI
synthesis). This is far too slow (~seconds, ~8–12 external calls) for a synchronous
request.

## Async compile pattern
- **On save:** row goes to `baselineStatus = "pending"`, `computedProfile` = a small
  pending stub, `computedAt = null`; the HTTP response returns immediately.
- **Background job** (fire-and-forget after the response — safe in long-running Node)
  runs the compile, then writes `ready`/`failed` + the full dataset.
- **Guard against stale clobber:** before the background job writes back, it re-reads
  the row under `pg_advisory_xact_lock` and **only writes if dob/tob/pob still match**
  the data it compiled from. A newer save supersedes an older in-flight compile.
- **Status polling:** `GET /api/baseline/status` returns `{status, computedAt}` with
  `not_started` normalized to the public `none`. Frontend polls every ~3s while `pending`.

**Why:** external APIs make synchronous compile unacceptable; the guard prevents a
slow compile of old birth data from overwriting a fresh save.

## Graceful degradation (both directions)
- If any framework layer's external call fails (e.g. Horizons/geocode), the pipeline
  still produces the other frameworks + AI synthesis and returns `ready` (not `failed`).
  Astronomy simply comes back absent — do not treat a missing astronomy layer as failure.
- If the whole rich compile throws, or if there's no `OPENAI_API_KEY`, the background job
  falls back to the deterministic date-level engine (`computeBaseline`) so the user still
  gets behavioral signals rather than an empty baseline.

## Casing contract (silent-failure trap)
The compiler stores planetary **body keys/names in lowercase** (`sun`, `moon`, `mars`,
…). Any consumer that looks up bodies (e.g. active-signals timing/selection) MUST use
lowercase. TitleCase lookups (`"Sun"`, `bodies["Mars"]`) silently match nothing and
drop every astro-derived signal with no error. **Sign values stay TitleCase** ("Aries").

## Single reducer between frameworks and prompts
Everything downstream (Defrag/Alignment/Covenant) only ever sees a flat `string[]` of
behavioral lines, produced by one adapter (`deriveActiveSignalLines`). It detects the
stored shape (rich `baseline.v2` → `selectActiveSignals`; legacy profile → deterministic
reducer; else empty), and always appends the self-reported calibration lines
(`Stated core boundary`, etc.). The raw framework compute (astrology/HD/Gene Keys) must
**never** reach a prompt or the UI — it passes through the reducer first.

**Why:** keeps the product rule intact (clean behavioral signals only, no raw framework
terms exposed) and keeps route changes to a single call site.

## JPL Horizons quirks (external API, non-obvious, cost real debugging)
- **`SITE_COORD` must be quoted** (`'lng,lat,alt'`) or Horizons errors "Too many constants".
- **`START_TIME === STOP_TIME` returns ZERO ephemeris rows.** Give it a 1-day window
  (STOP = START + 24h) with `STEP_SIZE=1d`; it emits exactly one row, at START.
- **Horizons hard rate-limits concurrency.** Firing all ~11 bodies in parallel makes
  ~9/11 come back as HTTP 503 HTML error pages (fast, ~350ms). Fetch **sequentially**
  with a small gap (~150ms) + retry-on-503; all bodies then resolve in ~4s. This runs in
  the background compile so the added latency is fine.

**How to apply:** any change to the ephemeris fetch must preserve quoting, the 1-day
window, and sequential-with-gap fetching, or astronomy silently degrades to partial/empty
and the baseline drops to `degraded`.
