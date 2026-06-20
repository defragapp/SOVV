"use client"
// components/chatthread/Chat.tsx
// Codebase-aware AI chat powered by chatthread Worker + AutoRAG

import * as React from "react"
import { sendChat } from "@/lib/chat"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatProps {
  /** Optional placeholder text for the input */
  placeholder?: string
  /** Optional initial session ID — omit to start a new session */
  initialSessionId?: string
  /** Optional CSS class for the outer container */
  className?: string
}

export default function Chat({
  placeholder = "Ask about the SOVV codebase…",
  initialSessionId,
  className = "",
}: ChatProps) {
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([])
  const [sessionId, setSessionId] = React.useState<string | undefined>(initialSessionId)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const msg = input.trim()
    if (!msg || loading) return

    setLoading(true)
    setError("")
    setInput("")
    setMessages(m => [...m, { role: "user", content: msg }])

    try {
      const data = await sendChat(msg, sessionId)
      setSessionId(data.session_id)
      setMessages(m => [...m, { role: "assistant", content: data.reply }])
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.")
      setMessages(m => [...m, { role: "assistant", content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Message thread */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-[#76716b] text-center max-w-xs leading-relaxed">
              Ask anything about the SOVV codebase — architecture, endpoints, data flow, or specific files.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-[14px] text-[13px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#f4efe9] text-[#08070a]"
                  : "bg-white/[0.05] text-[#c8c2bc] border border-white/[0.06]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/[0.06] px-4 py-2.5 rounded-[14px]">
              <span className="w-3.5 h-3.5 border border-white/[0.15] border-t-white/40 rounded-full animate-spin block" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex-none px-4 pb-4">
        {error && (
          <p className="text-[11px] text-red-400 mb-2 px-1">{error}</p>
        )}
        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors"
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[13px] px-4 pt-3 pb-1 leading-[1.75] block"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05]">
            <span className="text-[10px] text-[#4f4b47] tracking-[0.08em]">↵ Send</span>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-7 px-4 rounded-full bg-[#f4efe9] text-[#08070a] text-[11px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "…" : "Ask"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
