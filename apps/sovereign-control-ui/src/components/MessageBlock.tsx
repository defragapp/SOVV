import React from "react"
import type { Message } from "../types.ts"

interface Props {
  message: Message
}

export function MessageBlock({ message }: Props) {
  const isUser = message.role === "user"
  const meta = message.meta || {}

  // ── User message ──────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, maxWidth: "80%", alignSelf: "flex-end" }}>
        <div style={{ padding: "10px 14px", fontSize: 13, lineHeight: 1.6, background: "#111", border: "1px solid #333", borderRadius: 2, color: "#f4efe9", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {message.content}
        </div>
        <span style={{ fontSize: 10, color: "#333" }}>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
    )
  }

  // ── Error message ─────────────────────────────────────────────────────────
  if (message.type === "error") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "85%", alignSelf: "flex-start" }}>
        <div style={{ padding: "10px 14px", fontSize: 12, background: "#0a0000", border: "1px solid #ff4444", borderRadius: 2, color: "#ff4444", fontFamily: "ui-monospace, monospace" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.1em", marginBottom: 4, opacity: 0.7 }}>ERROR {meta.logId ? "· " + (meta.logId as string).slice(0, 8) : ""}</div>
          {message.content}
        </div>
        <span style={{ fontSize: 10, color: "#333" }}>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
    )
  }

  // ── Action required (high-risk confirm) ───────────────────────────────────
  if (message.type === "action") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "85%", alignSelf: "flex-start" }}>
        <div style={{ padding: "12px 14px", fontSize: 12, background: "#0a0500", border: "1px solid #ff6b35", borderRadius: 2, color: "#ff6b35", fontFamily: "ui-monospace, monospace" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.7 }}>HIGH RISK</span>
            {meta.risk && <span style={{ fontSize: 9, background: "#ff6b35", color: "#000", padding: "1px 6px", borderRadius: 1 }}>{meta.risk as string}</span>}
          </div>
          <div style={{ marginBottom: 8 }}>{message.content}</div>
          {meta.preview && (
            <div style={{ fontSize: 10, color: "#664422", borderTop: "1px solid #331100", paddingTop: 6, marginTop: 4 }}>
              Tool: {(meta.preview as Record<string, unknown>).tool as string} · Target: {(meta.preview as Record<string, unknown>).target as string || "—"}
            </div>
          )}
          <div style={{ fontSize: 10, color: "#664422", marginTop: 4 }}>Use the confirm bar above to proceed.</div>
        </div>
        <span style={{ fontSize: 10, color: "#333" }}>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
    )
  }

  // ── Meta / system message ─────────────────────────────────────────────────
  const status = meta.status as string || "ok"
  const statusColors: Record<string, string> = {
    ok: "#4a9eff",
    running: "#c8c2bc",
    not_enabled: "#555",
    blocked: "#ff4444",
    error: "#ff4444",
    requires_confirm: "#ff6b35",
  }
  const statusColor = statusColors[status] || "#4a9eff"

  // Format result content
  let displayContent = message.content
  if (typeof displayContent === "string" && displayContent.length > 3000) {
    displayContent = displayContent.slice(0, 3000) + "\n\n[truncated — " + displayContent.length + " chars total]"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "90%", alignSelf: "flex-start" }}>
      <div style={{ padding: "10px 14px", fontSize: 12, background: "#050505", border: "1px solid #1a1a1a", borderRadius: 2, color: "#a8a29a", fontFamily: "ui-monospace, monospace" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          {meta.tool && (
            <span style={{ fontSize: 10, color: statusColor, letterSpacing: "0.1em" }}>
              {meta.tool as string}
            </span>
          )}
          {status !== "ok" && status !== "running" && (
            <span style={{ fontSize: 9, color: statusColor, border: "1px solid", borderColor: statusColor, padding: "1px 5px", borderRadius: 1, opacity: 0.8 }}>
              {status}
            </span>
          )}
          {meta.risk && meta.risk !== "low" && (
            <span style={{ fontSize: 9, color: "#ff6b35", opacity: 0.6 }}>risk:{meta.risk as string}</span>
          )}
          {meta.logId && (
            <span style={{ fontSize: 9, color: "#333", marginLeft: "auto" }}>
              #{(meta.logId as string).slice(0, 8)}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ color: status === "not_enabled" ? "#444" : "#a8a29a", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
          {displayContent}
        </div>

        {/* Todo hint for not_enabled */}
        {status === "not_enabled" && (
          <div style={{ marginTop: 6, fontSize: 10, color: "#333", borderTop: "1px solid #111", paddingTop: 6 }}>
            TODO: Wire integration — see sovereign-control docs
          </div>
        )}
      </div>
      <span style={{ fontSize: 10, color: "#333" }}>{new Date(message.timestamp).toLocaleTimeString()}</span>
    </div>
  )
}
