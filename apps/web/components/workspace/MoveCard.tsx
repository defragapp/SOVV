import type { Move } from "./types"

// difficulty metadata kept for internal use — not rendered to user
const _DIFFICULTY = {
  gentle: "gentle",
  moderate: "moderate",
  direct: "direct",
} as const

export default function MoveCard({ move }: { move: Move }) {
  return (
    <div className="border border-border bg-surface p-4 mb-4 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
        <span className="text-xs text-foreground-muted uppercase tracking-widest">
          Resolution Vector
        </span>
      </div>
      <p className="text-sm text-foreground">{move.label}</p>
      <p className="mt-2 text-sm text-foreground-disabled leading-relaxed">
        {move.description}
      </p>
    </div>
  )
}
