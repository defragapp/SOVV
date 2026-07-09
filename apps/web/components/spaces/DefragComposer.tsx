"use client"
import * as React from "react"

interface DefragComposerProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  baseline: boolean
  compareMode: boolean
  compareName: string
  onCompareModeToggle: () => void
  onCompareNameChange: (value: string) => void
  messageMode: boolean
  onMessageModeToggle: () => void
  showRelationshipToggle: boolean
}

export function DefragComposer({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  baseline,
  compareMode,
  compareName,
  onCompareModeToggle,
  onCompareNameChange,
  messageMode,
  onMessageModeToggle,
  showRelationshipToggle,
}: DefragComposerProps) {
  return (
    <div className={`flex-none px-6 pb-6 ${!baseline ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: "var(--radius-container)" }}>
        {compareMode && (
          <div className="px-5 pt-4 pb-0 border-b border-white/[0.05]">
            <input
              type="text"
              value={compareName}
              onChange={e => onCompareNameChange(e.target.value)}
              placeholder="Who is involved? Name or relation."
              className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] outline-none text-[13px] pb-3"
              style={{ fontSize: "16px" }}
            />
          </div>
        )}
        <textarea
          value={input}
          onChange={e => onInputChange(e.target.value)}
          placeholder={messageMode ? "Paste the message exactly as it was sent." : compareMode ? "Tell me what keeps happening between you." : "Tell me what happened."}
          rows={3}
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
          maxLength={2000}
          style={{ fontSize: "16px" }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit() } }}
        />
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em] uppercase">Enter to run · Shift+Enter for new line</span>
            {showRelationshipToggle && (
              <button
                type="button"
                onClick={onCompareModeToggle}
                className={`font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${compareMode ? "text-[#e0743a]/70" : "text-[#4f4b47] hover:text-[#76716b]"}`}
              >
                {compareMode ? "Solo mode" : "+ Relationship"}
              </button>
            )}
            <button
              type="button"
              onClick={onMessageModeToggle}
              className={`font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${messageMode ? "text-[#e0743a]/70" : "text-[#4f4b47] hover:text-[#76716b]"}`}
            >
              {messageMode ? "Clear" : "Read a message"}
            </button>
          </div>
          <button
            onClick={onSubmit}
            disabled={!input.trim() || isLoading}
            className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderRadius: "var(--radius-button)" }}
          >
            {isLoading ? "…" : "Understand"}
          </button>
        </div>
      </div>
    </div>
  )
}
