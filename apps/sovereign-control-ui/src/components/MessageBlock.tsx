import React from "react"
import type { Message } from "../types.ts"

interface Props {
  message: Message
}

export function MessageBlock({ message }: Props) {
  const isUser = message.role === "user"

  const blockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: isUser ? "flex-end" : "flex-start",
    gap: 4,
    maxWidth: "80%",
    alignSelf: isUser ? "flex-end" : "flex-start",
  }

  const bubbleStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 13,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    border: "1px solid",
    borderRadius: 2,
    ...(isUser
      ? { background: "#111", borderColor: "#333", color: "#f4efe9" }
      : { background: "#000", borderColor: "#1a1a1a", color: "#a8a29a" }),
  }

  const metaStyle: React.CSSProperties = {
    padding: "8px 12px",
    fontSize: 11,
    fontFamily: "ui-monospace, monospace",
    background: "#050505",
    border: "1px solid #1a1a1a",
    borderRadius: 2,
    color: "#4a9eff",
  }

  const actionStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 12,
    background: "#0a0500",
    border: "1px solid #ff6b35",
    borderRadius: 2,
    color: "#ff6b35",
  }

  const errorStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 12,
    background: "#0a0000",
    border: "1px solid #ff4444",
    borderRadius: 2,
    color: "#ff4444",
  }

  let content: React.ReactNode = <div style={bubbleStyle}>{message.content}</div>

  if (message.type === "meta" && message.meta) {
    content = (
      <div style={metaStyle}>
        <div style={{ color: "#666", marginBottom: 4 }}>
          {message.meta.tool as string || "system"}
        </div>
        <div>{message.content}</div>
        {message.meta.status === "not_enabled" && (
          <div style={{ color: "#555", marginTop: 4, fontSize: 10 }}>
            TODO: Wire integration
          </div>
        )}
      </div>
    )
  } else if (message.type === "action") {
    content = (
      <div style={actionStyle}>
        <div style={{ marginBottom: 4, fontSize: 10, letterSpacing: "0.1em" }}>
          ACTION REQUIRED
        </div>
        <div>{message.content}</div>
        {message.meta?.requiresConfirm && (
          <button style={{
            marginTop: 8, background: "#ff6b35", color: "#000", border: "none",
            padding: "4px 12px", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em",
          }}>
            CONFIRM
          </button>
        )}
      </div>
    )
  } else if (message.type === "error") {
    content = <div style={errorStyle}>{message.content}</div>
  }

  return (
    <div style={blockStyle}>
      {content}
      <span style={{ fontSize: 10, color: "#333" }}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </div>
  )
}
