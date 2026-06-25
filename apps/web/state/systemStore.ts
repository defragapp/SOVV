/**
 * systemStore.ts
 *
 * OS-level client state for Sovereign.os.
 *
 * Scope:
 * - Tracks current space (defrag | alignment | covenant)
 * - Tracks last input submitted (raw text or preset)
 * - Tracks last AI output received
 * - Tracks session continuity flag
 *
 * Does NOT replace:
 * - Server-side auth (cookie-based, handled by AuthGuard)
 * - Stripe tier state (fetched from /api/auth/tier)
 * - Baseline Design (fetched from /api/baseline)
 *
 * These remain server-authoritative. This store is UI-layer only.
 */

import { create } from "zustand"

export type OsSpace = "defrag" | "alignment" | "covenant"

export type OsInput =
  | { type: "freeform"; rawText: string; space: OsSpace; submittedAt: string }
  | { type: "preset"; selectedPreset: string; space: OsSpace; submittedAt: string }

export type OsOutput = {
  space: OsSpace
  primary: string
  secondary?: string
  meta?: string
  sections?: Array<{ label: string; value: string; highlight?: boolean }>
  receivedAt: string
}

interface SystemState {
  currentSpace: OsSpace
  lastInput: OsInput | null
  lastOutput: OsOutput | null
  initialized: boolean
  isProcessing: boolean

  setSpace: (space: OsSpace) => void
  setInput: (input: OsInput) => void
  setOutput: (output: OsOutput) => void
  setProcessing: (processing: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

export const useSystemStore = create<SystemState>((set) => ({
  currentSpace: "defrag",
  lastInput: null,
  lastOutput: null,
  initialized: false,
  isProcessing: false,

  setSpace: (space) => set({ currentSpace: space }),
  setInput: (input) => set({ lastInput: input }),
  setOutput: (output) => set({ lastOutput: output }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ lastInput: null, lastOutput: null, isProcessing: false }),
}))