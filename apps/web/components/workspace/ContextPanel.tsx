"use client"

import { useState } from "react"
import type { ThreadMessage } from "./types"
import ShiftCard from "./ShiftCard"
import PressureCard from "./PressureCard"
import InsightCard from "./InsightCard"
import MoveCard from "./MoveCard"

function WhyThisAnswer({ message }: { message: ThreadMessage }) {
  const [open, setOpen] = useState(false)
  const meta = (message as any).thread_meta

  if (!meta) return null

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left border-transparent hover:bg-background transition-colors"
      >
        <span className="font-mono text-xs text-foreground-muted uppercase tracking-widest">
          Telemetry Details
        </span>
        <span className="font-mono text-xs text-foreground-muted">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-3 font-mono text-xs">
          <SourceRow label="System Blueprint" active={meta.baseline_loaded} />
          <SourceRow label="Global Environment" active={false} note="offline" />
          <SourceRow
            label="Target Node"
            active={Boolean(meta.target_id)}
            note={meta.target_relation ?? undefined}
          />
          <SourceRow label="Local Storage" active={false} note="offline" />
          <SourceRow
            label="Historical Loops"
            active={Boolean(message.insights?.some((i) => i.source === "conversation"))}
          />
          {message.insights && message.insights.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
              <span className="text-foreground-disabled">
                Confidence Rating
              </span>
              <span className="text-foreground">
                {message.insights.length >= 3 ? "0.98" : message.insights.length >= 1 ? "0.64" : "0.22"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SourceRow({
  label,
  active,
  note,
}: {
  label: string
  active: boolean
  note?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground-disabled">
        {label}
      </span>
      <span
        className={`tracking-widest ${
          active ? "text-foreground-muted" : "text-foreground-disabled"
        }`}
      >
        {note ?? (active ? "online" : "offline")}
      </span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-4 font-mono">
      <div>
        <p className="text-xs uppercase tracking-widest text-foreground-muted mb-4">
          Inspector::Idle
        </p>
        <p className="text-sm text-foreground-disabled leading-relaxed">
          System awaiting relational data input.
        </p>
        <p className="mt-4 text-sm text-foreground-disabled leading-relaxed">
          Provide contextual variables in the primary thread to generate loop analysis, structural shifts, and conflict resolution vectors.
        </p>
      </div>
    </div>
  )
}

export default function ContextPanel({
  activeMessage,
  hideHeader = false,
}: {
  activeMessage: ThreadMessage | null
  hideHeader?: boolean
}) {
  const hasContent = activeMessage && activeMessage.role === "sovereign"

  return (
    <div className="flex h-full flex-col bg-surface font-mono">
      {!hideHeader && (
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
          <span className="text-sm text-foreground">
            Data Inspector
          </span>
          {hasContent && (
            <span className="text-xs text-foreground-muted uppercase tracking-widest">
              Active Stream
            </span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!hasContent ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col divide-y divide-border">

            {/* Active pattern — Shift */}
            {activeMessage.shift && (
              <ShiftCard shift={activeMessage.shift} />
            )}

            {/* The Loop — Insights tagged as pattern */}
            {activeMessage.insights
              ?.filter((i) => i.type === "pattern")
              .map((insight) => (
                <div key={insight.id} className="px-6 py-6">
                  <span className="block text-xs uppercase tracking-widest text-foreground-muted mb-3">
                    Structural Loop Detected
                  </span>
                  <p className="text-sm text-foreground">{insight.title}</p>
                  <p className="mt-2 text-sm text-foreground-disabled leading-relaxed">{insight.detail}</p>
                </div>
              ))}

            {/* The Twist — Pressure points */}
            {activeMessage.pressure_points?.map((pp, i) => (
              <div key={i} className="px-6 py-6">
                <span className="block text-xs uppercase tracking-widest text-foreground-muted mb-3">
                  Pressure Node
                </span>
                <PressureCard pressure={pp} />
              </div>
            ))}

            {/* Your Strength — Insights tagged as baseline or dynamic */}
            {activeMessage.insights
              ?.filter((i) => i.type === "baseline" || i.type === "dynamic")
              .map((insight) => (
                <div key={insight.id} className="px-6 py-6">
                  <span className="block text-xs uppercase tracking-widest text-foreground-muted mb-3">
                    Verified Baseline Vector
                  </span>
                  <p className="text-sm text-foreground">{insight.title}</p>
                  <p className="mt-2 text-sm text-foreground-disabled leading-relaxed">{insight.detail}</p>
                </div>
              ))}

            {/* Best Next Response — Move */}
            {activeMessage.move && (
              <MoveCard move={activeMessage.move} />
            )}

            {/* Why this answer? */}
            <WhyThisAnswer message={activeMessage} />

          </div>
        )}
      </div>
    </div>
  )
}
