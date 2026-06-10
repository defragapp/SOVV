import type { Insight } from "./types"

const TYPE_LABELS = {
  pattern: "Pattern",
  dynamic: "Dynamic",
  baseline: "Baseline",
}

const SOURCE_LABELS = {
  baseline: "System Memory",
  comparison: "Matrix Diff",
  conversation: "Local Buffer",
}

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="border border-border bg-surface p-4 mb-4 font-mono">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span className="block h-1.5 w-1.5 bg-foreground-muted" />
          <span className="text-xs text-foreground-muted uppercase tracking-widest">
            {TYPE_LABELS[insight.type]}
          </span>
        </div>
        <span className="text-xs text-foreground-disabled uppercase tracking-widest">
          {SOURCE_LABELS[insight.source]}
        </span>
      </div>
      <p className="text-sm text-foreground">{insight.title}</p>
      <p className="mt-2 text-sm text-foreground-disabled leading-relaxed">
        {insight.detail}
      </p>
    </div>
  )
}
