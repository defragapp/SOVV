import { journeyStages, type JourneyStageId } from "@/data/understanding"

interface JourneyHeaderProps {
  readonly active?: JourneyStageId
  readonly compact?: boolean
}

export function JourneyHeader({ active = "understanding", compact = false }: JourneyHeaderProps) {
  return (
    <div className="border border-white/[0.08] bg-white/[0.025]" style={{ borderRadius: 14 }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] overflow-hidden" style={{ borderRadius: 14 }}>
        {journeyStages.map((stage) => {
          const isActive = stage.id === active
          return (
            <div
              key={stage.id}
              className={`bg-[#0c0a0d] p-4 md:p-5 transition-colors ${isActive ? "bg-[#e0743a]/[0.055]" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-1.5 w-1.5 rounded-sm ${isActive ? "bg-[#e0743a]/70" : "bg-white/[0.14]"}`} />
                <p className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isActive ? "text-[#e0743a]/80" : "text-[#4f4b47]"}`}>
                  {stage.label}
                </p>
              </div>
              {!compact && <p className="text-[12px] leading-relaxed text-[#76716b]">{stage.description}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
