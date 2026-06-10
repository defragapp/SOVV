import type { Shift } from "./types"

export default function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <div className="border border-border bg-surface p-4 mb-4 font-mono">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <span className="text-xs text-foreground-muted uppercase tracking-widest">
          Active Structural Shift
        </span>
      </div>
      <p className="text-sm text-foreground">{shift.label}</p>
      <p className="mt-2 text-sm text-foreground-disabled leading-relaxed">
        {shift.summary}
      </p>
    </div>
  )
}
