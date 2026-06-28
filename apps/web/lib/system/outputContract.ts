/**
 * outputContract.ts
 *
 * Unified output contract for Sovereign.os.
 * Built on top of @sovereign/core types — no duplication.
 *
 * All three Spaces produce SystemOutput.
 * Pages read from primary / secondary / meta.
 */

import type { AlignmentOutput, CovenantOutput } from "@sovereign/core"

// ── Core output shape ─────────────────────────────────────────────────────────

export type SystemOutput = {
  /** The primary insight — the one thing the user needs to see */
  primary: string
  /** Supporting context */
  secondary?: string
  /** Space-specific fields (full API response) */
  meta?: Record<string, unknown>
  /** Which space produced this output */
  space: "defrag" | "alignment" | "covenant"
  /** ISO timestamp */
  receivedAt: string
}

// ── Adapters ──────────────────────────────────────────────────────────────────

export function defragToSystemOutput(raw: Record<string, unknown>): SystemOutput {
  return {
    primary: (raw.activePattern as string) || (raw.summary as string) || "",
    secondary: (raw.alignment as string) || undefined,
    meta: raw,
    space: "defrag",
    receivedAt: new Date().toISOString(),
  }
}

export function alignmentToSystemOutput(raw: AlignmentOutput): SystemOutput {
  return {
    primary: raw.whatIsYours || raw.whatIsTrue || "",
    secondary: raw.theShift || undefined,
    meta: raw as unknown as Record<string, unknown>,
    space: "alignment",
    receivedAt: new Date().toISOString(),
  }
}

export function covenantToSystemOutput(raw: CovenantOutput): SystemOutput {
  return {
    primary: (raw as any).forYou || raw.pattern || "",
    secondary: raw.story || undefined,
    meta: raw as unknown as Record<string, unknown>,
    space: "covenant",
    receivedAt: new Date().toISOString(),
  }
}
