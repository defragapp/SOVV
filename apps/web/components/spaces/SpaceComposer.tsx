"use client"
import * as React from "react"

interface SpaceComposerProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  placeholder?: string
  submitLabel?: string
  maxLength?: number
  rows?: number
  disabled?: boolean
}

/**
 * SpaceComposer
 *
 * Shared composer component for Alignment, Covenant, and other spaces.
 * Handles textarea input, Enter-to-submit, and submit button.
 * State ownership stays in the parent page.
 */
export function SpaceComposer({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  placeholder = "Tell me what happened.",
  submitLabel = "Understand",
  maxLength = 2000,
  rows = 3,
  disabled = false,
}: SpaceComposerProps) {
  return (
    <div className="flex-none px-6 pb-6">
      <div
        className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors"
        style={{ borderRadius: 16 }}
      >
        <textarea
          value={input}
          onChange={e => onInputChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
          maxLength={maxLength}
          style={{ fontSize: "16px" }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if (!disabled && !isLoading && input.trim()) onSubmit()
            }
          }}
        />
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
          <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em] uppercase">
            Enter to run · Shift+Enter for new line
          </span>
          <button
            onClick={onSubmit}
            disabled={disabled || isLoading || !input.trim()}
            className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderRadius: "var(--radius-button)" }}
          >
            {isLoading ? "…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
