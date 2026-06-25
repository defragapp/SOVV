/**
 * processInput.ts
 *
 * The single pipeline entry point for all user input across Sovereign.os.
 *
 * Before this file:
 *   Each page owned its own fetch → parse → setState logic.
 *   Defrag, Alignment, and Covenant each had different submission paths.
 *
 * After this file:
 *   All input passes through processInput().
 *   Pages become views — they call processInput, receive SystemOutput.
 *   The system is controllable from one place.
 *
 * Current state: passthrough (no logic change yet).
 * Next phase: real pipeline logic lives here.
 */

import type { SystemOutput } from "./outputContract"
import { defragToSystemOutput, alignmentToSystemOutput, covenantToSystemOutput } from "./outputContract"

export type ProcessInputOptions = {
  space: "defrag" | "alignment" | "covenant"
  message: string
  /** Optional: relational comparison target */
  target?: { id: string; relation: string }
  /** Optional: additional context */
  context?: Record<string, unknown>
}

export type ProcessInputResult =
  | { ok: true; output: SystemOutput }
  | { ok: false; error: string; code?: string }

/**
 * Process user input through the Sovereign.os pipeline.
 *
 * This is the single entry point for all space submissions.
 * It calls the appropriate API, normalizes the response into
 * SystemOutput, and returns a typed result.
 *
 * Usage:
 *   const result = await processInput({ space: "defrag", message: input })
 *   if (result.ok) {
 *     // result.output is SystemOutput
 *   }
 */
export async function processInput(options: ProcessInputOptions): Promise<ProcessInputResult> {
  const { space, message, target, context } = options

  console.debug("[processInput:start]", { space, messageLength: message.length })

  const endpoint = `/api/${space}`

  try {
    const body: Record<string, unknown> = { message, ...context }
    if (target) body.target = target

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })

    const raw = await res.json() as Record<string, unknown>

    // Handle known error codes
    if (raw.type === "needs_baseline") {
      console.debug("[processInput:end]", { ok: false, code: "needs_baseline" })
      return { ok: false, error: "needs_baseline", code: "needs_baseline" }
    }

    if (!res.ok) {
      const errorMsg = (raw.error === "daily_limit_reached")
        ? "You've reached your daily limit. Upgrade to continue."
        : (raw.message as string) || (raw.error as string) || "Something went wrong."
      console.debug("[processInput:end]", { ok: false, error: errorMsg })
      return { ok: false, error: errorMsg, code: raw.error as string | undefined }
    }

    // Normalize to SystemOutput
    let output: SystemOutput
    if (space === "defrag") {
      output = defragToSystemOutput(raw)
    } else if (space === "alignment") {
      output = alignmentToSystemOutput(raw)
    } else {
      output = covenantToSystemOutput(raw)
    }

    console.debug("[processInput:end]", { ok: true, space, primary: output.primary.slice(0, 60) })
    return { ok: true, output }

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to connect. Check your connection and try again."
    console.debug("[processInput:end]", { ok: false, error: message })
    return { ok: false, error: message }
  }
}
