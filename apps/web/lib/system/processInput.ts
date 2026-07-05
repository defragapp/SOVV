/**
 * processInput.ts
 *
 * Single pipeline entry point for all user input across Sovereign.os.
 * Wraps lib/api.ts fetch calls and normalizes to SystemOutput.
 *
 * Usage:
 *   const result = await processInput({ space: "defrag", message: input })
 *   if (result.ok) { // result.output is SystemOutput }
 */

import type { SystemOutput } from "./outputContract"
import { defragToSystemOutput, alignmentToSystemOutput, covenantToSystemOutput } from "./outputContract"

export type ProcessInputOptions = {
  space: "defrag" | "alignment" | "covenant"
  message: string
  target?: { id: string; relation: string }
  context?: Record<string, unknown>
}

export type ProcessInputResult =
  | { ok: true; output: SystemOutput }
  | { ok: false; error: string; code?: string }

const ENDPOINT: Record<string, string> = {
  defrag: "/api/explain",
  alignment: "/api/alignment",
  covenant: "/api/covenant",
}

export async function processInput(options: ProcessInputOptions): Promise<ProcessInputResult> {
  const { space, message, target, context } = options


  try {
    const body: Record<string, unknown> = { message, ...context }
    if (target) body.target = target

    const res = await fetch(ENDPOINT[space]!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })

    const raw = await res.json() as Record<string, unknown>

    if (raw.type === "needs_baseline") {
      return { ok: false, error: "needs_baseline", code: "needs_baseline" }
    }

    if (!res.ok) {
      const code = raw.error as string | undefined
      const msg = code === "daily_limit_reached"
        ? "You've reached your daily limit. Upgrade to continue."
        : code === "subscription_required" || code === "rate_limit_exceeded"
        ? (raw.message as string) || code
        : (raw.message as string) || code || "Something went wrong."
      return { ok: false, error: msg, code }
    }

    let output: SystemOutput
    if (space === "defrag") {
      output = defragToSystemOutput(raw)
    } else if (space === "alignment") {
      output = alignmentToSystemOutput(raw as any)
    } else {
      output = covenantToSystemOutput(raw as any)
    }

    return { ok: true, output }

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to connect. Check your connection and try again."
    return { ok: false, error: msg }
  }
}
