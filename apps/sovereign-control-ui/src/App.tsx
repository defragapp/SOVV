import React, { useState, useRef, useEffect } from "react"
import { ThreadList } from "./components/ThreadList.tsx"
import { MessageBlock } from "./components/MessageBlock.tsx"
import { Composer } from "./components/Composer.tsx"
import { ModeSelector } from "./components/ModeSelector.tsx"
import { MOCK_THREADS } from "./data/mockThreads.ts"
import type { Thread, Message, Mode, ActionRequest, ActionResponse } from "./types.ts"

// ── API client ────────────────────────────────────────────────────────────────
// In dev: proxied to localhost:8787 (sovereign-control)
// In prod: https://operator.defrag.app
const API_BASE = ""

async function callAction(req: ActionRequest): Promise<ActionResponse> {
  const res = await fetch(API_BASE + "/api/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(req),
  })
  if (!res.ok && res.status !== 200) {
    const err = await res.json().catch(() => ({ message: "Network error" })) as Record<string, unknown>
    return {
      success: false,
      status: "error",
      message: (err.message as string) || "Request failed: " + res.status,
      risk: "low",
      requiresConfirm: false,
    }
  }
  return res.json() as Promise<ActionResponse>
}

async function callInspect(path: string, liveUrl?: string): Promise<ActionResponse> {
  const params = new URLSearchParams()
  if (liveUrl) params.set("url", liveUrl)
  else params.set("path", path)

  const res = await fetch(API_BASE + "/api/inspect?" + params.toString(), {
    credentials: "include",
  })
  if (!res.ok) {
    return { success: false, status: "error", message: "Inspect failed: " + res.status, risk: "low", requiresConfirm: false }
  }
  const data = await res.json() as Record<string, unknown>
  return { success: true, status: "ok", message: "Inspect complete", risk: "low", requiresConfirm: false, result: data.result }
}

// ── Command parser ────────────────────────────────────────────────────────────
function parseCommand(text: string): ActionRequest {
  const lower = text.toLowerCase().trim()

  if (lower.startsWith("inspect ") || lower.startsWith("read ")) {
    const target = text.split(" ").slice(1).join(" ")
    if (target.startsWith("http")) {
      return { type: "inspect", tool: "inspect_live_url", payload: { url: target } }
    }
    return { type: "inspect", tool: "inspect_repo", payload: { path: target } }
  }

  if (lower.startsWith("screenshot ") || lower.startsWith("capture ")) {
    const url = text.split(" ").slice(1).join(" ")
    return { type: "inspect", tool: "capture_screenshot", payload: { url } }
  }

  if (lower.startsWith("deploy ")) {
    const workerName = text.split(" ").slice(1).join(" ")
    return { type: "deploy", tool: "deploy_worker", payload: { workerName }, confirm: false }
  }

  if (lower.startsWith("rollback ")) {
    const workerName = text.split(" ").slice(1).join(" ")
    return { type: "rollback", tool: "rollback_worker", payload: { workerName }, confirm: false }
  }

  if (lower.startsWith("creative ") || lower.startsWith("design ")) {
    const prompt = text.split(" ").slice(1).join(" ")
    return { type: "inspect", tool: "generate_creative", payload: { prompt, type: "concept" } }
  }

  // Default: inspect repo path
  return { type: "inspect", tool: "inspect_repo", payload: { path: text } }
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS)
  const [activeId, setActiveId] = useState<string | null>(MOCK_THREADS[0]?.id || null)
  const [mode, setMode] = useState<Mode>("inspect")
  const [loading, setLoading] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState<ActionRequest | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeThread = threads.find(t => t.id === activeId) || null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeThread?.messages.length])

  const addMessage = (threadId: string, msg: Omit<Message, "id" | "timestamp">) => {
    const full: Message = { ...msg, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, messages: [...t.messages, full], updatedAt: full.timestamp } : t
    ))
    return full
  }

  const executeAction = async (req: ActionRequest, threadId: string) => {
    setLoading(true)
    addMessage(threadId, { role: "assistant", type: "meta", content: "Running " + req.tool + "...", meta: { tool: req.tool, status: "running" } })

    try {
      let res: ActionResponse

      // Use optimized inspect endpoint for read-only tools
      if (req.tool === "inspect_repo" || req.tool === "inspect_live_url") {
        const path = (req.payload?.path as string) || ""
        const url = (req.payload?.url as string) || undefined
        res = await callInspect(path, url)
      } else {
        res = await callAction(req)
      }

      // Handle response states
      if (res.status === "requires_confirm") {
        setPendingConfirm(req)
        addMessage(threadId, {
          role: "assistant", type: "action",
          content: res.message,
          meta: { tool: req.tool, risk: res.risk, requiresConfirm: true, preview: res.result },
        })
      } else if (res.status === "blocked") {
        addMessage(threadId, { role: "assistant", type: "error", content: "Blocked: " + res.message, meta: { tool: req.tool, status: "blocked" } })
      } else if (res.status === "not_enabled") {
        addMessage(threadId, { role: "assistant", type: "meta", content: res.message, meta: { tool: req.tool, status: "not_enabled" } })
      } else if (res.status === "error") {
        addMessage(threadId, { role: "assistant", type: "error", content: "Error: " + res.message, meta: { tool: req.tool, logId: res.logId } })
      } else {
        // Success
        const resultStr = typeof res.result === "string"
          ? res.result
          : JSON.stringify(res.result, null, 2).slice(0, 2000)
        addMessage(threadId, {
          role: "assistant", type: "meta",
          content: resultStr,
          meta: { tool: req.tool, status: "ok", risk: res.risk, logId: res.logId },
        })
      }
    } catch (err) {
      addMessage(threadId, { role: "assistant", type: "error", content: "Network error: " + String(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (text: string) => {
    if (!activeId || loading) return
    addMessage(activeId, { role: "user", type: "text", content: text })
    const req = parseCommand(text)
    await executeAction(req, activeId)
  }

  const handleConfirm = async () => {
    if (!pendingConfirm || !activeId) return
    const confirmed = { ...pendingConfirm, confirm: true }
    setPendingConfirm(null)
    addMessage(activeId, { role: "user", type: "text", content: "Confirmed: " + pendingConfirm.tool })
    await executeAction(confirmed, activeId)
  }

  const handleNew = () => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const thread: Thread = { id, title: "New thread", mode, messages: [], createdAt: now, updatedAt: now }
    setThreads(prev => [thread, ...prev])
    setActiveId(id)
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#000" }}>
      <ThreadList threads={threads} activeId={activeId} onSelect={setActiveId} onNew={handleNew} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ height: 44, borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {activeThread?.title || "No thread selected"}
          </span>
          <span style={{ fontSize: 10, color: "#333" }}>sovereign-control · v0.2</span>
        </div>

        <ModeSelector active={mode} onChange={setMode} />

        {/* Confirm bar — shown when high-risk action needs confirmation */}
        {pendingConfirm && (
          <div style={{ background: "#0a0500", borderBottom: "1px solid #ff6b35", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#ff6b35" }}>
              High-risk action: <strong>{pendingConfirm.tool}</strong> — confirm to proceed
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPendingConfirm(null)} style={{ background: "transparent", border: "1px solid #333", color: "#666", padding: "4px 12px", fontSize: 11, cursor: "pointer", borderRadius: 2 }}>
                Cancel
              </button>
              <button onClick={handleConfirm} style={{ background: "#ff6b35", border: "none", color: "#000", padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, borderRadius: 2 }}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {activeThread?.messages.length === 0 && (
            <div style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 40 }}>
              <div style={{ marginBottom: 8 }}>Start a thread.</div>
              <div style={{ color: "#222", fontSize: 11 }}>
                inspect apps/worker/src/index.ts<br />
                screenshot https://app.defrag.app<br />
                deploy sovereign-os-api<br />
                creative improve the Defrag entry screen
              </div>
            </div>
          )}
          {activeThread?.messages.map(msg => (
            <MessageBlock key={msg.id} message={msg} />
          ))}
          {loading && (
            <div style={{ color: "#444", fontSize: 11, fontFamily: "ui-monospace, monospace", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#c8c2bc", animation: "pulse 1s infinite" }} />
              Running...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <Composer mode={mode} onSend={handleSend} disabled={loading || !activeId} />
      </div>
    </div>
  )
}
