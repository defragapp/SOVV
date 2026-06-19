import React from "react"
import type { Thread, Mode } from "../types.ts"

const MODE_COLORS: Record<Mode, string> = {
  inspect: "#4a9eff",
  build: "#c8c2bc",
  deploy: "#ff6b35",
  creative: "#a78bfa",
}

interface Props {
  threads: Thread[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export function ThreadList({ threads, activeId, onSelect, onNew }: Props) {
  return (
    <div style={{
      width: 240, minWidth: 240, height: "100%", borderRight: "1px solid #1a1a1a",
      display: "flex", flexDirection: "column", background: "#050505",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#666" }}>
          Sovereign Control
        </span>
        <button onClick={onNew} style={{
          background: "transparent", border: "1px solid #333", color: "#888",
          padding: "3px 8px", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em",
        }}>
          + New
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            style={{
              width: "100%", textAlign: "left", background: activeId === thread.id ? "#111" : "transparent",
              border: "none", borderBottom: "1px solid #0a0a0a", padding: "10px 16px",
              cursor: "pointer", display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: MODE_COLORS[thread.mode], flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: "#c8c2bc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {thread.title}
              </span>
            </div>
            <span style={{ fontSize: 10, color: "#444", paddingLeft: 12 }}>
              {new Date(thread.updatedAt).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
