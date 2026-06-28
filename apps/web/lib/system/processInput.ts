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

  console.debug("[processInput:start]", { space, messageLength: message.length })

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
      console.debug("[processInput:end]", { ok: false, code: "needs_baseline" })
      return { ok: false, error: "needs_baseline", code: "needs_baseline" }
    }

    if (!res.ok) {
      const msg = raw.error === "daily_limit_reached"
        ? "You've reached your daily limit. Upgrade to continue."
        : (raw.message as string) || (raw.error as string) || "Something went wrong."
      console.debug("[processInput:end]", { ok: false, error: msg })
      return { ok: false, error: msg, code: raw.error as string | undefined }
    }

    let output: SystemOutput
    if (space === "defrag") {
      output = defragToSystemOutput(raw)
    } else if (space === "alignment") {
      output = alignmentToSystemOutput(raw as any)
    } else {
      output = covenantToSystemOutput(raw as any)
    }

    console.debug("[processInput:end]", { ok: true, space, primary: output.primary.slice(0, 60) })
    return { ok: true, output }

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to connect. Check your connection and try again."
    console.debug("[processInput:end]", { ok: false, error: msg })
    return { ok: false, error: msg }
  }
}
