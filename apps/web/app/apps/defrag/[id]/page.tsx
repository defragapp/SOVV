"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"

// ─── Canonical section labels — must match ResultCard.tsx ─────────────────────
const SECTION_MAP: Array<{ key: string; label: string; highlight?: boolean }> = [
  { key: "activePattern",         label: "What's active" },
  { key: "theRepeat",             label: "You" },
  { key: "oldRole",               label: "Them" },
  { key: "whatYouLearnedToCarry", label: "What forms between you" },
  { key: "strainPattern",         label: "Why it's sharper now" },
  { key: "alignment",             label: "What changes this" },
  { key: "giftUnderStrain",       label: "What changes this" }, // fallback
]

function Section({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`border-b border-white/[0.05] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0 ${highlight ? "bg-white/[0.02] -mx-6 px-6 py-4 rounded-none" : ""}`}
    >
      <p className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-2 ${highlight ? "text-[#e0743a]/60" : "text-[#4f4b47]"}`}>
        {label}
      </p>
      <p className={`text-[14px] leading-[1.7] ${highlight ? "text-[#f4efe9]" : "text-[#f4efe9]"}`}>
        {value}
      </p>
    </motion.div>
  )
}

export default function DefragItemPage() {
  const params = useParams()
  const id = params.id as string

  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [savedTitle, setSavedTitle] = React.useState("")
  const [savedDate, setSavedDate] = React.useState("")
  const [initialLoading, setInitialLoading] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  React.useEffect(() => {
    fetch(`/api/library/${id}`, { credentials: "include" })
      .then(r => {
        if (r.status === 403) throw new Error("Pro subscription required to access Library.")
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then(d => {
        if (d.payload) {
          const parsed = typeof d.payload === "string" ? JSON.parse(d.payload) : d.payload
          setResult(parsed)
        }
        setSavedTitle(d.title || "")
        setSavedDate(d.created_at ? new Date(d.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "")
      })
      .catch(e => setError(e.message))
      .finally(() => setInitialLoading(false))
  }, [id])

  React.useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }
  }, [audioUrl])

  const handleUpdate = async () => {
    if (!input.trim() || !result) return
    setIsLoading(true)
    setError("")
    try {
      const message = `Previous context — Active pattern: ${result.activePattern}. What changes this: ${result.alignment}.\n\nUpdate: ${input}`
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Failed to update")
      setResult(data)
      setInput("")
      setAudioUrl(null)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!result || isGeneratingAudio) return
    setIsGeneratingAudio(true)
    setAudioError("")
    try {
      const text = [result.activePattern, result.theRepeat, result.alignment,
        typeof result.bestNextResponse === "object" ? result.bestNextResponse?.summary : result.bestNextResponse]
        .filter(Boolean).join(" ")
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})) as any; throw new Error(d.error || "Failed") }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      requestAnimationFrame(() => { audioRef.current?.play().catch(() => {}) })
    } catch (err: any) {
      setAudioError(err.message || "Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  // ─── Sidebar ──────────────────────────────────────────────────────────────

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Saved result</p>
      </div>
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        {savedDate && (
          <p className="font-mono text-[9px] text-[#4f4b47] mb-3">{savedDate}</p>
        )}
        {savedTitle && (
          <p className="text-[13px] text-[#a8a29a] leading-relaxed">{savedTitle}</p>
        )}
        <p className="text-[11px] text-[#4f4b47] leading-relaxed mt-3">
          You are viewing a saved session. Add an update below to continue the thread.
        </p>
      </div>
      <div className="px-5 pt-4">
        <Link
          href="/app"
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
        >
          ← Library
        </Link>
      </div>
    </div>
  )

  // ─── Right panel ──────────────────────────────────────────────────────────

  const contextPanel = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Audio</p>
      </div>
      {result && (
        <div className="px-5 pt-5">
          <div className="border border-white/[0.07] bg-white/[0.02] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {!audioUrl ? (
              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors disabled:opacity-40"
              >
                <div className="w-5 h-5 border border-white/[0.12] flex items-center justify-center shrink-0 text-[#a8a29a] text-[9px]" style={{ borderRadius: "50%" }}>▶</div>
                <span className="text-[12px] text-[#a8a29a]">{isGeneratingAudio ? "Generating…" : "Generate audio overview"}</span>
              </button>
            ) : (
              <audio ref={audioRef} src={audioUrl} controls preload="auto" className="w-full h-9 outline-none block" style={{ opacity: 0.75 }} />
            )}
            {audioError && <p className="text-[11px] text-[#76716b] px-4 pb-3">{audioError}</p>}
          </div>
        </div>
      )}
    </div>
  )

  // ─── Main ─────────────────────────────────────────────────────────────────

  const main = (
    <div className="flex flex-col h-full">
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#f4efe9]">Defrag</span>
        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#e0743a]/50 border border-[#e0743a]/20 px-2 py-0.5" style={{ borderRadius: "var(--radius-minimal)" }}>
          Saved
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>
        {initialLoading && (
          <div className="flex items-center justify-center h-full">
            <span className="w-4 h-4 border border-white/[0.15] border-t-white/40 rounded-full animate-spin" />
          </div>
        )}

        {!initialLoading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-[14px] text-[#a8a29a]">{error}</p>
            <Link href="/app" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#a8a29a] transition-colors">
              ← Back to Library
            </Link>
          </div>
        )}

        {!initialLoading && result && (
          <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {/* Card header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#08070a]/60">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Sovereign.os</span>
                <span className="text-[#4f4b47] text-xs">/</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8a29a]">Defrag</span>
              </div>
              {savedDate && (
                <span className="font-mono text-[9px] text-[#4f4b47]">{savedDate}</span>
              )}
            </div>

            {/* Saved input */}
            {savedTitle && (
              <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">You described</p>
                <p className="text-[13px] text-[#76716b] leading-relaxed italic">"{savedTitle}"</p>
              </div>
            )}

            {/* Sections — canonical labels, sparse rendering */}
            <div className="px-6 py-6">
              {SECTION_MAP.map(({ key, label }) => {
                const value = result[key]
                if (!value) return null
                // Skip giftUnderStrain if alignment already rendered
                if (key === "giftUnderStrain" && result.alignment) return null
                return <Section key={key} label={label} value={value} />
              })}

              {/* Next move */}
              {result.bestNextResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-white/[0.06] pt-5 mt-5"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-3">Next move</p>
                  <p className="text-[14px] text-[#f4efe9] leading-[1.7]">
                    {typeof result.bestNextResponse === "string"
                      ? result.bestNextResponse
                      : result.bestNextResponse.summary}
                  </p>
                  {typeof result.bestNextResponse === "object" && result.bestNextResponse.phrasing?.length > 0 && (
                    <div className="mt-4 border border-white/[0.06] bg-white/[0.02] p-4" style={{ borderRadius: "var(--radius-container)" }}>
                      {result.bestNextResponse.phrasing.map((phrase: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-[13px] text-[#a8a29a] leading-relaxed py-2.5 border-b border-white/[0.04] last:border-0 last:pb-0 cursor-pointer hover:text-[#f4efe9] transition-colors"
                          onClick={() => navigator.clipboard.writeText(phrase)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="text-[#4f4b47] shrink-0 mt-0.5 select-none">↳</span>
                          <span className="flex-1">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update composer — continue the thread */}
      {result && (
        <div className="flex-none px-6 pb-6">
          <div
            className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors"
            style={{ borderRadius: "var(--radius-container)" }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Update the situation — what happened next?"
              rows={2}
              className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
              style={{ fontSize: "16px" }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleUpdate() } }}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
              <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em] uppercase">Continue the thread</span>
              <button
                onClick={handleUpdate}
                disabled={!input.trim() || isLoading}
                className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {isLoading ? "…" : "Update"}
              </button>
            </div>
            {error && <p className="text-[12px] text-[#a8a29a] px-5 pb-3">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebar}
      main={main}
      contextPanel={contextPanel}
      mobileTabs={[
        { id: "result", label: "Result", content: main },
        { id: "context", label: "Context", content: sidebar },
        { id: "audio", label: "Audio", content: contextPanel },
      ]}
    />
  )
}