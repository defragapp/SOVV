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
