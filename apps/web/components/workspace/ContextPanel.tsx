"use client"

import { useState } from "react"
import type { ThreadMessage } from "./types"
import ShiftCard from "./ShiftCard"
import PressureCard from "./PressureCard"
import InsightCard from "./InsightCard"
import MoveCard from "./MoveCard"

function WhyThisAnswer({ message }: { message: ThreadMessage }) {
  const [open, setOpen] = useState(false)
  const meta = message.thread_meta

  if (!meta) return null

  return (
    <div className="border-t border-[#F6F5F3]/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
          Why this answer?
        </span>
        <span className="font-mono text-[9px] text-white/20">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          <SourceRow label="Your Baseline Design" active={meta.baseline_loaded} />
          <SourceRow label="The sky over you" active={false} note="not available" />
          <SourceRow
            label="Selected people"
            active={Boolean(meta.target_id)}
            note={meta.target_relation ?? undefined}
          />
          <SourceRow label="Notebook context" active={false} note="not available" />
          <SourceRow
            label="Prior loops"
            active={Boolean(message.insights?.some((i) => i.source === "conversation"))}
          />
          {message.insights && message.insights.length > 0 && (
            <div className="pt-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">
                Confidence
              </span>
              <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-white/35">
                {message.insights.length >= 3 ? "High" : message.insights.length >= 1 ? "Medium" : "Low"}
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
      <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
        {label}
      </span>
      <span
        className={`font-mono text-[9px] uppercase tracking-widest ${
          active ? "text-white/50" : "text-white/15"
        }`}
      >
        {note ?? (active ? "used" : "not available")}
      </span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col px-4 py-8 gap-4">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/20 mb-3">
          Right Now
        </p>
        <p className="text-sm font-light text-white/30 leading-6">
          Nothing is lit up yet.
        </p>
        <p className="mt-2 text-sm font-light text-white/20 leading-6">
          Start by telling DEFRAG what is going on. Once the thread has context, Right Now will show the loop, the twist, and the Best Next Response.
        </p>
      </div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-white/15 mt-2">
        This view shows what is active from your Baseline Design and current thread.
      </p>
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
    <aside className="flex h-full flex-col bg-black overflow-y-auto">
      {!hideHeader && (
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#F6F5F3]/10 px-4">
          <span className="font-mono text-xs uppercase tracking-widest text-white/40">
            Right Now
          </span>
          {hasContent && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">
              What got lit up
            </span>
          )}
        </div>
      )}

      {!hasContent ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col divide-y divide-[#F6F5F3]/10">

          {/* What got lit up — Shift */}
          {activeMessage.shift && (
            <ShiftCard shift={activeMessage.shift} />
          )}

          {/* The Loop — Insights tagged as pattern */}
          {activeMessage.insights
            ?.filter((i) => i.type === "pattern")
            .map((insight) => (
              <div key={insight.id} className="px-4 py-4">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
                  The Loop
                </span>
                <p className="text-sm font-light text-[#F6F5F3]">{insight.title}</p>
                <p className="mt-1 text-sm font-light leading-6 text-white/60">{insight.detail}</p>
              </div>
            ))}

          {/* The Twist — Pressure points */}
          {activeMessage.pressure_points?.map((pp, i) => (
            <div key={i} className="px-4 py-4">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
                The Twist
              </span>
              <PressureCard pressure={pp} />
            </div>
          ))}

          {/* Your Strength — Insights tagged as baseline or dynamic */}
          {activeMessage.insights
            ?.filter((i) => i.type === "baseline" || i.type === "dynamic")
            .map((insight) => (
              <div key={insight.id} className="px-4 py-4">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
                  Your Strength
                </span>
                <p className="text-sm font-light text-[#F6F5F3]">{insight.title}</p>
                <p className="mt-1 text-sm font-light leading-6 text-white/60">{insight.detail}</p>
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
    </aside>
  )
}