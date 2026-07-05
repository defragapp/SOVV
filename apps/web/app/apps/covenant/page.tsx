"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { motion, AnimatePresence } from "framer-motion"

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

function ScriptureChip({ text }: { text: string }) {
  if (!text) return null
  const bibleUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(text)}&version=NIV`
  return (
    <a
      href={bibleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block font-mono text-[8px] uppercase tracking-[0.12em] text-[#76716b] border border-white/[0.08] px-2 py-1 hover:text-[#a8a29a] hover:border-white/[0.16] transition-colors"
      style={{ borderRadius: 4 }}
    >
      {text} ↗
    </a>
  )
}

export default function CovenantPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/library?workspace_source=COVENANT", { credentials: "include" })
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
      const res = await fetch("/api/covenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          data.error === "subscription_required" ? "subscription_required" :
          data.message || data.error || "Something went wrong."
        )
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

  // ─── LEFT PANEL ────────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">How Covenant works</p>
      </div>
      <div className="px-5 pt-6 pb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">About Covenant</p>
        <p className="text-[12px] text-[#76716b] leading-relaxed mb-5">
          Covenant connects what you're walking through to the real human stories in Scripture. Your Baseline Design is already active — Covenant uses it to find the story that fits your moment.
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] mb-3">Patterns it recognizes</p>
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
              <span className="text-[11px] text-[#76716b]">{item.feeling}</span>
              <span className="text-[10px] text-[#a8a29a]">{item.figure}</span>
            </div>
          ))}
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
              href={`/apps/covenant/${item.id}`}
              className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#76716b]">Covenant</span>
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
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f4efe9]">Covenant</span>
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
            <p className="text-[16px] text-[#f4efe9] font-normal leading-snug">
              What are you walking through?
            </p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">
              Your Baseline Design is already active. Describe the moment — Covenant will find the story in Scripture that matches it.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-[13px] text-[#76716b]">Finding the story…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-[13px] text-[#a8a29a] text-center max-w-sm mx-auto leading-relaxed">
              {error === "subscription_required"
                ? "Covenant requires a Pro subscription."
                : error}
            </p>
            {error === "subscription_required" && (
              <a href="/pricing" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors border border-[#e0743a]/20 px-4 py-2" style={{ borderRadius: "var(--radius-button)" }}>
                Upgrade to Pro →
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
              className="border border-white/[0.08] bg-white/[0.02] p-8"
              style={{ borderRadius: "var(--radius-container)" }}
            >
              {/* Figure match */}
              {result.figure && (
                <div className="mb-6 pb-6 border-b border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">Your moment matches</p>
                  <p className="font-serif text-2xl text-[#f4efe9]">{result.figure}</p>
                  {result.reference && (
                    <p className="font-mono text-[10px] text-[#4f4b47] tracking-[0.12em] mt-1">{result.reference}</p>
                  )}
                </div>
              )}

              <Section label="The pattern you're in"   value={result.pattern} />
              <Section label="Their story"             value={result.story} />
              <Section label="What broke"              value={result.whatBroke} />
              <Section label="How God met them"        value={result.howGodMet} />
              <Section label="What they learned"       value={result.whatTheyLearned} />
              <Section label="What this means for you" value={result.forYou} />
              <Section label="One next step"           value={result.nextStep} />

              {result.scriptures?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Scripture to explore</p>
                  <div className="flex flex-wrap gap-2">
                    {result.scriptures.map((s: string, i: number) => (
                      <ScriptureChip key={i} text={s} />
                    ))}
                  </div>
                </div>
              )}

              {result.reflectionPrompts?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Carry with you</p>
                  <div className="flex flex-col gap-2">
                    {result.reflectionPrompts.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[#4f4b47] text-xs shrink-0 mt-0.5">—</span>
                        <p className="text-[12px] text-[#76716b] leading-relaxed">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none px-6 pb-6">
        <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: "var(--radius-container)" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe what you're walking through — Covenant will find the story in Scripture that matches it."
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }
            }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.1em]">↵ Run</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: 8 }}
            >
              {isLoading ? "…" : "Find the story"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
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
  )
}
