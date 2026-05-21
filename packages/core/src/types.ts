export type Mode = "self" | "situation" | "pair" | "group";

export type Confidence =
  | "High"
  | "Medium"
  | "Low"
  | "Not enough information"
  | "Support mode";

export type ExplainRequest = {
  mode: Mode;
  question: string;
  text?: string;
  people?: string[];
};

export type ExplainResult = {
  frame: string;
  pressure: string;
  activation: string;
  rising: string;
  field: string;
  shift: string;
  opening: string;
  confidence: Exclude<Confidence, "Support mode">;
};

export type BaselineTOB = {
  type: "exact" | "approx";
  value: string;
};

export type BaselineRequest = {
  dob: string;
  tob: BaselineTOB;
  pob: string;
};

export type Baseline = BaselineRequest & {
  createdAt: number;
  updatedAt: number;
};

export type BaselineResponse = {
  baseline?: Baseline;
};

export type VideoSceneType = "messages" | "pattern" | "rewrite" | "action" | "confidence";

export type VideoScene = {
  type: VideoSceneType;
  title: string;
  text: string;
  seconds: number;
};

export type ExplainResponse =
  | {
      type: "support";
      message: string;
      resources: Array<{ label: string; link: string }>;
      confidence: "Support mode";
    }
  | {
      type: "needs_baseline";
      requestId: string;
      mode: Mode;
      plan: "free" | "pro";
      message: string;
      limits: { remainingToday: number };
    }
  | {
      type: "ok";
      requestId: string;
      mode: Mode;
      result: ExplainResult;
      chips: string[];
      audio: { title: string; script: string; format: "overview" | "two-view" | "repair" };
      video: { format: "vertical"; scenes: VideoScene[] };
      confidence: ExplainResult["confidence"];
      plan: "free" | "pro";
      limits: { remainingToday: number };
    };

export type ChipsResponse = {
  mode: Mode;
  groups: Array<{ title: string; chips: string[] }>;
};

export type BillingCheckoutResponse = {
  url: string;
};

// ─── Relational Memory Types ───

export type PatternType = "trigger" | "dynamic" | "defense" | "repetition" | "growth";

export type Pattern = {
  id: string;
  session_id: string;
  pattern_type: PatternType;
  content: string;
  source_interaction_ids: string[];
  confidence: Confidence;
  occurrence_count: number;
  first_seen: number;
  last_seen: number;
};

export type Interaction = {
  id: string;
  session_id: string;
  mode: Mode;
  question: string;
  text: string;
  people: string[];
  result: ExplainResult;
  confidence: Confidence;
  created_at: number;
};

export type PatternsResponse = {
  patterns: Pattern[];
};

export type HistoryResponse = {
  interactions: Interaction[];
};
