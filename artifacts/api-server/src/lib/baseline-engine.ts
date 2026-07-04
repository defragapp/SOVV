/**
 * Baseline Design engine.
 *
 * Derives a stable "starting map" of BEHAVIORAL SIGNALS from a user's birth data.
 * It uses birth-data-derived structure (seasonal solar position + lunar phase) as
 * deterministic *source inputs*, but the OUTPUT is always clean behavioral language.
 *
 * Product rules honoured here:
 *  - Never emit raw astrology / zodiac / horoscope terms in the output.
 *  - Treat missing birth time honestly (confidence downgrade, not fabrication).
 *  - Fully deterministic + offline (no external APIs, no secrets).
 */

export type BaselineStatus = "not_started" | "ready" | "degraded" | "failed";

export interface BaselineSignals {
  /** How this person tends to take in and metabolise what happens. */
  processingStyle: string;
  /** What they do when pressure rises. */
  pressureResponse: string;
  /** How they move back toward connection after rupture. */
  repairTendency: string;
  /** How they prefer to exchange hard things. */
  communicationMode: string;
  /** Their default posture in relationship. */
  relationalDefault: string;
  /** Their natural energy cadence. */
  energyCadence: string;
}

export interface BaselineProfile {
  status: BaselineStatus;
  /** "high" when birth time is known, "approximate" when date-only. */
  confidence: "high" | "approximate" | "none";
  /** Reduced behavioral signals — the only thing fed to AI prompts. */
  signals: BaselineSignals;
  /** Non-identifying provenance for debugging; never shown to users raw. */
  meta: {
    element: Element | null;
    modality: Modality | null;
    phase: LunarPhase | null;
    hasTime: boolean;
    note?: string;
  };
}

type Element = "fire" | "earth" | "air" | "water";
type Modality = "cardinal" | "fixed" | "mutable";
type LunarPhase = "new" | "waxing" | "full" | "waning";

// ── Source-input derivation (internal only) ──────────────────────────────────

interface SignBucket {
  element: Element;
  modality: Modality;
}

/** Maps a birth date to its seasonal solar bucket. Date-only; no location needed. */
function solarBucket(month: number, day: number): SignBucket {
  // [element, modality] by tropical sign, using conventional cusp dates.
  const ranges: Array<{ from: [number, number]; b: SignBucket }> = [
    { from: [3, 21],  b: { element: "fire",  modality: "cardinal" } }, // Aries
    { from: [4, 20],  b: { element: "earth", modality: "fixed"    } }, // Taurus
    { from: [5, 21],  b: { element: "air",   modality: "mutable"  } }, // Gemini
    { from: [6, 21],  b: { element: "water", modality: "cardinal" } }, // Cancer
    { from: [7, 23],  b: { element: "fire",  modality: "fixed"    } }, // Leo
    { from: [8, 23],  b: { element: "earth", modality: "mutable"  } }, // Virgo
    { from: [9, 23],  b: { element: "air",   modality: "cardinal" } }, // Libra
    { from: [10, 23], b: { element: "water", modality: "fixed"    } }, // Scorpio
    { from: [11, 22], b: { element: "fire",  modality: "mutable"  } }, // Sagittarius
    { from: [12, 22], b: { element: "earth", modality: "cardinal" } }, // Capricorn
    { from: [1, 20],  b: { element: "air",   modality: "fixed"    } }, // Aquarius
    { from: [2, 19],  b: { element: "water", modality: "mutable"  } }, // Pisces
  ];
  const md = month * 100 + day;
  // Walk ranges; Capricorn wraps the year boundary.
  for (let i = 0; i < ranges.length; i++) {
    const start = ranges[i]!.from;
    const end = ranges[(i + 1) % ranges.length]!.from;
    const s = start[0] * 100 + start[1];
    const e = end[0] * 100 + end[1];
    if (s <= e) {
      if (md >= s && md < e) return ranges[i]!.b;
    } else {
      // wrap (Capricorn: Dec 22 -> Jan 20)
      if (md >= s || md < e) return ranges[i]!.b;
    }
  }
  return ranges[0]!.b;
}

/** Approximate lunar phase from a UTC date. Accurate to ~1 day — enough for a bucket. */
function lunarPhase(dateUtcMs: number): LunarPhase {
  const SYNODIC = 29.53058867; // days
  const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // 2000-01-06 18:14 UTC
  const days = (dateUtcMs - KNOWN_NEW_MOON) / 86400000;
  let age = days % SYNODIC;
  if (age < 0) age += SYNODIC;
  if (age < SYNODIC * 0.03 || age > SYNODIC * 0.97) return "new";
  if (age < SYNODIC * 0.47) return "waxing";
  if (age < SYNODIC * 0.53) return "full";
  return "waning";
}

// ── Behavioral translation (source inputs -> clean signals) ───────────────────

const PROCESSING: Record<Element, string> = {
  fire:  "acts first and reflects afterward — processes by moving, not by sitting still",
  earth: "processes slowly and concretely — needs tangible steps before it feels real",
  air:   "processes by talking it through — needs to name a thing before it settles",
  water: "processes internally and emotionally — needs space alone before responding",
};

const PRESSURE: Record<Modality, string> = {
  cardinal: "pushes to resolve — initiates and drives toward a decision under pressure",
  fixed:    "digs in and holds position — resists being moved once committed",
  mutable:  "adapts and redirects — shifts to reduce friction rather than confront it",
};

const REPAIR: Record<Element, string> = {
  fire:  "repairs through direct address and a clean, quick reset",
  earth: "repairs through consistent, repeated action over time rather than words",
  air:   "repairs through conversation until mutual understanding is reached",
  water: "repairs through emotional reconnection and reassurance of the bond",
};

const COMMUNICATION: Record<Element, string> = {
  fire:  "direct and immediate — says the hard thing plainly",
  earth: "measured and practical — leads with what is workable",
  air:   "verbal and exploratory — thinks out loud and wants dialogue",
  water: "indirect and protective — hints before stating, guards the tender part",
};

const RELATIONAL: Record<Modality, string> = {
  cardinal: "takes the lead and sets the terms of connection",
  fixed:    "seeks steadiness and loyalty; slow to open, slow to leave",
  mutable:  "flexible and accommodating; bends toward the other to keep peace",
};

const CADENCE: Record<LunarPhase, string> = {
  new:    "begins quietly and builds inward before anything shows outside",
  waxing: "builds momentum outward once started; gathers energy in motion",
  full:   "runs expressive and high-visibility; feels things at full volume",
  waning: "releases and withdraws to integrate; needs recovery after output",
};

function buildSignals(bucket: SignBucket, phase: LunarPhase): BaselineSignals {
  return {
    processingStyle:   PROCESSING[bucket.element],
    pressureResponse:  PRESSURE[bucket.modality],
    repairTendency:    REPAIR[bucket.element],
    communicationMode: COMMUNICATION[bucket.element],
    relationalDefault: RELATIONAL[bucket.modality],
    energyCadence:     CADENCE[phase],
  };
}

const EMPTY_SIGNALS: BaselineSignals = {
  processingStyle: "", pressureResponse: "", repairTendency: "",
  communicationMode: "", relationalDefault: "", energyCadence: "",
};

/**
 * Compute a Baseline Design profile from raw birth data.
 * - No dob            -> not_started
 * - dob only          -> degraded (date-level signals, approximate confidence)
 * - dob + tob         -> ready (high confidence)
 * - any parse failure -> failed
 *
 * Note: place of birth (pob) is intentionally NOT an input here. It is stored
 * separately and reserved for future precision (timezone/coordinate resolution);
 * the behavioral signal tier does not depend on it, so it makes no correctness
 * claim on pob. dob/tob fully determine the current output.
 */
export function computeBaseline(input: { dob?: string; tob?: string }): BaselineProfile {
  const dob = (input.dob ?? "").trim();
  const tob = (input.tob ?? "").trim();

  if (!dob) {
    return {
      status: "not_started",
      confidence: "none",
      signals: EMPTY_SIGNALS,
      meta: { element: null, modality: null, phase: null, hasTime: false },
    };
  }

  try {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
    if (!m) throw new Error("bad dob format");
    const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);

    const bucket = solarBucket(month, day);

    // Build a UTC instant for lunar phase. If a time is given, use it; else noon.
    const hasTime = /^\d{2}:\d{2}/.test(tob);
    const [hh, mm] = hasTime ? tob.split(":").map(Number) : [12, 0];
    const instant = Date.UTC(year, month - 1, day, hh ?? 12, mm ?? 0);
    if (Number.isNaN(instant)) throw new Error("bad instant");

    const phase = lunarPhase(instant);
    const signals = buildSignals(bucket, phase);

    return {
      status: hasTime ? "ready" : "degraded",
      confidence: hasTime ? "high" : "approximate",
      signals,
      meta: {
        element: bucket.element,
        modality: bucket.modality,
        phase,
        hasTime,
        note: hasTime ? undefined : "No birth time provided — signals are date-level and approximate.",
      },
    };
  } catch (err) {
    console.error("[baseline-engine] compute failed:", err);
    return {
      status: "failed",
      confidence: "none",
      signals: EMPTY_SIGNALS,
      meta: { element: null, modality: null, phase: null, hasTime: false, note: "Computation failed." },
    };
  }
}

/**
 * Flatten a profile + optional self-reported refinements into the reduced
 * behavioral signal list injected into AI prompts. Refinements win over computed
 * signals for the same dimension. Returns [] when nothing is available.
 */
export function toActiveSignals(
  profile: BaselineProfile | null,
  refinements?: { defaultRetreat?: string; coreBoundary?: string; repairMechanic?: string } | null,
): string[] {
  const out: string[] = [];
  const s = profile?.signals;
  if (s && profile && profile.status !== "not_started" && profile.status !== "failed") {
    if (s.processingStyle)   out.push(`Processing style: ${s.processingStyle}`);
    if (s.pressureResponse)  out.push(`Under pressure: ${s.pressureResponse}`);
    if (s.repairTendency)    out.push(`Repairs by: ${s.repairTendency}`);
    if (s.communicationMode) out.push(`Communication: ${s.communicationMode}`);
    if (s.relationalDefault) out.push(`In relationship: ${s.relationalDefault}`);
    if (s.energyCadence)     out.push(`Energy cadence: ${s.energyCadence}`);
  }
  // Self-reported refinements calibrate / override.
  if (refinements?.defaultRetreat?.trim()) out.push(`Stated default retreat: ${refinements.defaultRetreat.trim()}`);
  if (refinements?.coreBoundary?.trim())   out.push(`Stated core boundary: ${refinements.coreBoundary.trim()}`);
  if (refinements?.repairMechanic?.trim()) out.push(`Stated repair mechanic: ${refinements.repairMechanic.trim()}`);
  return out;
}
