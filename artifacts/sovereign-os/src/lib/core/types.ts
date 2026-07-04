// packages/core/src/types.ts

// ─── Versioning ───────────────────────────────────────────────────────────────
export const BASELINE_VERSION = 2;

// ─── Domain Types ─────────────────────────────────────────────────────────────
export type Mode = "self" | "situation" | "pair" | "group";
export type Relation = "self" | "partner" | "family" | "friend" | "colleague";

// ─── Baseline ─────────────────────────────────────────────────────────────────
export interface BaselineTob {
  type: "exact" | "approx";
  value: string;
}

export interface BaselineRequest {
  dob: string;
  tob: BaselineTob;
  pob: string;
}

export interface Baseline extends BaselineRequest {
  _version: number;
  createdAt: number;
  updatedAt: number;
}

// ─── API Request / Response ───────────────────────────────────────────────────
export interface ExplainRequest {
  message: string;
  target?: {
    id: string;
    relation: Relation;
  };
}

export interface Shift {
  label: string;
  summary: string;
}

export interface PressurePoint {
  type: "emotional" | "structural" | "communication";
  label: string;
  description: string;
  yours?: string;
  theirs?: string;
}

export interface Move {
  label: string;
  description: string;
  difficulty: "gentle" | "moderate" | "direct";
}

export interface Insight {
  id: string;
  type: "pattern" | "dynamic" | "baseline";
  title: string;
  detail: string;
  source: "baseline" | "comparison" | "conversation";
}

export interface ThreadMeta {
  target_id?: string;
  target_relation?: Relation;
  baseline_loaded: boolean;
  target_baseline_loaded?: boolean;
}

export interface ExplainResponse {
  response: string;
  shift: Shift;
  pressure_points?: PressurePoint[];
  move: Move;
  insights: Insight[];
  thread_meta: ThreadMeta;
}

export interface Person {
  id: string;
  name: string;
  relation: Relation;
  avatar?: string;
}

export interface ThreadMessage {
  id: string;
  role: "user" | "sovereign";
  content: string;
  shift?: Shift;
  move?: Move;
  insights?: Insight[];
  pressure_points?: PressurePoint[];
  timestamp: number;
}

export type Tier = "free" | "pro";

export interface ChipsResponse {
  mode: Mode;
  groups: Array<{ title: string; chips: string[] }>;
}

export type Confidence = "High" | "Medium" | "Low" | "Not enough information";

export interface Interaction {
  id: string;
  session_id: string;
  mode: string;
  question: string;
  text: string;
  people: Array<{ id: string; relation?: Relation; name?: string }>;
  result: Record<string, unknown>;
  confidence: Confidence;
  created_at: number;
}

export type PatternType = "trigger" | "dynamic" | "defense" | "repetition" | "growth";

export interface Pattern {
  id: string;
  session_id: string;
  pattern_type: PatternType;
  content: string;
  source_interaction_ids: string[];
  confidence: "High" | "Medium" | "Low";
  occurrence_count: number;
  first_seen: number;
  last_seen: number;
  verified: number;
}

// ─── Space Output Types (1:1 with prompts.ts output contracts) ───────────────
// These types are the canonical output schemas for each space.
// UI components must render directly from these — no transformation logic.
// Keep in sync with: apps/worker/src/prompts.ts output contracts

export interface DefragOutput {
  summary: string;
  activePattern: string;
  theRepeat: string;
  oldRole: string;
  whatYouLearnedToCarry: string;
  strainPattern: string;
  giftUnderStrain: string;
  alignment: string;
  bestNextResponse: {
    summary: string;
    phrasing?: string[];
  };
  conversationalSteering: {
    do: string[];
    avoid: string[];
  };
}

export interface AlignmentOutput {
  skyContext: string;
  whatIsTrue: string;
  whatIsYours: string;
  whatIsNotYours: string;
  theShift: string;
  nextStep: string;
  avoid: string;
  alignment: string;
}

export interface CovenantOutput {
  figure: string;
  reference: string;
  pattern: string;
  story: string;
  whatBroke: string;
  howGodMet: string;
  whatTheyLearned: string;
  forYou: string;
  nextStep: string;
  scriptures: string[];
  reflectionPrompts: string[];
}






export interface LibraryItem {
  id: string;
  user_id: string;
  workspace_source: "DEFRAG" | "COVENANT" | "ALIGNMENT";
  title?: string;
  payload: DefragOutput | AlignmentOutput | CovenantOutput | DefragPayload | CovenantPayload;
  is_public: number;
  created_at: string;
}

// ─── Active Signal System Types ───────────────────────────────────────────────
// Shared between worker and web for rail/signature rendering.
// Keep in sync with: apps/worker/src/active-signals.ts
//
// CRITICAL SYSTEM RULE:
// Full baseline compute is never used directly in prompts or UI.
// All reasoning must pass through the active signal selection layer.

/** Compressed identity signature — shown once, bottom of result surface only.
 *  Token order is locked: HD → TYPE → AUTH → GK → RIS → NOD */
export interface BaselineSignature {
  line: string;
  tokens: Array<{ key: string; value: string }>;
}

/** Reduced behavioral signals — context-aware subset of full compute. */
export interface ActiveBaselineSignals {
  pace: "fast" | "slow" | "variable" | "unknown";
  stabilizes: string;
  responds: string;
  protects?: string;
  pattern?: string;
  evidenceTags: string[];
  traitLines: string[];
}

/** Timing signals — urgency/sensitivity/tolerance from current sky. */
export interface TimingSignals {
  urgency: "low" | "moderate" | "high";
  sensitivity: "low" | "moderate" | "high";
  tolerance: "low" | "moderate" | "high";
  pacing: "fast" | "slow" | "normal";
  state: "stable" | "reactive";
  note?: string;
}

/** Overlay signals — what forms between two people */
export interface OverlaySignals {
  loop: string;
  amplifier: string;
  shift: string;
}

/** Default rail data — quiet, compressed, factual */
export interface RailData {
  baseline: { pace: string; stabilizes: string; responds: string };
  sky: { urgency: string; tolerance: string; state?: string };
  pattern: { loop: string };
}

/** Expanded rail data — opt-in, shows both users */
export interface RailDataExpanded {
  users: Array<{
    role: "you" | "them";
    signature?: BaselineSignature;
    signals: ActiveBaselineSignals;
  }>;
  timing: TimingSignals;
  pattern: OverlaySignals;
}

/** Export payload — human-readable, no raw compute */
export interface ExportPayload {
  result: Record<string, unknown>;
  patternSummary: string;
  timingState: string;
  reducedSignals: ActiveBaselineSignals;
  signature: string;
}

// Also restore missing CovenantPayload and DefragPayload definitions
export interface DefragPayload {
  active_now: string;
  the_repeat: string;
  old_role: string;
  what_you_learned_to_carry: string;
  strain_pattern: string;
  gift_under_strain: string;
  alignment: string;
  best_next_response: string;
}

export interface CovenantPayload {
  [key: string]: unknown;
}
