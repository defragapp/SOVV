import type { Insight } from "./types"

const TYPE_LABELS = {
  pattern: "Pattern",
  dynamic: "Dynamic",
  baseline: "Baseline",
}

const SOURCE_LABELS = {
  baseline: "Your data",
  comparison: "Comparison",
  conversation: "This thread",
}

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="block h-1.5 w-1.5 bg-[#F6F5F3]/40" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            {TYPE_LABELS[insight.type]}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/20">
          {SOURCE_LABELS[insight.source]}
        </span>
      </div>
      <p className="mt-2 text-sm font-light text-[#F6F5F3]">{insight.title}</p>
      <p className="mt-1 text-sm font-light leading-6 text-white/60">
        {insight.detail}
      </p>
    </div>
  )
}
