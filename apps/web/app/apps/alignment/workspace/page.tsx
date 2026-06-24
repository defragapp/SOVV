"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { InviteModal } from "@/components/spaces/InviteModal"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
}

function Section({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/[0.05] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">{label}</p>
      <p className="text-[15px] text-[#f4efe9] leading-[1.7]">{value}</p>
    </motion.div>
  )
}

export default function AlignmentWorkspacePage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [error, setError] = React.useState("")
  const [baselineStatements, setBaselineStatements] = React.useState<Array<{ statement: string; chips: string[] }>>([])
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)
  // Audio Overview
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  // Revoke audio blob on unmount
  React.useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }
  }, [audioUrl])


  // Prefill composer from ?prompt= query param
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const prompt = params.get("prompt")
      if (prompt) {
        setInput((prev) => prev || decodeURIComponent(prompt))
      }
    }
  }, [])

  // Load Baseline Design statements for sidebar
  React.useEffect(() => {
    fetch("/api/derive-profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : { statements: [] })
      .then((d: any) => { if (Array.isArray(d.statements) && d.statements.length > 0) setBaselineStatements(d.statements) })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    fetch("/api/library?workspace_source=ALIGNMENT", { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: any) => setLibrary(d.items || []))
      .catch(() => {})
      .finally(() => setLibraryLoading(false))
  }, [saveSuccess])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return
    setIsLoading(true)
    setError("")
    setSaveSuccess(false)
    setResult(null)
    try {
      const res = await fetch("/api/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === "daily_limit_reached"
          ? "You've reached your free daily limit. Upgrade to Pro to continue."
          : data.message || data.error || "Something went wrong.")
        return
      }
      setResult(data)
    } catch {
      setError("Unable to connect. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      const content = result.alignment || result.whatIsTrue || input.slice(0, 300)
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: input.slice(0, 60) + (input.length > 60 ? "…" : ""),
          content,
          payload: result,
          workspace_source: "ALIGNMENT",
        }),
      })
      if (!res.ok) throw new Error()
      setSaveSuccess(true)
    } catch { /* silent */ } finally {
      setIsSaving(false)
    }
  }


  const handleGenerateAudio = async () => {
    if (!result || isGeneratingAudio) return
    setIsGeneratingAudio(true)
    setAudioError("")
    try {
      const text = [
        result.whatIsTrue,
        result.whatIsYours,
        result.theShift,
        result.nextStep,
        result.alignment,
      ].filter(Boolean).join(" ")
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as any
        throw new Error(d.error || "Failed to generate audio")
      }
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

  // ─── LEFT PANEL ────────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">How Alignment works</p>
      </div>
      <div className="px-5 pt-6 pb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Baseline Design</p>
        {baselineStatements.length > 0 ? (
          <div className="flex flex-col gap-0">
            {baselineStatements.slice(0, 4).map(({ statement, chips }, i) => (
              <div key={i} className="py-3 border-b border-white/[0.04] last:border-0">
                <p className="text-[12px] text-[#c8c2bc] leading-[1.6] mb-2">{statement}</p>
                {chips.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {chips.map(chip => (
                      <span key={chip} className="font-mono text-[8px] tracking-[0.1em] px-2 py-0.5 border border-[#e0743a]/20 text-[#e0743a]/60 bg-[#e0743a]/[0.04]" style={{ borderRadius: "var(--radius-minimal)" }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p className="text-[10px] text-[#4f4b47] mt-3">Active in every result.</p>
          </div>
        ) : (
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Your Baseline Design is active — it grounds every Alignment result in how you actually operate.
          </p>
        )}
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <Link
            href="/apps/alignment"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            ← Back to Alignment
          </Link>
        </div>
      </div>
    </div>
  )

  // ─── RIGHT PANEL ───────────────────────────────────────────────────────────
  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Saved results</p>
      </div>

      {result && (
        <div className="px-5 pt-5 pb-5 border-b border-white/[0.06]">
          {/* Audio Overview */}
          {result.media?.audioOverviewAvailable && (
            <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-4" style={{ borderRadius: 10 }}>
              {!audioUrl && (
                <button onClick={handleGenerateAudio} disabled={isGeneratingAudio}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors">
                  <div className="w-5 h-5 border border-white/[0.12] flex items-center justify-center shrink-0" style={{ borderRadius: 4 }}>
                    <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor" className="text-[#a8a29a]">
                      <path d="M0 0.5L8 4.5L0 8.5V0.5Z"/>
                    </svg>
                  </div>
                  <span className="text-[12px] text-[#a8a29a]">{isGeneratingAudio ? "Generating…" : "Create Audio Overview"}</span>
                </button>
              )}
              {audioUrl && <audio ref={audioRef} src={audioUrl} controls preload="auto" className="w-full h-9 outline-none" />}
              {audioError && <p className="text-[11px] text-[#76716b] px-3.5 pb-2.5">{audioError}</p>}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-9 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium tracking-tight hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderRadius: 8 }}
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save to Library"}
          </button>
          <button
            onClick={() => setInviteOpen(true)}
            className="w-full h-8 border border-white/[0.08] text-[11px] text-[#76716b] hover:border-white/[0.16] hover:text-[#a8a29a] transition-colors mt-2"
            style={{ borderRadius: 6 }}
          >
            Invite Privately
          </button>
        </div>
      )}

      <div className="flex-1">
        {libraryLoading ? (
          <div className="flex justify-center py-10">
            <span className="w-4 h-4 border border-white/[0.15] border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <p className="text-[12px] text-[#76716b] leading-relaxed px-5 py-8 text-center">
            Saved sessions will appear here.
          </p>
        ) : (
          library.map(item => (
            <a
              key={item.id}
              href={`/apps/alignment/${item.id}`}
              className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#76716b]">Alignment</span>
                <span className="text-[10px] text-[#76716b]">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-[13px] text-[#a8a29a] group-hover:text-[#f4efe9] transition-colors leading-snug line-clamp-2">
                {item.title}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  )

  // ─── CENTER PANEL ──────────────────────────────────────────────────────────
  const main = (
    <div className="flex flex-col h-full">
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#f4efe9]">Alignment</span>
          <span className="text-[#4f4b47] text-[10px]">·</span>
          <span className="text-[11px] text-[#4f4b47]">What is yours. What isn't. One move.</span>
        </div>
        {result && (
          <span
            className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#e0743a]/60 border border-[#e0743a]/20 px-2 py-0.5"
            style={{ borderRadius: "var(--radius-minimal)" }}
          >
            Baseline Design active
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>

        {!result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center border border-[#e0743a]/20 bg-[#e0743a]/5 mb-2"
              style={{ borderRadius: 10 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="rgba(224,116,58,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="3" stroke="rgba(224,116,58,0.3)" strokeWidth="1"/>
              </svg>
            </div>
            <p className="text-[16px] text-[#f4efe9] font-normal leading-snug">
              What needs to be yours — and what doesn't?
            </p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">
              Describe the situation. Alignment separates what is yours to carry from what belongs to the other side — and shows you the clearest way to respond.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">Finding what is yours…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-6">
            <p className="text-[13px] text-[#a8a29a] leading-relaxed max-w-sm">{error}</p>
            {error.includes("daily limit") && (
              <a
                href="/pricing"
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-4 py-2 hover:border-white/[0.16]"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                See Pro plans →
              </a>
            )}
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[14px] border border-white/[0.08] bg-white/[0.02] p-8"
            >
              {result.skyContext && (
                <div className="mb-6 pb-6 border-b border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Live sky · right now</p>
                  <p className="text-[13px] text-[#76716b] leading-relaxed">{result.skyContext}</p>
                </div>
              )}
              <Section label="What is actually happening"              value={result.whatIsTrue} />
              <Section label="What is yours to carry"    value={result.whatIsYours} />
              <Section label="What is not yours to carry"          value={result.whatIsNotYours} />
              <Section label="What a clean response looks like" value={result.theShift} />
              <Section label="One move"                  value={result.nextStep} />
              <Section label="What to release"           value={result.avoid} />
              <Section label="What staying true looks like" value={result.alignment} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none px-6 pb-6">
        <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe what's pulling at you — a situation, a decision, a conflict."
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            style={{ fontSize: "16px" }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }
            }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.1em]">↵ Continue</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 border border-[#c8c2bc]/40 text-[#c8c2bc] text-[11px] font-medium tracking-[0.14em] hover:bg-[#c8c2bc]/10 hover:border-[#c8c2bc]/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              {isLoading ? "…" : "Find my lane"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
    <InviteModal
      open={inviteOpen}
      onClose={() => setInviteOpen(false)}
      workspaceSource="ALIGNMENT"
    />
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "thread",  label: "Alignment", content: main },
        { id: "context", label: "Context",   content: sidebar },
        { id: "library", label: "Library",   content: contextPanel },
      ]}
    />
  </>
  )
}