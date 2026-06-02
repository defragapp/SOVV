"use client"

import { useState } from "react"

export default function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-[#F6F5F3]/10 p-4"
    >
      <div className="flex items-start gap-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder="Tell me what's going on"
          rows={2}
          className="flex-1 resize-none bg-transparent text-sm font-light text-[#F6F5F3] placeholder:text-white/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="shrink-0 border border-[#F6F5F3]/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#F6F5F3] transition-colors hover:bg-[#F6F5F3]/5 disabled:opacity-30"
        >
          Send
        </button>
      </div>
    </form>
  )
}
