import React, { useState, useRef, useEffect } from "react"
import { ThreadList } from "./components/ThreadList.tsx"
import { MessageBlock } from "./components/MessageBlock.tsx"
import { Composer } from "./components/Composer.tsx"
import { ModeSelector } from "./components/ModeSelector.tsx"
import type { Thread, Message, Mode, ActionRequest, ActionResponse } from "./types.ts"

// ── API client ────────────────────────────────────────────────────────────────
// Dev: proxied to localhost:8787 via vite.config.ts
// Prod: https://operator.defrag.app (Cloudflare Access JWT passed via cookies)
const API_BASE = import.meta.env.PROD ? "https://operator.defrag.app" : ""

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(API_BASE + path, {
    ...options,
    credentials: "include", // sends Cloudflare Access cookie automatically
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  })
}

async function callAction(req: ActionRequest): Promise<ActionResponse> {
  const res = await apiFetch("/api/action", { method: "POST", body: JSON.stringify(req) })
  if (!res.ok && res.status !== 200) {
    const err = await res.json().catch(() => ({ message: "Network error" })) as Record<string, unknown>
    return { success: false, status: "error", message: (err.message as string) || "Request failed: " + res.status, risk: "low", requiresConfirm: false }
  }
  return res.json() as Promise<ActionResponse>
}

async function callInspect(path: string, liveUrl?: string): Promise<ActionResponse> {
  const params = new URLSearchParams()
  if (liveUrl) params.set("url", liveUrl)
  else params.set("path", path)
  const res = await apiFetch("/api/inspect?" + params.toString())
  if (!res.ok) return { success: false, status: "error", message: "Inspect failed: " + res.status, risk: "low", requiresConfirm: false }
  const data = await res.json() as Record<string, unknown>
  return { success: true, status: "ok", message: "Inspect complete", risk: "low", requiresConfirm: false, result: data.result }
}

async function callStatus(): Promise<{ ok: boolean; mode: string; version: string; capabilities: Record<string, boolean> }> {
  try {
    const res = await apiFetch("/health")
    if (!res.ok) return { ok: false, mode: "unknown", version: "?", capabilities: {} }
    return res.json()
  } catch {
    return { ok: false, mode: "unknown", version: "?", capabilities: {} }
  }
}

// ── Command parser ────────────────────────────────────────────────────────────
function parseCommand(text: string): ActionRequest {
  const lower = text.toLowerCase().trim()

  if (lower.startsWith("inspect ") || lower.startsWith("read ")) {
    const target = text.split(" ").slice(1).join(" ")
    if (target.startsWith("http")) return { type: "inspect", tool: "inspect_live_url", payload: { url: target } }
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
  return { type: "inspect", tool: "inspect_repo", payload: { path: text } }
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ status }: { status: { ok: boolean; mode: string; version: string } | null }) {
  if (!status) return (
    <div style={{ height: 28, background: "#0a0a0a", borderBottom: "1px solid #111", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#333", display: "inline-block" }} />
      <span style={{ fontSize: 10, color: "#333", fontFamily: "ui-monospace, monospace" }}>connecting...</span>
    </div>
  )
  const color = status.ok ? "#22c55e" : "#ef4444"
  const modeColor = status.mode === "safe" ? "#f0a06a" : "#ef4444"
  return (
    <div style={{ height: 28, background: "#050505", borderBottom: "1px solid #111", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: 10, color: "#444", fontFamily: "ui-monospace, monospace" }}>sovereign-control {status.version}</span>
      <span style={{ fontSize: 10, color: modeColor, fontFamily: "ui-monospace, monospace", letterSpacing: "0.1em" }}>MODE: {status.mode.toUpperCase()}</span>
      <span style={{ fontSize: 10, color: "#222", fontFamily: "ui-monospace, monospace", marginLeft: "auto" }}>operator.defrag.app</span>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>("inspect")
  const [loading, setLoading] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState<ActionRequest | null>(null)
  const [systemStatus, setSystemStatus] = useState<{ ok: boolean; mode: string; version: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fetch system status on mount
  useEffect(() => {
    callStatus().then(s => setSystemStatus({ ok: s.ok, mode: s.mode || "safe", version: s.version || "v0.4" }))
    const interval = setInterval(() => {
      callStatus().then(s => setSystemStatus({ ok: s.ok, mode: s.mode || "safe", version: s.version || "v0.4" }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Initialize with a default thread
  useEffect(() => {
    if (threads.length === 0) {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const thread: Thread = { id, title: "Session 1", mode: "inspect", messages: [], createdAt: now, updatedAt: now }
      setThreads([thread])
      setActiveId(id)
    }
  }, [])

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
      if (req.tool === "inspect_repo" || req.tool === "inspect_live_url") {
        res = await callInspect((req.payload?.path as string) || "", (req.payload?.url as string) || undefined)
      } else {
        res = await callAction(req)
      }

      if (res.status === "requires_confirm") {
        setPendingConfirm(req)
        addMessage(threadId, { role: "assistant", type: "action", content: res.message, meta: { tool: req.tool, risk: res.risk, requiresConfirm: true, preview: res.result } })
      } else if (res.status === "blocked") {
        addMessage(threadId, { role: "assistant", type: "error", content: "Blocked: " + res.message, meta: { tool: req.tool, status: "blocked" } })
      } else if (res.status === "not_enabled") {
        addMessage(threadId, { role: "assistant", type: "meta", content: res.message, meta: { tool: req.tool, status: "not_enabled" } })
      } else if (res.status === "error") {
        addMessage(threadId, { role: "assistant", type: "error", content: "Error: " + res.message, meta: { tool: req.tool, logId: res.logId } })
      } else {
        const resultStr = typeof res.result === "string" ? res.result : JSON.stringify(res.result, null, 2).slice(0, 3000)
        addMessage(threadId, { role: "assistant", type: "meta", content: resultStr, meta: { tool: req.tool, status: "ok", risk: res.risk, logId: res.logId } })
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
    await executeAction(parseCommand(text), activeId)
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#000" }}>
      <StatusBar status={systemStatus} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ThreadList threads={threads} activeId={activeId} onSelect={setActiveId} onNew={handleNew} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Thread header */}
          <div style={{ height: 44, borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
            <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {activeThread?.title || "No thread selected"}
            </span>
            <span style={{ fontSize: 10, color: "#333" }}>sovereign-control · v0.4</span>
          </div>

          <ModeSelector active={mode} onChange={setMode} />

          {/* Confirm bar */}
          {pendingConfirm && (
            <div style={{ background: "#0a0500", borderBottom: "1px solid #ff6b35", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#ff6b35" }}>
                High-risk action: <strong>{pendingConfirm.tool}</strong> — confirm to proceed
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPendingConfirm(null)} style={{ background: "transparent", border: "1px solid #333", color: "#666", padding: "4px 12px", fontSize: 11, cursor: "pointer", borderRadius: 2 }}>Cancel</button>
                <button onClick={handleConfirm} style={{ background: "#ff6b35", border: "none", color: "#000", padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, borderRadius: 2 }}>Confirm</button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {activeThread?.messages.length === 0 && (
              <div style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 40 }}>
                <div style={{ marginBottom: 8, color: "#555" }}>Sovereign Control — Operator Interface</div>
                <div style={{ color: "#222", fontSize: 11, lineHeight: 1.8 }}>
                  inspect apps/worker/src/index.ts<br />
                  inspect https://defrag.app<br />
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
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#c8c2bc" }} />
                Running...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <Composer mode={mode} onSend={handleSend} disabled={loading || !activeId} />
        </div>
      </div>
    </div>
  )
}