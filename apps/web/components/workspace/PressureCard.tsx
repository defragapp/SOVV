import type { PressurePoint } from "./types"

const TYPE_LABELS = {
  emotional: "Emotional",
  structural: "Structural",
  communication: "Communication",
}

export default function PressureCard({ pressure }: { pressure: PressurePoint }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="block h-1.5 w-1.5 bg-[#F6F5F3]/40" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          {TYPE_LABELS[pressure.type]}
        </span>
      </div>
      <p className="mt-2 text-sm font-light text-[#F6F5F3]">{pressure.label}</p>
      <p className="mt-1 text-sm font-light leading-6 text-white/60">
        {pressure.description}
      </p>
      {pressure.yours && (
        <div className="mt-2 border-l border-[#F6F5F3]/10 pl-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            Yours
          </span>
          <p className="mt-1 text-sm font-light text-white/50">{pressure.yours}</p>
        </div>
      )}
      {pressure.theirs && (
        <div className="mt-2 border-l border-[#F6F5F3]/10 pl-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            Theirs
          </span>
          <p className="mt-1 text-sm font-light text-white/50">{pressure.theirs}</p>
        </div>
      )}
    </div>
  )
}
