

/**
 * OsOutput
 *
 * Primary output renderer for Sovereign.os.
 * Reads from SystemOutput (primary, secondary, meta).
 * Streams primary text word-by-word via useStreamText.
 *
 * Replaces ResultCard as the main result surface.
 * ResultCard is kept for save/audio/invite actions (passed as children or props).
 */

import * as React from "react"
import { useStreamText } from "@/lib/system/streamText"
import type { SystemOutput } from "@/lib/system/outputContract"

// ── Types ─────────────────────────────────────────────────────────────────────

interface OsOutputProps {
  output: SystemOutput
  /** Optional: show save/audio/invite actions below the output */
  actions?: React.ReactNode
  /** Optional: show rail data (baseline signals) */
  rail?: {
    baseline?: { pace?: string; stabilizes?: string; responds?: string }
    sky?: { urgency?: string; tolerance?: string; state?: string }
    pattern?: { loop?: string }
  }
  /** Optional: show flow suggestion */
  flow?: { nextSpace?: string; urgency?: string }
  /** Optional: show sources used */
  sourcesUsed?: { baseline?: boolean; history?: boolean }
  /** Optional: compact mode (no rail, no sources) */
  compact?: boolean
}

// ── Space label map ───────────────────────────────────────────────────────────

const SPACE_LABEL: Record<string, string> = {
  defrag: "Defrag",
  alignment: "Alignment",
  covenant: "Covenant",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OsOutput({
  output,
  actions,
  rail,
  flow,
  sourcesUsed,
  compact = false,
}: OsOutputProps) {
  const streamedPrimary = useStreamText(output.primary, output.receivedAt)
  const isStreaming = streamedPrimary.length < output.primary.length

  return (
    <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden" style={{ borderRadius: 10 }}>

      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
          {SPACE_LABEL[output.space] ?? output.space}
        </span>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="w-1 h-1 rounded-full bg-[#c8c2bc]/40 animate-pulse" />
          )}
          <span className="font-mono text-[9px] text-[#4f4b47]">
            {new Date(output.receivedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Primary output — streams word by word */}
      <div className="px-5 py-5">
        <p className="text-[15px] text-[#f4efe9] leading-[1.75]">
          {streamedPrimary}
          {isStreaming && <span className="inline-block w-0.5 h-4 bg-[#c8c2bc]/40 ml-0.5 animate-pulse align-middle" />}
        </p>

        {/* Secondary — shown after streaming completes */}
        {!isStreaming && output.secondary && (
          <p className="mt-4 text-[13px] text-[#a8a29a] leading-relaxed">
            {output.secondary}
          </p>
        )}
      </div>

      {/* Rail data — baseline signals */}
      {!compact && rail && !isStreaming && (
        <div className="border-t border-white/[0.05] px-5 py-4 grid grid-cols-3 gap-4">
          {rail.baseline?.pace && (
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47] mb-1">Pace</p>
              <p className="text-[12px] text-[#76716b]">{rail.baseline.pace}</p>
            </div>
          )}
          {rail.sky?.urgency && (
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47] mb-1">Urgency</p>
              <p className="text-[12px] text-[#76716b]">{rail.sky.urgency}</p>
            </div>
          )}
          {rail.sky?.state && (
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47] mb-1">State</p>
              <p className="text-[12px] text-[#76716b]">{rail.sky.state}</p>
            </div>
          )}
        </div>
      )}

      {/* Flow suggestion */}
      {!compact && flow?.nextSpace && !isStreaming && (
        <div className="border-t border-white/[0.05] px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-[12px] text-[#76716b] leading-snug">
            {flow.nextSpace === "ALIGNMENT"
              ? "Alignment separates what is yours to carry from what isn't."
              : "Covenant finds the story that fits this moment."}
          </p>
          <a
            href={`/apps/${flow.nextSpace.toLowerCase()}/workspace`}
            className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-3 py-2 hover:border-white/[0.16]"
            style={{ borderRadius: 6 }}
          >
            Open {flow.nextSpace === "ALIGNMENT" ? "Alignment" : "Covenant"} →
          </a>
        </div>
      )}

      {/* Sources used */}
      {!compact && sourcesUsed && !isStreaming && (
        <div className="border-t border-white/[0.05] px-5 py-3 flex items-center gap-3">
          {sourcesUsed.baseline && (
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47]">
              Baseline active
            </span>
          )}
          {sourcesUsed.history && (
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47]">
              · Past patterns used
            </span>
          )}
        </div>
      )}

      {/* Actions slot (save, audio, invite) */}
      {actions && !isStreaming && (
        <div className="border-t border-white/[0.05]">
          {actions}
        </div>
      )}
    </div>
  )
}

export default OsOutput
