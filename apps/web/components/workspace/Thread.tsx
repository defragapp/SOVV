"use client"

import { useState } from "react"
import type { Person, ThreadMessage, ExplainResponse } from "./types"
import MessageInput from "./MessageInput"

export default function Thread({
  selectedPerson,
  messages,
  onNewMessage,
}: {
  selectedPerson: Person
  messages: ThreadMessage[]
  onNewMessage: (msg: ThreadMessage) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSend = async (message: string) => {
    setLoading(true)

    const userMsg: ThreadMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: message,
      timestamp: Date.now(),
    }
    onNewMessage(userMsg)

    try {
      const body: Record<string, unknown> = { message }
      if (selectedPerson.relation !== "self") {
        body.target = { id: selectedPerson.id, relation: selectedPerson.relation }
      }

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      
        id: `s_${Date.now()}`,
        role: "sovereign",
        content: data.response,
        shift: data.shift,
        move: data.move,
        insights: data.insights,
        pressure_points: data.pressure_points,
        timestamp: Date.now(),
      }
      onNewMessage(sovereignMsg)
    } catch {
      const errMsg: ThreadMessage = {
        id: `e_${Date.now()}`,
        role: "sovereign",
        content: "Something broke. Try again.",
        timestamp: Date.now(),
      }
      onNewMessage(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-[#F6F5F3]/10">
      <div className="flex h-10 shrink-0 items-center border-b border-[#F6F5F3]/10 px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">
          {selectedPerson.relation === "self" ? "Self" : `${selectedPerson.name}`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-xs uppercase tracking-widest text-white/20">
              {selectedPerson.relation === "self"
                ? "What's going on right now?"
                : `What's happening with ${selectedPerson.name}?`}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-6 ${
              msg.role === "user" ? "text-white/60" : "text-[#F6F5F3]"
            }`}
          >
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/30">
              {msg.role === "user" ? "You" : "DEFRAG"}
            </span>
            <p className="text-sm font-light leading-6">{msg.content}</p>
            {msg.shift && (
              <div className="mt-3 border-l border-[#F6F5F3]/20 pl-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  What got lit up
                </span>
                <p className="mt-1 text-sm text-white/70">{msg.shift.summary}</p>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
              DEFRAG
            </span>
            <p className="mt-2 text-sm text-white/40">...</p>
          </div>
        )}
      </div>

      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  )
}
