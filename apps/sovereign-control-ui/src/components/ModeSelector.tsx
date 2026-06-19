import React from "react"
import type { Mode } from "../types.ts"

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "inspect", label: "Inspect", desc: "Read repo, routes, live URLs" },
  { id: "build", label: "Build", desc: "Create and modify files" },
  { id: "deploy", label: "Deploy", desc: "Deploy and rollback Workers" },
  { id: "creative", label: "Creative", desc: "Visual and media review" },
]

interface Props {
  active: Mode
  onChange: (mode: Mode) => void
}

export function ModeSelector({ active, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 1, padding: "8px 16px", borderBottom: "1px solid #1a1a1a" }}>
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          title={m.desc}
          style={{
            background: active === m.id ? "#111" : "transparent",
            border: "1px solid",
            borderColor: active === m.id ? "#333" : "transparent",
            color: active === m.id ? "#c8c2bc" : "#444",
            padding: "4px 12px",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 2,
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
