"use client"
import * as React from "react"
import { processInput } from "@/lib/system/processInput"
import { OsOutput } from "@/components/system/OsOutput"
import type { SystemOutput } from "@/lib/system/outputContract"
import { SpaceShell } from "@/components/spaces/space-shell"
import { InviteModal } from "@/components/spaces/InviteModal"
import { ResultCard } from "@/components/spaces/ResultCard"
import Link from "next/link"

// ─── Types ─────────────────────────────────────────────────────────────────

interface Baseline {
  dob: string
  tob: { type: "exact" | "approx"; value: string }
  pob: string
}

interface BaselineStatement {
  statement: string
  chips: string[]
}

interface DefragResult {
  activePattern?: string
  theRepeat?: string
  oldRole?: string
  whatYouLearnedToCarry?: string
  strainPattern?: string
  giftUnderStrain?: string
  alignment?: string
  bestNextResponse?: { summary?: string; phrasing?: string[] } | string
  conversationalSteering?: { do?: string[]; avoid?: string[] }
  summary?: string
  sourcesUsed?: { baseline?: boolean; history?: boolean; invitedUsers?: boolean }
  media?: { audioOverviewAvailable?: boolean; watchPreviewAvailable?: boolean }
}

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatBirthSummary(baseline: Baseline): string {
  const dob = baseline.dob
  const tob = baseline.tob.value
  const pob = baseline.pob.split(",")[0]
  return `${dob} · ${tob} · ${pob}`
}

function GateChip({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: "9px",
        fontFamily: "'Inter',sans-serif",
        letterSpacing: "0.10em",
        padding: "2px 8px",
        borderRadius: "4px",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#76716b",
        whiteSpace: "nowrap" as const,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DefragWorkspacePage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<DefragResult | null>(null)
  const [systemOutput, setSystemOutput] = React.useState<SystemOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)

  // Baseline
  const [baseline, setBaseline] = React.useState<Baseline | null>(null)
  const [baselineLoading, setBaselineLoading] = React.useState(true)
  const [baselineStatements, setBaselineStatements] = React.useState<BaselineStatement[]>([])
  const [statementsLoading, setStatementsLoading] = React.useState(false)

  // Audio
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  // Library
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)
  const [patterns, setPatterns] = React.useState<Array<{ key: string; value: string }>>([])
  const [sessionResultCount, setSessionResultCount] = React.useState(0)
  const [showUpgradeNudge, setShowUpgradeNudge] = React.useState(false)
  const [compareMode, setCompareMode] = React.useState(false)
  const [compareName, setCompareName] = React.useState("")

  // Load baseline
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
    fetch("/api/baseline", { credentials: "include" })
      .then(r => (r.ok ? r.json() : { baseline: null }))
      .then((d: any) => { setBaseline(d.baseline ?? null) })
      .catch(() => {})
      .finally(() => setBaselineLoading(false))
  }, [])

  // Load derive-profile statements
  React.useEffect(() => {
    if (!baseline) return
    setStatementsLoading(true)
    fetch("/api/derive-profile", { credentials: "include" })
      .then(r => (r.ok ? r.json() : { statements: [] }))
      .then((d: any) => { if (Array.isArray(d.statements) && d.statements.length > 0) setBaselineStatements(d.statements) })
      .catch(() => {})
      .finally(() => setStatementsLoading(false))
  }, [baseline])

  // Revoke audio blob
  React.useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }
  }, [audioUrl])

  // Load library
  React.useEffect(() => {
    setLibraryLoading(true)
    fetch("/api/library?workspace_source=DEFRAG", { credentials: "include" })
      .then(r => (r.ok ? r.json() : { items: [] }))
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
    setAudioUrl(null)
    setAudioError("")
    setResult(null)
    setSystemOutput(null)
    try {
      const pResult = await processInput({
        space: "defrag",
        message: input,
        ...(compareMode && compareName.trim() ? {
          target: { id: "compare", relation: compareName.trim() },
          context: { targetName: compareName.trim() },
        } : {}),
      })
      if (!pResult.ok) {
        setError(pResult.error)
        return
      }
      setResult(pResult.output.meta as any)
      setSystemOutput(pResult.output)
      // Show upgrade nudge after 3rd result on free tier
      setSessionResultCount(prev => {
        const next = prev + 1
        if (next === 3) setShowUpgradeNudge(true)
        return next
      })
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
      const content = result.summary || result.activePattern ||
        (typeof result.bestNextResponse === "string" ? result.bestNextResponse : result.bestNextResponse?.summary) ||
        input.slice(0, 300)
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: input.slice(0, 60) + (input.length > 60 ? "…" : ""),
          content,
          payload: result,
          workspace_source: "DEFRAG",
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
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: [result.activePattern, result.theRepeat, result.oldRole, result.giftUnderStrain,
            typeof result.bestNextResponse === "object" ? result.bestNextResponse?.summary : result.bestNextResponse]
            .filter(Boolean).join(" "),
        }),
      })
      if (!res.ok) { const d = (await res.json().catch(() => ({}))) as any; throw new Error(d.error || "Failed to generate audio") }
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

  // ─── LEFT PANEL — Context ──────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Context</p>
      </div>

      {/* Baseline Design */}
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.04em] text-[#a8a29a]">Your Design</p>
          {baseline && (
            <span className="text-[10px] text-[#4f4b47]" style={{ fontFamily: "'Inter',sans-serif" }}>
              {formatBirthSummary(baseline)}
            </span>
          )}
        </div>

        {baselineLoading ? (
          <span className="w-3.5 h-3.5 border border-white/[0.15] border-t-white/40 rounded-full animate-spin block" />
        ) : baseline ? (
          <>
            {statementsLoading ? (
              <span className="w-3.5 h-3.5 border border-white/[0.15] border-t-white/40 rounded-full animate-spin block" />
            ) : (
              <div className="flex flex-col">
                {baselineStatements.map(({ statement, chips }, i) => (
                  <div key={i} className="py-2.5 border-b border-white/[0.04] last:border-0">
                    <p className="text-[12px] text-[#c8c2bc] leading-[1.65] mb-1.5">{statement}</p>
                    <div className="flex gap-1 flex-wrap">
                      {chips.map(chip => <GateChip key={chip} label={chip} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-white/[0.04]">
              <p className="text-[10px] text-[#4f4b47]">Active in every session.</p>
              <a href="/settings" className="text-[10px] text-[#76716b] hover:text-[#a8a29a] transition-colors font-mono uppercase tracking-[0.08em]">Edit</a>
            </div>
          </>
        ) : (
          <div className="border border-white/[0.08] bg-[#111010] p-4" style={{ borderRadius: 10 }}>
            <p className="text-[11px] font-medium text-[#a8a29a] mb-1">Required to run</p>
            <p className="text-[12px] text-[#76716b] leading-relaxed mb-3">Add your date, time, and place of birth to begin.</p>
            <a href="/settings" className="inline-flex h-8 px-4 bg-[#f4efe9] text-[#08070a] text-[11px] font-medium items-center hover:opacity-90 transition-opacity" style={{ borderRadius: 8 }}>
              Add birth data →
            </a>
          </div>
        )}
      </div>

      {/* What you've brought before */}
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        <p className="font-mono text-[9px] uppercase tracking-[0.04em] text-[#a8a29a] mb-3">What you've brought before</p>
        {result?.sourcesUsed?.history ? (
          <p className="text-[12px] text-[#76716b] leading-relaxed">Past patterns were used in this result.</p>
        ) : (
          <p className="text-[12px] text-[#76716b] leading-relaxed">Past patterns will appear here after your first result.</p>
        )}
      </div>

      {/* Pattern history */}
      {patterns.length > 0 && (
        <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Patterns</p>
          <div className="flex flex-col gap-2">
            {patterns.map((p, i) => (
              <p key={i} className="text-[11px] text-[#76716b] leading-relaxed line-clamp-2">
                {p.value}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Back to entry */}
      <div className="px-5 pt-5">
        <Link href="/apps/defrag" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
          ← Back to Defrag
        </Link>
      </div>
    </div>
  )

  // ─── RIGHT PANEL — Library ─────────────────────────────────────────────────
  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Library</p>
      </div>

      {result && (
        <div className="px-5 pt-5 pb-5 border-b border-white/[0.06]">
          {/* Audio */}
          {result.media?.audioOverviewAvailable && (
            <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-4" style={{ borderRadius: 10 }}>
              {!audioUrl && (
                <button onClick={handleGenerateAudio} disabled={isGeneratingAudio}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors disabled:opacity-40">
                  <div className="w-5 h-5 border border-white/[0.12] flex items-center justify-center shrink-0 text-[#a8a29a] text-[9px]" style={{ borderRadius: "50%" }}>▶</div>
                  <span className="text-[12px] text-[#a8a29a]">{isGeneratingAudio ? "Generating…" : "Generate audio"}</span>
                </button>
              )}
              {audioUrl && <audio ref={audioRef} src={audioUrl} controls preload="auto" className="w-full h-9 outline-none block" style={{ opacity: 0.75 }} />}
              {audioError && <p className="text-[11px] text-[#76716b] px-3.5 pb-2.5">{audioError}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex-1">
        {libraryLoading ? (
          <div className="flex justify-center py-10">
            <span className="w-4 h-4 border border-white/[0.15] border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <p className="text-[12px] text-[#76716b] leading-relaxed px-5 py-8 text-center">Saved results will appear here.</p>
        ) : (
          library.map(item => (
            <a key={item.id} href={`/apps/defrag/${item.id}`}
              className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.04em] text-[#76716b]">Defrag</span>
                <span className="text-[10px] text-[#76716b]">
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

  // ─── CENTER PANEL — Thread ─────────────────────────────────────────────────
  const main = (
    <div className="flex flex-col h-full">
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4efe9]">Defrag</span>
        {result?.sourcesUsed && (
          <div className="flex items-center gap-2">
            {result.sourcesUsed.baseline && (
              <span className="text-[10px] text-[#76716b] border border-white/[0.10] px-2.5 py-0.5" style={{ borderRadius: 4 }}>Birth data ✓</span>
            )}
            {result.sourcesUsed.history && (
              <span className="text-[10px] text-[#76716b] border border-white/[0.10] px-2.5 py-0.5" style={{ borderRadius: 4 }}>What you've brought before ✓</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>

        {!baselineLoading && !baseline && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3">
            <p className="text-[15px] font-medium text-[#a8a29a]">Your Baseline Design is needed to begin.</p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">Add your date, time, and place of birth in the Context panel on the left.</p>
          </div>
        )}

        {baseline && !result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-2">
            <p className="text-[16px] text-[#f4efe9] font-normal leading-snug">Before you move.</p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">Describe what's happening. Be as specific or as brief as you want.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-white/[0.45] rounded-full animate-spin" />
            <p className="text-[13px] text-[#76716b]">Looking at what's here…</p>
          </div>
        )}

        {error && error !== "needs_baseline" && (
          <p className="text-[13px] text-[#a8a29a] text-center py-8 max-w-sm mx-auto leading-relaxed">{error}</p>
        )}

        {showUpgradeNudge && (
          <div className="mx-6 mb-4 border border-[#e0743a]/20 bg-[#e0743a]/[0.04] px-4 py-3 flex items-center justify-between" style={{ borderRadius: 8 }}>
            <p className="text-[12px] text-[#a8a29a] leading-relaxed">
              Unlock Covenant, Alignment, and unlimited sessions.
            </p>
            <a
              href="/pricing"
              className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors ml-4 shrink-0"
            >
              Upgrade →
            </a>
          </div>
        )}

        {systemOutput && result && (
          <OsOutput
            output={systemOutput}
            rail={(result as any).rail}
            flow={(result as any).flow}
            sourcesUsed={(result as any).sourcesUsed}
            actions={
              <div className="px-5 py-3 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors disabled:opacity-40"
                >
                  {saveSuccess ? "Saved" : isSaving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setInviteOpen(true)}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
                >
                  + Compare
                </button>
              </div>
            }
          />
        )}
      </div>

      <div className={`flex-none px-6 pb-6 ${!baseline ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: 16 }}>
          {compareMode && (
            <div className="px-5 pt-4 pb-0 border-b border-white/[0.05]">
              <input
                type="text"
                value={compareName}
                onChange={e => setCompareName(e.target.value)}
                placeholder="Who are you comparing with? (name or relation)"
                className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] outline-none text-[13px] pb-3"
              />
            </div>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="I need clarity on something."
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            onFocus={e => { setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300) }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setCompareMode(m => !m); setCompareName("") }}
                className={`font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${compareMode ? 'text-[#e0743a]/70' : 'text-[#4f4b47] hover:text-[#76716b]'}`}
              >
                {compareMode ? "Solo" : "Compare"}
              </button>
              <span className={`font-mono text-[9px] tracking-[0.08em] transition-colors ${input.length > 1800 ? 'text-[#e0743a]/60' : 'text-[#4f4b47]/60'}`}>
                {input.length > 0 ? `${input.length}/2000` : ''}
              </span>
              <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.08em]">↵ Run</span>
            </div>
            <button onClick={handleSubmit} disabled={!input.trim() || isLoading}
              className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: 8 }}>
              {isLoading ? "…" : "Show me what I'm not seeing"}
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
      workspaceSource="DEFRAG"
    />
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "thread",  label: "Defrag",  content: main },
        { id: "context", label: "Context", content: sidebar },
        { id: "library", label: "Library", content: contextPanel },
      ]}
    />
  </>
  )
}