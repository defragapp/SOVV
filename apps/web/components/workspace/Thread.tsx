"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Person, ThreadMessage, ExplainResponse } from "./types"
import MessageInput from "./MessageInput"

const CATEGORIES = [
  "Relationship", "Family", "Boundary", "Message",
  "Grief", "Parenting", "Team", "Active Now",
] as const;

type Category = typeof CATEGORIES[number];

// Fragment loading animation — Defrag visual metaphor
function FragmentLoader() {
  const chars = "01·—/\\|_░▒▓".split("");
  return (
    <div className="flex items-center gap-1 py-2" aria-label="Processing">
      {Array.from({ length: 12 }, (_, i) => (
        <motion.span
          key={i}
          className="text-foreground-disabled"
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 1.2, delay: i * 0.08, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: "0.55rem", fontFamily: "monospace" }}
        >
          {chars[i % chars.length]}
        </motion.span>
      ))}
      <span className="text-micro ml-2 text-foreground-disabled">Processing</span>
    </div>
  );
}

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
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = async (message: string) => {
    setLoading(true)

    const userMsg: ThreadMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: activeCategory ? `[${activeCategory}] ${message}` : message,
      timestamp: Date.now(),
    }
    onNewMessage(userMsg)

    try {
      const body: Record<string, unknown> = {
        message: activeCategory ? `[${activeCategory}] ${message}` : message,
      }
      if (selectedPerson.relation !== "self") {
        body.target = { id: selectedPerson.id, relation: selectedPerson.relation }
      }

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      if (res.status === 429) {
        onNewMessage({
          id: `l_${Date.now()}`,
          role: "sovereign",
          content: "You have reached your daily session limit. Upgrade to Pro for unlimited sessions.",
          timestamp: Date.now(),
        })
        return
      }

      const data: ExplainResponse = await res.json()

      if ((data as any).type === "needs_baseline") {
        onNewMessage({
          id: `b_${Date.now()}`,
          role: "sovereign",
          content: "Your Baseline Design is not set yet. Go to Settings to add your Baseline Design details.",
          timestamp: Date.now(),
        })
        return
      }

      onNewMessage({
        id: `s_${Date.now()}`,
        role: "sovereign",
        content: data.response,
        shift: data.shift,
        move: data.move,
        insights: data.insights,
        pressure_points: data.pressure_points,
        timestamp: Date.now(),
      })

      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)

    } catch {
      onNewMessage({
        id: `e_${Date.now()}`,
        role: "sovereign",
        content: "Something went wrong. Try again.",
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-[#F6F5F3]/8">

      {/* ── Category selector ─────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`shrink-0 text-micro px-3 py-1.5 border transition-colors touch-target min-h-[36px] ${
                activeCategory === cat
                  ? "border-[#F6F5F3]/35 text-[#F6F5F3]/80 bg-[#F6F5F3]/05"
                  : "border-[#F6F5F3]/10 text-[#F6F5F3]/28 hover:border-[#F6F5F3]/22 hover:text-[#F6F5F3]/50"
              }`}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className={`shrink-0 text-micro px-3 py-1.5 border transition-colors touch-target min-h-[36px] ${
              showUpload
                ? "border-focus text-foreground"
                : "border-border text-foreground-disabled hover:border-focus"
            }`}
            aria-label="Upload screenshot"
          >
            ↑ Image
          </button>
        </div>
      </div>

      {/* ── Upload panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <p className="text-label">Screenshot or image</p>

              {/* Honest gate — OCR not yet available */}
              <div className="border border-border bg-surface p-4 space-y-2">
                <p className="text-micro text-foreground-muted">Image review not yet available</p>
                <p className="text-caption text-xs leading-6">
                  Image review is not fully available yet. Paste the message text here for now.
                </p>
              </div>

              {/* Upload input — disabled until OCR is live */}
              <div className="opacity-40 pointer-events-none">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  aria-label="Upload screenshot"
                  disabled
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary py-2.5 px-4 text-[9px] w-full"
                  disabled
                >
                  Choose image (PNG, JPG, WebP)
                </button>
              </div>

              <p className="text-micro">Your images are never stored or shared.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3 max-w-xs">
              <p className="text-micro text-[#F6F5F3]/18">
                {selectedPerson.relation === "self"
                  ? "Start with what is happening now."
                  : `Working with ${selectedPerson.name}`}
              </p>
              {activeCategory && (
                <p className="text-micro text-[#F6F5F3]/25">
                  Category: {activeCategory}
                </p>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`mb-6 ${msg.role === "user" ? "text-[#F6F5F3]/55" : "text-[#F6F5F3]"}`}
          >
            <span className="mb-2 block text-micro">
              {msg.role === "user" ? "You" : "Sovereign.os"}
            </span>
            <p className="text-sm font-light leading-7">{msg.content}</p>
            {msg.shift && (
              <div className="mt-3 border-l border-[#F6F5F3]/15 pl-4">
                <span className="text-micro">Active pattern</span>
                <p className="mt-1 text-sm text-[#F6F5F3]/65 leading-6">{msg.shift.summary}</p>
              </div>
            )}
            {msg.move && (
              <div className="mt-3 border-l border-[#F6F5F3]/10 pl-4">
                <span className="text-micro">Best Next Response</span>
                <p className="mt-1 text-sm text-[#F6F5F3]/55 leading-6">{msg.move.description}</p>
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <span className="text-micro mb-2 block">Sovereign.os</span>
            <FragmentLoader />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Two-person overlay notice ──────────────────────────────────── */}
      {selectedPerson.relation !== "self" && (
        <div className="shrink-0 border-t border-[#F6F5F3]/8 px-4 py-3">
          <p className="text-micro text-[#F6F5F3]/25 leading-5">
            I can work with your side of this. To compare both Baseline Designs, invite them privately.
          </p>
        </div>
      )}

      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  )
}