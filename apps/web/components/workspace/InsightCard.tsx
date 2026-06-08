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
    <div className="card-flat px-5 py-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="block h-[5px] w-[5px] rounded-full bg-white/40" />
          <span className="text-micro">
            {TYPE_LABELS[insight.type]}
          </span>
        </div>
        <span className="text-micro text-white/20">
          {SOURCE_LABELS[insight.source]}
        </span>
      </div>
      <p className="text-body-sm text-foreground">{insight.title}</p>
      <p className="mt-1.5 text-caption">
        {insight.detail}
      </p>
    </div>
  )
}
