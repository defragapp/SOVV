import type { Move } from "./types"

// difficulty metadata kept for internal use — not rendered to user
const _DIFFICULTY = {
  gentle: "gentle",
  moderate: "moderate",
  direct: "direct",
} as const

export default function MoveCard({ move }: { move: Move }) {
  return (
    <div className="card-flat px-5 py-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-micro text-foreground-disabled">
          Best Next Response
        </span>
      </div>
      <p className="mt-3 text-body-sm text-foreground">{move.label}</p>
      <p className="mt-1.5 text-caption">
        {move.description}
      </p>
    </div>
  )
}
