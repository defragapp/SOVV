import React, { useState, useRef, useEffect } from "react"
import { ThreadList } from "./components/ThreadList.tsx"
import { MessageBlock } from "./components/MessageBlock.tsx"
import { Composer } from "./components/Composer.tsx"
import { ModeSelector } from "./components/ModeSelector.tsx"
import { MOCK_THREADS } from "./data/mockThreads.ts"
import type { Thread, Message, Mode, ActionRequest, ActionResponse } from "./types.ts"

const API_BASE = "/api" // proxied to sovereign-control in dev

async function callAction(req: ActionRequest): Promise<ActionResponse> {
  // TODO: Wire to sovereign-control /api/action
  // For now, return a mock response
  return {
    success: false,
    status: "not_enabled",
    message: `Tool ${req.tool} not yet wired to sovereign-control backend`,
    risk: "low",
    requiresConfirm: false,
  }
}

function parseCommand(text: string): ActionRequest {
  const lower = text.toLowerCase().trim()
  if (lower.startsWith("inspect ") || lower.startsWith("read ")) {
    const path = text.split(" ").slice(1).join(" ")
    if (path.startsWith("http")) {
      return { type: "inspect", tool: "inspect_live_url", payload: { url: path } }
    }
    return { type: "inspect", tool: "inspect_repo", payload: { path } }
  }
  if (lower.startsWith("screenshot ")) {
    const url = text.split(" ").slice(1).join(" ")
    return { type: "inspect", tool: "capture_screenshot", payload: { url } }
  }
  if (lower.startsWith("deploy ")) {
    const workerName = text.split(" ").slice(1).join(" ")
    return { type: "deploy", tool: "deploy_worker", payload: { workerName } }
  }
  if (lower.startsWith("rollback ")) {
    const workerName = text.split(" ").slice(1).join(" ")
    return { type: "rollback", tool: "rollback_worker", payload: { workerName } }
  }
  return { type: "inspect", tool: "inspect_repo", payload: { path: text } }
}

export default function App() {
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS)
  const [activeId, setActiveId] = useState<string | null>(MOCK_THREADS[0]?.id || null)
  const [mode, setMode] = useState<Mode>("inspect")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeThread = threads.find(t => t.id === activeId) || null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeThread?.messages.length])

  const addMessage = (threadId: string, msg: Omit<Message, "id" | "timestamp">) => {
    const full: Message = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }
    setThreads(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, messages: [...t.messages, full], updatedAt: full.timestamp }
        : t
    ))
    return full
  }

  const handleSend = async (text: string) => {
    if (!activeId || loading) return
    setLoading(true)

    addMessage(activeId, { role: "user", type: "text", content: text })

    const req = parseCommand(text)
    addMessage(activeId, {
      role: "assistant", type: "meta",
      content: `Running ${req.tool}...`,
      meta: { tool: req.tool, status: "running" },
    })

    try {
      const res = await callAction(req)
      addMessage(activeId, {
        role: "assistant",
        type: res.requiresConfirm ? "action" : res.success ? "meta" : "meta",
        content: res.message,
        meta: { tool: req.tool, status: res.status, risk: res.risk, result: res.result, requiresConfirm: res.requiresConfirm },
      })
    } catch (err) {
      addMessage(activeId, { role: "assistant", type: "error", content: String(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const thread: Thread = {
      id, title: "New thread", mode,
      messages: [], createdAt: now, updatedAt: now,
    }
    setThreads(prev => [thread, ...prev])
    setActiveId(id)
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#000" }}>
      {/* Thread list */}
      <ThreadList
        threads={threads}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
      />

      {/* Main panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          height: 44, borderBottom: "1px solid #1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
        }}>
          <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {activeThread?.title || "No thread selected"}
          </span>
          <span style={{ fontSize: 10, color: "#333" }}>
            sovereign-control · operator.defrag.app
          </span>
        </div>

        {/* Mode selector */}
        <ModeSelector active={mode} onChange={setMode} />

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {activeThread?.messages.length === 0 && (
            <div style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 40 }}>
              Start a thread. Type a command below.
            </div>
          )}
          {activeThread?.messages.map(msg => (
            <MessageBlock key={msg.id} message={msg} />
          ))}
          {loading && (
            <div style={{ color: "#444", fontSize: 11, fontFamily: "ui-monospace, monospace" }}>
              Running...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <Composer mode={mode} onSend={handleSend} disabled={loading || !activeId} />
      </div>
    </div>
  )
}
