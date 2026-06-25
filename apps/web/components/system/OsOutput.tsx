"use client"

/**
 * OsOutput
 *
 * Renders the last AI output from systemStore.
 * Additive -- can be placed alongside existing ResultCard during transition,
 * then promoted to primary output renderer once validated.
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSystemStore } from "@/state/systemStore"

const ease = [0.16, 1, 0.3, 1] as const

export function OsOutput() {
  const { lastOutput, isProcessing } = useSystemStore()

  return (
    <AnimatePresence mode="wait">

      {isProcessing && !lastOutput && (
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

      {lastOutput && (
        <motion.div
          key={lastOutput.receivedAt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className="border border-white/[0.08] bg-white/[0.02] overflow-hidden"
          style={{ borderRadius: 4 }}
        >
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
              {lastOutput.space}
            </span>
            <span className="font-mono text-[9px] text-[#4f4b47]">
              {new Date(lastOutput.receivedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="px-5 py-5">
            <p className="text-[15px] text-[#f4efe9] leading-[1.7]">
              {lastOutput.primary}
            </p>
            {lastOutput.secondary && (
              <p className="mt-3 text-[13px] text-[#a8a29a] leading-relaxed">
                {lastOutput.secondary}
              </p>
            )}
          </div>

          {lastOutput.sections && lastOutput.sections.length > 0 && (
            <div className="border-t border-white/[0.05]">
              {lastOutput.sections.map((section, i) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3, ease }}
                  className={`px-5 py-4 border-b border-white/[0.04] last:border-0 ${
                    section.highlight ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-2">
                    {section.label}
                  </p>
                  <p className={`text-[13px] leading-relaxed ${
                    section.highlight ? "text-[#f4efe9]" : "text-[#c8c2bc]"
                  }`}>
                    {section.value}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {lastOutput.meta && (
            <div className="px-5 py-3 border-t border-white/[0.04]">
              <p className="font-mono text-[9px] text-[#4f4b47] leading-relaxed">
                {lastOutput.meta}
              </p>
            </div>
          )}
        </motion.div>
      )}

    </AnimatePresence>
  )
}

export default OsOutput