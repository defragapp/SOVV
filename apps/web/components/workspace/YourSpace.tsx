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

export default function YourSpace() {
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
    <aside className="flex h-full flex-col bg-black overflow-y-auto">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center border-b border-[#F6F5F3]/10 px-4">
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">
          Your Space
        </span>
      </div>

      {/* Loading */}
      {state === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="font-mono text-[9px] uppercase tracking-widest text-white/20"
          >
            Loading
          </motion.span>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/20 text-center">
            We couldn&apos;t load Your Space right now.
          </p>
        </div>
      )}

      {/* Empty */}
      {state === "empty" && (
        <div className="flex flex-1 flex-col px-4 py-8 gap-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/20 mb-1">
            Your Space
          </p>
          <p className="text-sm font-light text-white/30 leading-6">
            Nothing saved yet.
          </p>
          <p className="text-sm font-light text-white/20 leading-6">
            Once you start using DEFRAG, your recent threads and saved work will appear here.
          </p>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-white/15">
            The AI uses Your Space to keep the thread grounded instead of starting over every time.
          </p>
        </div>
      )}

      {/* Loaded */}
      {state === "loaded" && (
        <div className="flex flex-col">
          {/* Recent threads */}
          <div className="px-4 pt-4 pb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
              Recent threads
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[#F6F5F3]/10">
            {items.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
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

          {/* Future sections — quiet placeholders */}
          <div className="mt-4 border-t border-[#F6F5F3]/10">
            {[
              "Saved Best Next Responses",
              "Practices",
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
                  Saved here when available
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}