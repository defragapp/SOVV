/**
 * systemStore.ts
 *
 * OS-level client state for Sovereign.os.
 *
 * Scope:
 * - Tracks current space (defrag | alignment | covenant)
 * - Tracks last input submitted (raw text or preset)
 * - Tracks last AI output received (as SystemOutput — unified contract)
 * - Tracks session continuity flag
 *
 * Does NOT replace:
 * - Server-side auth (cookie-based, handled by AuthGuard)
 * - Stripe tier state (fetched from /api/auth/tier)
 * - Baseline Design (fetched from /api/baseline)
 *
 * These remain server-authoritative. This store is UI-layer only.
 *
 * Output shape:
 * - lastOutput is now typed as SystemOutput (unified contract)
 * - All spaces write to the same output field
 * - Pages read from output.primary / output.secondary / output.meta
 */

import { create } from "zustand"
import type { SystemOutput } from "@/lib/system/outputContract"

export type OsSpace = "defrag" | "alignment" | "covenant"

export type OsInput =
  | { type: "freeform"; rawText: string; space: OsSpace; submittedAt: string }
  | { type: "preset"; selectedPreset: string; space: OsSpace; submittedAt: string }

// Re-export SystemOutput so existing imports of OsOutput still work
// via the store — pages that used OsOutput can migrate gradually
export type { SystemOutput as OsOutput } from "@/lib/system/outputContract"

interface SystemState {
  currentSpace: OsSpace
  lastInput: OsInput | null
  /** Unified output — all spaces write here via processInput */
  output: SystemOutput | null
  /** Legacy alias — points to output for backward compatibility */
  lastOutput: SystemOutput | null
  initialized: boolean
  isProcessing: boolean

  setSpace: (space: OsSpace) => void
  setInput: (input: OsInput) => void
  /** Set the unified output (preferred) */
  setOutput: (output: SystemOutput) => void
  /** Legacy alias for setOutput — kept for backward compatibility */
  setLastOutput: (output: SystemOutput) => void
  setProcessing: (processing: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

export const useSystemStore = create<SystemState>((set) => ({
  currentSpace: "defrag",
  lastInput: null,
  output: null,
  lastOutput: null,
  initialized: false,
  isProcessing: false,

  setSpace: (space) => set({ currentSpace: space }),
  setInput: (input) => set({ lastInput: input }),
  setOutput: (output) => set({ output, lastOutput: output }),
  setLastOutput: (output) => set({ output, lastOutput: output }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ lastInput: null, output: null, lastOutput: null, isProcessing: false }),
}))
