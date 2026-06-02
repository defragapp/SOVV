import type { Move } from "./types"

// difficulty metadata kept for internal use — not rendered to user
const _DIFFICULTY = {
  gentle: "gentle",
  moderate: "moderate",
  direct: "direct",
} as const

export default function MoveCard({ move }: { move: Move }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          Best Next Response
        </span>
      </div>
      <p className="mt-2 text-sm font-light text-[#F6F5F3]">{move.label}</p>
      <p className="mt-1 text-sm font-light leading-6 text-white/60">
        {move.description}
      </p>
    </div>
  )
}
