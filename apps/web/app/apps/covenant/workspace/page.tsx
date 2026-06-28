"use client"
import * as React from "react"
import { processInput } from "@/lib/system/processInput"
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
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-2">{label}</p>
      <p className="text-[15px] text-[#f4efe9] leading-[1.7]">{value}</p>
    </motion.div>
  )
}

function ScriptureChip({ text }: { text: string }) {
  return (
    <span
      className="inline-block font-mono text-[8px] uppercase tracking-[0.12em] text-[#76716b] border border-white/[0.08] px-2 py-1"
      style={{ borderRadius: 4 }}
    >
      {text}
    </span>
  )
}

export default function CovenantWorkspacePage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [error, setError] = React.useState("")
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)
  const [patterns, setPatterns] = React.useState<Array<{ key: string; value: string }>>([])
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

  React.useEffect(() => {
    fetch("/api/library?workspace_source=COVENANT", { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: any) => setLibrary(d.items || []))
      .catch(() => {})
      .finally(() => setLibraryLoading(false))

    fetch("/api/patterns", { credentials: "include" })
      .then(r => r.ok ? r.json() : { patterns: [] })
      .then((d: any) => setPatterns((d.patterns || []).slice(0, 5)))
      .catch(() => {})
  }, [saveSuccess])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return
    setIsLoading(true)
    setError("")
    setSaveSuccess(false)
    setResult(null)
    try {
      const pResult = await processInput({ space: "covenant", message: input })
      if (!pResult.ok) {
        setError(pResult.error)
        return
      }
      setResult(pResult.output.meta as any)
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
      const content = result.forYou || result.pattern || input.slice(0, 300)
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: input.slice(0, 60) + (input.length > 60 ? "…" : ""),
          content,
          payload: result,
          workspace_source: "COVENANT",
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
      // Story-led audio — no raw baseline, no birth data
      const text = [
        result.story,
        result.forYou,
        result.nextStep,
        result.pattern,
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
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Context</p>
      </div>
      <div className="px-5 pt-6 pb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50 mb-3">How this works</p>
        <p className="text-[12px] text-[#4f4b47] leading-relaxed mb-5">
          Covenant connects what you're walking through to the real human stories in Scripture. Your Baseline Design is already active — Covenant uses it to find the story that fits your moment.
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#2e2b28] mb-3">Patterns it recognizes</p>
        <div className="flex flex-col gap-0">
          {[
            { feeling: "Misunderstood", figure: "Joseph" },
            { feeling: "Betrayed", figure: "David" },
            { feeling: "Overwhelmed", figure: "Moses" },
            { feeling: "Tested", figure: "Job" },
            { feeling: "Unseen", figure: "Hagar" },
            { feeling: "Stuck", figure: "Abraham" },
            { feeling: "Loyal but tired", figure: "Ruth" },
            { feeling: "Called to rebuild", figure: "Nehemiah" },
          ].map((item) => (
            <div key={item.feeling} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
              <span className="text-[11px] text-[#3a3733]">{item.feeling}</span>
              <span className="text-[10px] text-[#4f4b47]">{item.figure}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-white/[0.04]">
          <Link href="/apps/covenant" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#3a3733] hover:text-[#76716b] transition-colors">
            ← Covenant overview
          </Link>
        </div>
      </div>
    </div>
  )

  // ─── RIGHT PANEL ───────────────────────────────────────────────────────────
  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Library</p>
      </div>

      {result && (
        <div className="px-5 pt-5 pb-5 border-b border-white/[0.06]">
          {/* Audio Overview — story-led, not sermon-like */}
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
          <p className="text-[12px] text-[#3a3733] leading-relaxed px-5 py-8 text-center">Saved sessions will appear here.</p>
        ) : (
          library.map(item => (
            <a key={item.id} href={`/apps/covenant/${item.id}`}
              className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#4f4b47]">Covenant</span>
                <span className="text-[10px] text-[#4f4b47]">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-[13px] text-[#a8a29a] group-hover:text-[#f4efe9] transition-colors leading-snug line-clamp-2">{item.title}</p>
            </a>
          ))
        )}
      </div>
    </div>
  )

  // ─── CENTER PANEL ──────────────────────────────────────────────────────────
  const main = (
    <div className="flex flex-col h-full">
      <div className="h-11 px-6 flex items-center border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4efe9]">Covenant</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>

        {!result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center border border-[#e0743a]/20 bg-[#e0743a]/5 mb-2"
              style={{ borderRadius: 10, boxShadow: "0 0 24px rgba(224,116,58,0.08)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="rgba(224,116,58,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[16px] text-[#f4efe9] font-normal leading-snug">Before you move.</p>
            <p className="text-[13px] text-[#4f4b47] leading-relaxed max-w-xs">
              Your Baseline Design is already active. Describe the moment — Covenant will find the story in Scripture that matches it.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-[13px] text-[#4f4b47]">Looking for the story…</p>
          </div>
        )}

        {error && (
          <p className="text-[13px] text-[#a8a29a] text-center py-8 max-w-sm mx-auto leading-relaxed">{error}</p>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="border border-white/[0.08] bg-white/[0.02] overflow-hidden"
              style={{ borderRadius: 16 }}
            >
              {/* Figure match header */}
              {result.figure && (
                <div className="px-6 py-5 border-b border-white/[0.06] bg-[#08070a]/40">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/50 mb-2">Your moment matches</p>
                  <p className="font-serif text-2xl text-[#f4efe9]">{result.figure}</p>
                  {result.reference && (
                    <p className="font-mono text-[10px] text-[#3a3733] tracking-[0.12em] mt-1">{result.reference}</p>
                  )}
                </div>
              )}

              {/* Story sections */}
              <div className="px-6 py-6">
                <Section label="The pattern you're in"   value={result.pattern} />
                <Section label="Their story"             value={result.story} />
                <Section label="What broke"              value={result.whatBroke} />
                <Section label="How God met them"        value={result.howGodMet} />
                <Section label="What they learned"       value={result.whatTheyLearned} />
                <Section label="What this means for you" value={result.forYou} />
                <Section label="One next step"           value={result.nextStep} />

                {/* Scripture chips */}
                {result.scriptures?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3a3733] mb-3">Scripture to explore</p>
                    <div className="flex flex-wrap gap-2">
                      {result.scriptures.map((s: string, i: number) => <ScriptureChip key={i} text={s} />)}
                    </div>
                  </div>
                )}

                {/* Reflection prompts */}
                {result.reflectionPrompts?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3a3733] mb-3">Carry with you</p>
                    <div className="flex flex-col gap-2">
                      {result.reflectionPrompts.map((p: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-[#e0743a]/30 text-xs shrink-0 mt-0.5">—</span>
                          <p className="text-[12px] text-[#4f4b47] leading-relaxed">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="flex-none px-6 pb-6">
        <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What does this moment mean in the larger story?"
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            onFocus={e => { setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300) }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.08em]">↵ Run</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 border border-[#c8c2bc]/40 text-[#c8c2bc] text-[11px] font-medium tracking-wide hover:bg-[#c8c2bc]/10 hover:border-[#c8c2bc]/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: 2 }}
            >
              {isLoading ? "…" : "Find the story"}
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
      workspaceSource="COVENANT"
    />
    <SpaceShell
      spaceName="Covenant"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "thread",  label: "Covenant", content: main },
        { id: "context", label: "Context",  content: sidebar },
        { id: "library", label: "Library",  content: contextPanel },
      ]}
    />
  </>
  )
}