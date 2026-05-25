"use client"

import { useState } from "react"
import type { Person, Tier, ThreadMessage } from "./types"
import Sidebar from "./Sidebar"
import Thread from "./Thread"
import ContextPanel from "./ContextPanel"

const SELF: Person = {
  id: "self",
  name: "You",
  relation: "self",
}

export default function Shell({ tier }: { tier: Tier }) {
  const [selectedPerson, setSelectedPerson] = useState<Person>(SELF)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [activeMessage, setActiveMessage] = useState<ThreadMessage | null>(null)

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person)
    setMessages([])
    setActiveMessage(null)
  }

  const handleNewMessage = (msg: ThreadMessage) => {
    setMessages((prev) => [...prev, msg])
    setActiveMessage(msg)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-black text-[#F6F5F3]">
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">
          Sovereign
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-white/40">
            {tier}
          </span>
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
        <ContextPanel activeMessage={activeMessage} />
      </div>

      <footer className="flex h-8 shrink-0 items-center border-t border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-xs uppercase tracking-widest text-white/30">
          {selectedPerson.relation === "self"
            ? "Self-reflection mode"
            : `${selectedPerson.name} — ${selectedPerson.relation}`}
        </span>
      </footer>
    </div>
  )
}
