"use client"

import type { ThreadMessage } from "./types"
import ShiftCard from "./ShiftCard"
import PressureCard from "./PressureCard"
import InsightCard from "./InsightCard"
import MoveCard from "./MoveCard"

export default function ContextPanel({
  activeMessage,
}: {
  activeMessage: ThreadMessage | null
}) {
  if (!activeMessage || activeMessage.role === "user") {
    return (
      <aside className="flex h-full flex-col bg-black">
        <div className="flex h-10 shrink-0 items-center border-b border-[#F6F5F3]/10 px-4">
          
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-black">
      <div className="flex h-10 shrink-0 items-center border-b border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">
          What's Happening
        </span>
      </div>
      <div className="flex flex-col divide-y divide-[#F6F5F3]/10">
        {activeMessage.shift && <ShiftCard shift={activeMessage.shift} />}
        {activeMessage.pressure_points?.map((pp, i) => (
          <PressureCard key={i} pressure={pp} />
        ))}
        {activeMessage.insights?.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
        {activeMessage.move && <MoveCard move={activeMessage.move} />}
      </div>
    </aside>
  )
}
