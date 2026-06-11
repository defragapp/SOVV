"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface HistoryItem {
  id: string
  mode: string
  question: string
  confidence: string
  created_at: number
}

type LoadState = "loading" | "empty" | "loaded" | "error"

const MODE_LABELS: Record<string, string> = {
  self: "Just you",
  pair: "With someone",
  group: "Group",
  situation: "Situation",
}

const CONFIDENCE_LABELS: Record<string, string> = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
  "Not enough information": "Partial",
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function LibraryView() {
  const [state, setState] = useState<LoadState>("loading")
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    fetch("/api/history", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const list: HistoryItem[] = data?.interactions ?? []
        setState(list.length === 0 ? "empty" : "loaded")
        setItems(list)
      })
      .catch(() => setState("error"))
  }, [])

  return (
    <aside className="flex h-full flex-col bg-black overflow-y-auto" aria-label="Sovereign.os Library">

      {/* Header */}
      <div className="flex h-10 shrink-0 items-center border-b border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
          Sovereign.os Library
        </span>
      </div>

      {/* Loading */}
      {state === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-micro text-foreground-disabled"
          >
            Loading
          </motion.span>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-micro text-foreground-disabled text-center">
            Library unavailable right now.
          </p>
        </div>
      )}

      {/* Empty */}
      {state === "empty" && (
        <div className="flex flex-1 flex-col px-4 py-8 gap-3">
          <p className="text-micro text-foreground-disabled mb-2">
            Library
          </p>
          <p className="text-body-sm text-foreground-disabled">
            Nothing saved yet.
          </p>
          <p className="text-caption text-foreground-disabled">
            Defrag results, Covenant Briefs, and saved responses all appear here. The AI uses your Library to keep the thread grounded over time.
          </p>
          <p className="mt-6 text-micro text-foreground-disabled opacity-60">
            Save to Sovereign to build your Library.
          </p>
        </div>
      )}

      {/* Loaded */}
      {state === "loaded" && (
        <div className="flex flex-col">
          <div className="px-4 pt-4 pb-2">
            <span className="text-micro text-foreground-disabled">
              Recent sessions
            </span>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-micro text-foreground-disabled">
                    {MODE_LABELS[item.mode] ?? item.mode}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-sm font-light text-white/60 leading-5 line-clamp-2">
                  {item.question}
                </p>
                {item.confidence && item.confidence !== "Not enough information" && (
                  <span className="mt-1 block font-mono text-[8px] uppercase tracking-widest text-white/20">
                    {CONFIDENCE_LABELS[item.confidence] ?? item.confidence}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Library sections */}
          <div className="mt-4 border-t border-[#F6F5F3]/10">
            {[
              "Best Next Responses",
              "Covenant Briefs",
              "Watch It",
              "Compare With Someone",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 border-b border-[#F6F5F3]/5"
              >
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/15">
                  {label}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-white/10">
                  Saves here
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}