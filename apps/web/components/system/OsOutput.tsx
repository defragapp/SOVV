"use client"

/**
 * OsOutput
 *
 * Renders the last AI output from systemStore.
 * Reads from the unified SystemOutput contract (primary / secondary / meta).
 *
 * Additive — can be placed alongside existing ResultCard during transition,
 * then promoted to primary output renderer once validated.
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSystemStore } from "@/state/systemStore"

const ease = [0.16, 1, 0.3, 1] as const

export function OsOutput() {
  const { output, isProcessing } = useSystemStore()

  return (
    <AnimatePresence mode="wait">

      {isProcessing && !output && (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3 py-6"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 bg-[#c8c2bc]/40"
                style={{ borderRadius: 1 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
            Reading the moment
          </span>
        </motion.div>
      )}

      {output && (
        <motion.div
          key={output.receivedAt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className="border border-white/[0.08] bg-white/[0.02] overflow-hidden"
          style={{ borderRadius: 4 }}
        >
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
              {output.space}
            </span>
            <span className="font-mono text-[9px] text-[#4f4b47]">
              {new Date(output.receivedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="px-5 py-5">
            <p className="text-[15px] text-[#f4efe9] leading-[1.7]">
              {output.primary}
            </p>
            {output.secondary && (
              <p className="mt-3 text-[13px] text-[#a8a29a] leading-relaxed">
                {output.secondary}
              </p>
            )}
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  )
}

export default OsOutput
