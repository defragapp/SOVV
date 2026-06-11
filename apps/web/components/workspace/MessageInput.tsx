"use client"

import { useRef, useState } from "react"

export default function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    // Auto-grow textarea
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-border p-4"
      aria-label="Send a message"
    >
      <div className="flex items-end gap-3">
        <label htmlFor="message-input" className="sr-only">
          Describe what is happening
        </label>
        <textarea
          id="message-input"
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Start with what is happening now."
          rows={2}
          disabled={disabled}
          aria-disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm font-light text-foreground placeholder:text-white/20 focus:outline-none disabled:opacity-40 leading-6"
          style={{ minHeight: "3rem", maxHeight: "10rem" }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="shrink-0 border border-border-hover px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-foreground transition-colors hover:bg-[#F6F5F3]/5 disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40"
        >
          Send
        </button>
      </div>
      <p className="mt-2 font-mono text-[8px] uppercase tracking-widest text-white/15">
        Enter to send · Shift+Enter for new line
      </p>
    </form>
  )
}