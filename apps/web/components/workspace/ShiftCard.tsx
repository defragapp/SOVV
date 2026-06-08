import type { Shift } from "./types"

export default function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <div className="card-flat px-5 py-4 mb-4">
      <span className="block text-micro text-foreground-disabled">
        Active pattern
      </span>
      <p className="mt-3 text-body-sm text-foreground">{shift.label}</p>
      <p className="mt-1.5 text-caption">
        {shift.summary}
      </p>
    </div>
  )
}