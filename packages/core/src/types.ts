// packages/core/src/types.ts

// ─── Versioning ───────────────────────────────────────────────────────────────
export const BASELINE_VERSION = 2;

// ─── Baseline ─────────────────────────────────────────────────────────────────
export interface BaselineRecord {
  _version: number;
  dob: string; // Date of Birth  — format: "YYYY-MM-DD"
  tob: string; // Time of Birth  — format: "HH:MM"
  pob: string; // Place of Birth — format: "City, Country"
}

// ─── API Request / Response ───────────────────────────────────────────────────
export interface ExplainRequest {
  userId: string;
  query: string;
}

export type ExplainResponse =
  | { type: "needs_baseline" }
  | { type: "explanation"; data: ExplainData }
  | { type: "error"; message: string; raw?: string };

export interface ExplainData {
  interpretation: string;
  aspects: string[];
}
