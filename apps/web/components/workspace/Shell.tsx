"use client"

import { useState } from "react"
import type { Person, Tier, ThreadMessage } from "./types"
import Sidebar from "./Sidebar"
import Thread from "./Thread"
import ContextPanel from "./ContextPanel"
import YourSpace from "./YourSpace"

const SELF: Person = {
  id: "self",
  name: "You",
  relation: "self",
}

type RightPanel = "right-now" | "your-space"

export default function Shell({ tier }: { tier: Tier }) {
  const [selectedPerson, setSelectedPerson] = useState<Person>(SELF)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [activeMessage, setActiveMessage] = useState<ThreadMessage | null>(null)
  const [rightPanel, setRightPanel] = useState<RightPanel>("right-now")

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person)
    setMessages([])
    setActiveMessage(null)
  }

  const handleNewMessage = (msg: ThreadMessage) => {
    setMessages((prev) => [...prev, msg])
    setActiveMessage(msg)
    // Switch to Right Now when a new DEFRAG response arrives
    if (msg.role === "sovereign") {
      setRightPanel("right-now")
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-black text-[#F6F5F3]">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">
          Sovereign.os
        </span>
        <div className="flex items-center gap-4">
          {tier === "pro" && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/25 border border-white/10 px-2 py-0.5">
              Pro
            </span>
          )}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-widest text-white/40 hover:text-[#F6F5F3]"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[240px_1fr_280px] overflow-hidden">
        <Sidebar
          selectedPerson={selectedPerson}
          onSelectPerson={handleSelectPerson}
          tier={tier}
        />
        <Thread
          selectedPerson={selectedPerson}
          messages={messages}
          onNewMessage={handleNewMessage}
        />

        {/* Right panel with toggle */}
        <div className="flex h-full flex-col overflow-hidden border-l border-[#F6F5F3]/10">
          {/* Panel toggle tabs */}
          <div className="flex h-10 shrink-0 border-b border-[#F6F5F3]/10">
            <button
              type="button"
              onClick={() => setRightPanel("right-now")}
              className={`flex-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                rightPanel === "right-now"
                  ? "text-[#F6F5F3] border-b border-[#F6F5F3]/40"
                  : "text-white/25 hover:text-white/50"
              }`}
            >
              Right Now
            </button>
            <button
              type="button"
              onClick={() => setRightPanel("your-space")}
              className={`flex-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                rightPanel === "your-space"
                  ? "text-[#F6F5F3] border-b border-[#F6F5F3]/40"
                  : "text-white/25 hover:text-white/50"
              }`}
            >
              Your Space
            </button>
          </div>

          {/* Panel content — no header (tabs replace it) */}
          <div className="flex-1 overflow-hidden">
            {rightPanel === "right-now" ? (
              <ContextPanel activeMessage={activeMessage} hideHeader />
            ) : (
              <YourSpace />
            )}
          </div>
        </div>
      </div>

      <footer className="flex h-8 shrink-0 items-center border-t border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-xs uppercase tracking-widest text-white/30">
          {selectedPerson.relation === "self"
            ? "Just you"
            : `${selectedPerson.name} — ${selectedPerson.relation}`}
        </span>
      </footer>
    </div>
  )
}