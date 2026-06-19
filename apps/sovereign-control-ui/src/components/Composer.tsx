import React, { useState, useRef } from "react"
import type { Mode } from "../types.ts"

const PLACEHOLDERS: Record<Mode, string> = {
  inspect: "inspect apps/worker/src/index.ts",
  build: "update apps/web/app/apps/defrag/page.tsx — change heading to...",
  deploy: "deploy sovereign-os-api",
  creative: "generate a visual concept for the Defrag entry screen",
}

interface Props {
  mode: Mode
  onSend: (text: string) => void
  disabled?: boolean
}

export function Composer({ mode, onSend, disabled }: Props) {
  const [value, setValue] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div style={{
      borderTop: "1px solid #1a1a1a",
      padding: "12px 16px",
      display: "flex",
      gap: 8,
      background: "#000",
    }}>
      <textarea
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder={PLACEHOLDERS[mode]}
        rows={2}
        disabled={disabled}
        style={{
          flex: 1, background: "#050505", border: "1px solid #1a1a1a",
          color: "#c8c2bc", padding: "10px 12px", fontSize: 13,
          fontFamily: "ui-monospace, monospace", resize: "none",
          outline: "none", borderRadius: 2,
          lineHeight: 1.5,
        }}
      />
      <button
        onClick={send}
        disabled={!value.trim() || disabled}
        style={{
          background: "transparent", border: "1px solid #c8c2bc",
          color: "#c8c2bc", padding: "0 16px", fontSize: 11,
          letterSpacing: "0.12em", textTransform: "uppercase",
          cursor: "pointer", borderRadius: 2, alignSelf: "flex-end",
          height: 36, opacity: !value.trim() || disabled ? 0.3 : 1,
        }}
      >
        Run
      </button>
    </div>
  )
}
