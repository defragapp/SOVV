import type { PressurePoint } from "./types"

const TYPE_LABELS = {
  emotional: "Emotional Vector",
  structural: "Structural Fault",
  communication: "Comm. Breakdown",
}

export default function PressureCard({ pressure }: { pressure: PressurePoint }) {
  return (
    <div className="border border-border bg-background p-4 font-mono">
      <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
        <span className="block h-1.5 w-1.5 bg-foreground-muted" />
        <span className="text-xs uppercase tracking-widest text-foreground-muted">
          {TYPE_LABELS[pressure.type]}
        </span>
      </div>
      <p className="text-sm text-foreground">{pressure.label}</p>
      <p className="mt-2 text-sm text-foreground-disabled leading-relaxed">
        {pressure.description}
      </p>
      {pressure.yours && (
        <div className="mt-4 border-l-2 border-border pl-3">
          <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
            Internal Output
          </span>
          <p className="mt-1 text-sm text-foreground-disabled">{pressure.yours}</p>
        </div>
      )}
      {pressure.theirs && (
        <div className="mt-4 border-l-2 border-border pl-3">
          <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
            External Input
          </span>
          <p className="mt-1 text-sm text-foreground-disabled">{pressure.theirs}</p>
        </div>
      )}
    </div>
  )
}
