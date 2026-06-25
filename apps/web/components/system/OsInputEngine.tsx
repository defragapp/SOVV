"use client"

/**
 * OsInputEngine
 *
 * The unified input surface for Sovereign.os.
 * Supports freeform textarea and guided preset chips.
 * Integrates with systemStore for OS-level state persistence.
 * Does NOT make API calls -- calls onSubmit and lets the parent handle auth/tier.
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSystemStore } from "@/state/systemStore"
import type { OsSpace } from "@/state/systemStore"

const ease = [0.16, 1, 0.3, 1] as const

interface OsInputEngineProps {
  space: OsSpace
  inputType?: "freeform" | "guided" | "both"
  presetOptions?: string[]
  placeholder?: string
  onSubmit: (input: { type: "freeform"; rawText: string } | { type: "preset"; selectedPreset: string }) => void
  isProcessing?: boolean
  disabled?: boolean
  compact?: boolean
}

const SPACE_PLACEHOLDERS: Record<OsSpace, string> = {
  defrag: "Describe the moment. What happened, what was said, what you're carrying.",
  alignment: "What's pulling you off course right now?",
  covenant: "What are you walking through?",
}

const SPACE_LABELS: Record<OsSpace, string> = {
  defrag: "Before you move",
  alignment: "Find what belongs to you",
  covenant: "Find the story",
}

export function OsInputEngine({
  space,
  inputType = "freeform",
  presetOptions = [],
  placeholder,
  onSubmit,
  isProcessing = false,
  disabled = false,
  compact = false,
}: OsInputEngineProps) {
  const [text, setText] = React.useState("")
  const [activePreset, setActivePreset] = React.useState<string | null>(null)
  const { setInput, setSpace, setProcessing } = useSystemStore()

  const resolvedPlaceholder = placeholder ?? SPACE_PLACEHOLDERS[space]

  const handleFreeformSubmit = () => {
    if (!text.trim() || isProcessing || disabled) return
    const input = { type: "freeform" as const, rawText: text.trim() }
    setSpace(space)
    setInput({ ...input, space, submittedAt: new Date().toISOString() })
    setProcessing(true)
    onSubmit(input)
  }

  const handlePresetSubmit = (preset: string) => {
    if (isProcessing || disabled) return
    setActivePreset(preset)
    const input = { type: "preset" as const, selectedPreset: preset }
    setSpace(space)
    setInput({ ...input, space, submittedAt: new Date().toISOString() })
    setProcessing(true)
    onSubmit(input)
  }

  return (
    <div className={compact ? "" : "space-y-3"}>

      {(inputType === "guided" || inputType === "both") && presetOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presetOptions.map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ opacity: 0.85 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePresetSubmit(opt)}
              disabled={isProcessing || disabled}
              className={`px-3 py-2 text-[12px] font-mono tracking-[0.1em] border transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${
                activePreset === opt
                  ? "border-[#c8c2bc]/60 text-[#f4efe9] bg-white/[0.06]"
                  : "border-white/[0.10] text-[#76716b] hover:border-white/[0.20] hover:text-[#a8a29a]"
              }`}
              style={{ borderRadius: 2 }}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      )}

      {(inputType === "freeform" || inputType === "both") && (
        <div
          className="border border-white/[0.10] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.18] transition-colors duration-200"
          style={{ borderRadius: 4 }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={resolvedPlaceholder}
            disabled={isProcessing || disabled}
            rows={compact ? 2 : 3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] leading-[1.7] disabled:opacity-40"
            style={{ padding: compact ? "10px 14px" : "14px 16px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleFreeformSubmit()
              }
            }}
          />

          <div
            className="flex items-center justify-between border-t border-white/[0.06]"
            style={{ padding: compact ? "6px 14px" : "8px 16px" }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
              {isProcessing ? "Processing..." : "Enter to continue"}
            </span>

            <button
              onClick={handleFreeformSubmit}
              disabled={!text.trim() || isProcessing || disabled}
              className="h-7 px-4 text-[11px] font-medium tracking-[0.08em] border border-[#c8c2bc]/30 text-[#c8c2bc] hover:bg-[#c8c2bc]/10 hover:border-[#c8c2bc]/50 transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ borderRadius: 2 }}
            >
              {isProcessing ? "..." : SPACE_LABELS[space]}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default OsInputEngine