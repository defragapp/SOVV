import type { Shift } from "./types"

export default function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <div className="px-4 py-4">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-white/30">
        Shift
      </span>
      <p className="mt-2 text-sm font-light text-[#F6F5F3]">{shift.label}</p>
      <p className="mt-1 text-sm font-light leading-6 text-white/60">
        {shift.summary}
      </p>
    </div>
  )
}
