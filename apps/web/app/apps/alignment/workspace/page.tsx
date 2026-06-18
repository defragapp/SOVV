"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
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

export default function AlignmentWorkspacePage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

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
        setError(data.message || data.error || "Something went wrong.")
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

  // ─── LEFT PANEL ────────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Context</p>
      </div>
      <div className="px-5 pt-6 pb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-3">About Alignment</p>
        <p className="text-[12px] text-[#76716b] leading-relaxed mb-5">
          Your Baseline Design is your fixed center — how you naturally operate. The live sky is the emotional weather you're moving through right now. Alignment uses both to show you the path back to yourself.
        </p>
        <div className="space-y-3">
          {[
            "What is actually true in this situation",
            "What is yours to carry — and what isn't",
            "The one move that would shift things",
            "What to avoid doing right now",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="text-[#e0743a]/40 text-[10px] mt-0.5 shrink-0">→</span>
              <span className="text-[12px] text-[#76716b] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <Link
            href="/apps/alignment"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            ← Your alignment brief
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
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-9 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium tracking-tight hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderRadius: 8 }}
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save to Library"}
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
      <div className="h-11 px-6 flex items-center border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4efe9]">Alignment</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>

        {!result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center border border-[#e0743a]/20 bg-[#e0743a]/5 mb-2"
              style={{ borderRadius: 10, boxShadow: "0 0 24px rgba(224,116,58,0.08)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="rgba(224,116,58,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="3" stroke="rgba(224,116,58,0.3)" strokeWidth="1"/>
              </svg>
            </div>
            <p className="text-[16px] text-[#f4efe9] font-normal leading-snug">
              What's pulling you off course?
            </p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">
              Your Baseline Design and the live sky are already active. Describe what's happening — Alignment will show you the path back.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-[13px] text-[#76716b]">Finding your path…</p>
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
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8"
            >
              {result.skyContext && (
                <div className="mb-6 pb-6 border-b border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Live sky · right now</p>
                  <p className="text-[13px] text-[#76716b] leading-relaxed">{result.skyContext}</p>
                </div>
              )}
              <Section label="What is true"              value={result.whatIsTrue} />
              <Section label="What is yours to carry"    value={result.whatIsYours} />
              <Section label="What isn't yours"          value={result.whatIsNotYours} />
              <Section label="The shift"                 value={result.theShift} />
              <Section label="One next step"             value={result.nextStep} />
              <Section label="What to avoid"             value={result.avoid} />
              <Section label="Your alignment"            value={result.alignment} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none px-6 pb-6">
        <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What's pulling you off course?"
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }
            }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.08em]">↵ Run</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: 8 }}
            >
              {isLoading ? "…" : "Align"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
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
  )
}
