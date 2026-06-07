"use client"

import { useState } from "react"
import Link from "next/link"
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

interface ShellProps {
  tier: Tier
  spaceLabel?: string
}

export default function Shell({ tier, spaceLabel = "Defrag" }: ShellProps) {
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
    // Switch to Right Now when a new response arrives
    if (msg.role === "sovereign") {
      setRightPanel("right-now")
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-black text-[#F6F5F3]">

      {/* ── App header ──────────────────────────────────────────────────── */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#F6F5F3]/10 px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-[9px] uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
            aria-label="Sovereign.os home"
          >
            Sovereign.os
          </Link>
          <span className="text-white/15 font-mono text-[9px]">/</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
            {spaceLabel} space
          </span>
        </div>

        <div className="flex items-center gap-4">
          {tier === "pro" && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/25 border border-white/10 px-2 py-0.5">
              Pro
            </span>
          )}
          <Link
            href="/settings"
            className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-[#F6F5F3] transition-colors"
          >
            Baseline Design
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-[#F6F5F3] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid flex-1 grid-cols-[220px_1fr_280px] overflow-hidden">
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

        {/* Right panel */}
        <div className="flex h-full flex-col overflow-hidden border-l border-[#F6F5F3]/10">
          {/* Panel tabs */}
          <div className="flex h-10 shrink-0 border-b border-[#F6F5F3]/10">
            <button
              type="button"
              onClick={() => setRightPanel("right-now")}
              className={`flex-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                rightPanel === "right-now"
                  ? "text-[#F6F5F3] border-b border-[#F6F5F3]/40"
                  : "text-white/25 hover:text-white/50"
              }`}
              aria-pressed={rightPanel === "right-now"}
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
              aria-pressed={rightPanel === "your-space"}
            >
              Library
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightPanel === "right-now" ? (
              <ContextPanel activeMessage={activeMessage} hideHeader />
            ) : (
              <YourSpace />
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <footer className="flex h-8 shrink-0 items-center justify-between border-t border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
          {selectedPerson.relation === "self"
            ? "Just you"
            : `${selectedPerson.name} — ${selectedPerson.relation}`}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">
          Sovereign.os Library
        </span>
      </footer>
    </div>
  )
}