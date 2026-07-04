/**
 * signals-adapter.ts — the single reducer between the rich Baseline dataset and
 * the AI prompt layer.
 *
 * The rest of the system (Defrag / Alignment / Covenant) only ever sees a flat
 * `string[]` of clean behavioral signal lines. The full framework compute
 * (astrology / Human Design / Gene Keys / numerology) NEVER reaches a prompt or
 * the UI — it passes through `selectActiveSignals` first, exactly as the original
 * Cloudflare engine intended.
 *
 * This adapter also:
 *  - handles legacy rows still holding the deterministic `BaselineProfile` shape
 *    (they keep working until the user re-saves and the richer compile runs),
 *  - always appends the user's self-reported fields as the calibration layer.
 */

import {
  selectActiveSignals,
  buildTimingSignals,
} from "./active-signals.js";
import type { BaselineDesignDataset } from "./compiler.js";
import { toActiveSignals, type BaselineProfile } from "../baseline-engine.js";

export type SignalContext = {
  message: string;
  relational: boolean;
  mode: "self" | "pair" | "group" | "situation";
};

type Refinements = {
  defaultRetreat?: string | null;
  coreBoundary?: string | null;
  repairMechanic?: string | null;
} | null;

/** Rich dataset produced by the ported compiler. */
function isRichDataset(p: unknown): p is BaselineDesignDataset {
  return (
    !!p &&
    typeof p === "object" &&
    (p as { version?: unknown }).version === "baseline.v2"
  );
}

/** Legacy deterministic profile shape (pre-port rows). */
function isLegacyProfile(p: unknown): p is BaselineProfile {
  return (
    !!p &&
    typeof p === "object" &&
    "signals" in (p as Record<string, unknown>) &&
    "status" in (p as Record<string, unknown>)
  );
}

/**
 * Reduce whatever is stored in `baselines.computedProfile` into the flat list of
 * behavioral signal lines injected into AI prompts. Returns [] when nothing
 * usable is available (callers already handle the empty case gracefully).
 */
export function deriveActiveSignalLines(
  computedProfile: unknown,
  refinements: Refinements,
  ctx: SignalContext,
): string[] {
  const out: string[] = [];

  if (isRichDataset(computedProfile) && computedProfile.status === "ready") {
    const signals = selectActiveSignals(computedProfile, ctx);
    // Natal-only timing: pass null so no live external ephemeris call blocks the
    // request. buildTimingSignals falls back to the stored natal astronomy.
    const timing = buildTimingSignals(computedProfile, null);

    if (signals.pace && signals.pace !== "unknown") out.push(`Pace: ${signals.pace}`);
    if (signals.stabilizes) out.push(`Stabilizes through: ${signals.stabilizes}`);
    if (signals.responds) out.push(`Under pressure: ${signals.responds}`);
    if (signals.protects) out.push(`Protects: ${signals.protects}`);
    if (signals.pattern) out.push(`Tendency: ${signals.pattern}`);
    for (const line of signals.traitLines) {
      if (line?.trim()) out.push(line.trim());
    }
    // Inject timing as behavioral abstraction ONLY — never the raw `timing.note`,
    // which contains framework vocabulary (e.g. "Mars retrograde", "Saturn in
    // Capricorn"). The product rule forbids framework terms reaching any prompt.
    if (timing.state === "reactive") {
      const parts: string[] = [];
      if (timing.urgency === "high") parts.push("urgency running higher than usual");
      if (timing.tolerance === "low") parts.push("tolerance for friction lower");
      if (timing.sensitivity === "high") parts.push("emotional sensitivity elevated");
      if (timing.pacing === "slow") parts.push("things moving slower than they feel");
      else if (timing.pacing === "fast") parts.push("momentum faster than usual");
      out.push(
        parts.length > 0
          ? `Current window: heightened reactivity — ${parts.join(", ")}`
          : "Current window: heightened reactivity",
      );
    }
  } else if (isLegacyProfile(computedProfile)) {
    // Legacy row — use the deterministic reducer (without refinements; appended below).
    out.push(...toActiveSignals(computedProfile, null));
  }

  // Self-reported calibration layer — always appended; explicit stated facts.
  if (refinements?.defaultRetreat?.trim()) out.push(`Stated default retreat: ${refinements.defaultRetreat.trim()}`);
  if (refinements?.coreBoundary?.trim()) out.push(`Stated core boundary: ${refinements.coreBoundary.trim()}`);
  if (refinements?.repairMechanic?.trim()) out.push(`Stated repair mechanic: ${refinements.repairMechanic.trim()}`);

  return out;
}
