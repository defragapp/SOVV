"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FadeUp } from "@/components/ui/fade-up"
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-[100dvh] w-screen flex-col bg-background text-foreground"
    >
      {/* ── Sticky top-bar with 1px bottom border ─────────────────────── */}
      <FadeUp className="shrink-0">
        <header className="flex h-12 items-center justify-between border-b border-border px-4 sm:px-8 surface-glass sticky top-0 z-40 safe-top">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-micro hover:text-white transition-colors duration-200"
              aria-label="Sovereign.os home"
            >
              Sovereign.os
            </Link>
            <span className="text-foreground-disabled text-micro">/</span>
            <span className="text-micro text-foreground-muted">
              {spaceLabel} space
            </span>
          </div>

          <div className="flex items-center gap-4">
            {tier === "pro" && (
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/25 border border-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded-iOS">
                Pro
              </span>
            )}
            <Link
              href="/settings"
              className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-[#F6F5F3] transition-colors duration-200"
            >
              Baseline Design
            </Link>
            <form action="/api/auth/logout" method="POST">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-[#F6F5F3] transition-colors duration-200"
              >
                Sign out
              </motion.button>
            </form>
          </div>
        </header>
      </FadeUp>

      {/* ── Main bento grid ──────────────────────────────────────────── */}
      <div className="grid flex-1 grid-cols-[220px_1fr_280px] overflow-hidden gap-0">
        {/* Sidebar — left column */}
        <FadeUp delay={0.05} className="h-full overflow-hidden border-r border-[rgba(255,255,255,0.06)]">
          <div className="h-full bg-black/30 backdrop-blur-sm">
            <Sidebar
              selectedPerson={selectedPerson}
              onSelectPerson={handleSelectPerson}
            />
          </div>
        </FadeUp>

        {/* Thread — center column (main content area) */}
        <FadeUp delay={0.1} className="h-full overflow-hidden relative">
          {/* Subtle ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 60%)",
            }}
          />
          <div className="relative z-10 h-full bg-black/20 backdrop-blur-sm">
            <Thread
              selectedPerson={selectedPerson}
              messages={messages}
              onNewMessage={handleNewMessage}
            />
          </div>
        </FadeUp>

        {/* Right panel — right column */}
        <FadeUp delay={0.15} className="h-full overflow-hidden border-l border-[rgba(255,255,255,0.06)]">
          <div className="flex h-full flex-col bg-black/30 backdrop-blur-sm">
            {/* Panel tabs */}
            <div className="flex h-10 shrink-0 border-b border-[rgba(255,255,255,0.08)]">
              <motion.button
                type="button"
                onClick={() => setRightPanel("right-now")}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`flex-1 font-mono text-[9px] uppercase tracking-widest transition-colors duration-200 ${
                  rightPanel === "right-now"
                    ? "text-[#F6F5F3] border-b border-[#F6F5F3]/40"
                    : "text-white/25 hover:text-white/50"
                }`}
                aria-pressed={rightPanel === "right-now"}
              >
                Right Now
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setRightPanel("your-space")}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`flex-1 font-mono text-[9px] uppercase tracking-widest transition-colors duration-200 ${
                  rightPanel === "your-space"
                    ? "text-[#F6F5F3] border-b border-[#F6F5F3]/40"
                    : "text-white/25 hover:text-white/50"
                }`}
                aria-pressed={rightPanel === "your-space"}
              >
                Library
              </motion.button>
            </div>

            <div className="flex-1 overflow-hidden">
              {rightPanel === "right-now" ? (
                <ContextPanel activeMessage={activeMessage} hideHeader />
              ) : (
                <YourSpace />
              )}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <FadeUp delay={0.2}>
        <footer className="flex h-8 shrink-0 items-center justify-between border-t border-[rgba(255,255,255,0.08)] px-8">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
            {selectedPerson.relation === "self"
              ? "Just you"
              : `${selectedPerson.name} — ${selectedPerson.relation}`}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">
            Sovereign.os Library
          </span>
        </footer>
      </FadeUp>
    </motion.div>
  )
}