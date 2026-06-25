"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { InviteModal } from "@/components/spaces/InviteModal"
import { ResultCard } from "@/components/spaces/ResultCard"
import Link from "next/link"
import { processInput } from "@/lib/system/processInput"
import type { DefragMeta } from "@/lib/system/outputContract"

// ─── Types ────────────────────────────────────────────────────────────────────

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
  signature?: string
  rail?: {
    baseline?: { pace?: string; stabilizes?: string; responds?: string }
    sky?: { urgency?: string; tolerance?: string; state?: string }
    pattern?: { loop?: string }
  }
}

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBirthSummary(b: Baseline): string {
  const city = b.pob.split(",")[0].trim()
  return `${b.dob} · ${b.tob.value} · ${city}`
}

// Evidence chip — Baseline Design data point
function EvidenceChip({ label }: { label: string }) {
  return (
    <span
      className="font-mono text-[8px] tracking-[0.1em] px-2 py-0.5 border border-[#e0743a]/20 text-[#e0743a]/60 bg-[#e0743a]/[0.04]"
      style={{ borderRadius: "var(--radius-minimal)" }}
    >
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DefragWorkspacePage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<DefragMeta | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)

  const [baseline, setBaseline] = React.useState<Baseline | null>(null)
  const [baselineLoading, setBaselineLoading] = React.useState(true)
  const [baselineStatements, setBaselineStatements] = React.useState<BaselineStatement[]>([])
  const [statementsLoading, setStatementsLoading] = React.useState(false)
  const [recurringPattern, setRecurringPattern] = React.useState<string | null>(null)
  const [sessionCount, setSessionCount] = React.useState(0)
  // Compare With Someone — Pro only
  const [compareMode, setCompareMode] = React.useState(false)
  const [compareName, setCompareName] = React.useState("")

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

  // Prefill from ?prompt= query param
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("prompt")
      if (p) setInput(prev => prev || decodeURIComponent(p))
    }
  }, [])

  // Load baseline
  React.useEffect(() => {
    fetch("/api/baseline", { credentials: "include" })
      .then(r => r.ok ? r.json() : { baseline: null })
      .then((d: any) => setBaseline(d.baseline ?? null))
      .catch(() => {})
      .finally(() => setBaselineLoading(false))
  }, [])

  // Load derived profile statements
  React.useEffect(() => {
    if (!baseline) return
    setStatementsLoading(true)
    fetch("/api/derive-profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : { statements: [] })
      .then((d: any) => { if (Array.isArray(d.statements) && d.statements.length > 0) setBaselineStatements(d.statements) })
      .catch(() => {})
      .finally(() => setStatementsLoading(false))
  }, [baseline])

  React.useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }
  }, [audioUrl])

  // Load pattern memory
  React.useEffect(() => {
    fetch("/api/memory", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => {
        if (d?.recurringPattern) setRecurringPattern(d.recurringPattern)
        if (d?.sessionCount) setSessionCount(d.sessionCount)
      })
      .catch(() => {})
  }, [])

  // Load library
  React.useEffect(() => {
    setLibraryLoading(true)
    fetch("/api/library?workspace_source=DEFRAG", { credentials: "include" })
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
    setAudioUrl(null)
    setAudioError("")
    setResult(null)
    try {
      const pResult = await processInput({
        space: "defrag",
        message: input,
        ...(compareMode && compareName.trim() ? {
          target: { id: "compare", relation: "partner" },
          context: { targetName: compareName.trim() },
        } : {}),
      })

      if (!pResult.ok) {
        setError(pResult.error)
        return
      }

      // Render from the unified output contract
      // meta contains the full Defrag-specific fields for ResultCard
      setResult(pResult.output.meta as DefragMeta)
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
          text: [
            result.activePattern,
            result.theRepeat ? `What keeps happening: ${result.theRepeat}` : null,
            result.alignment ? `What gives this moment a better chance: ${result.alignment}` : null,
            result.bestNextResponse
              ? `Next move: ${typeof result.bestNextResponse === "object" ? result.bestNextResponse?.summary : result.bestNextResponse}`
              : null,
          ].filter(Boolean).join(". "),
        }),
      })
      if (!res.ok) { const d = (await res.json().catch(() => ({}))) as any; throw new Error(d.error || "Failed") }
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

  // ─── LEFT PANEL — Baseline Design ─────────────────────────────────────────

  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>

      {/* Panel header */}
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Baseline Design</p>
      </div>

      {/* Baseline Design — the private inference layer */}
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">

        {baselineLoading ? (
          <span className="w-3.5 h-3.5 border border-white/[0.15] border-t-white/40 rounded-full animate-spin block" />
        ) : baseline ? (
          <>
            {/* Birth summary — compact, low priority */}
            <p className="font-mono text-[9px] text-[#4f4b47] mb-4 tracking-[0.1em]">
              {formatBirthSummary(baseline)}
            </p>

            {/* Derived behavioral statements with evidence chips */}
            {statementsLoading ? (
              <span className="w-3.5 h-3.5 border border-white/[0.15] border-t-white/40 rounded-full animate-spin block" />
            ) : baselineStatements.length > 0 ? (
              <div className="flex flex-col gap-0">
                {baselineStatements.map(({ statement, chips }, i) => (
                  <div key={i} className="py-3 border-b border-white/[0.04] last:border-0">
                    <p className="text-[12px] text-[#c8c2bc] leading-[1.6] mb-2">{statement}</p>
                    {chips.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {chips.map(chip => <EvidenceChip key={chip} label={chip} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#76716b] leading-relaxed">
                Your Baseline Design is active. Behavioral profile is being derived.
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
              <p className="text-[10px] text-[#4f4b47]">Active in every result. Never exposed in outputs.</p>
              <a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#76716b] hover:text-[#a8a29a] transition-colors">
                Edit
              </a>
            </div>
          </>
        ) : (
          /* No baseline — prompt to add */
          <div className="border border-white/[0.08] bg-white/[0.02] p-4" style={{ borderRadius: "var(--radius-container)" }}>
            <p className="text-[12px] font-medium text-[#a8a29a] mb-1">Baseline Design required</p>
            <p className="text-[12px] text-[#76716b] leading-relaxed mb-3">
              Add your date, time, and place of birth to begin. This is the private layer that grounds every result.
            </p>
            <a
              href="/settings"
              className="inline-flex h-8 px-4 bg-[#f4efe9] text-[#08070a] text-[11px] font-medium items-center hover:opacity-90 transition-opacity"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              Add birth data →
            </a>
          </div>
        )}
      </div>

      {/* Pattern history — what's been brought before */}
      {baseline && (
        <div className="px-5 pt-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Pattern history</p>
            {sessionCount > 0 && (
              <span className="font-mono text-[8px] text-[#4f4b47]">{sessionCount} session{sessionCount !== 1 ? "s" : ""}</span>
            )}
          </div>
          {recurringPattern ? (
            <div>
              <p className="text-[11px] text-[#76716b] leading-relaxed mb-1">
                This pattern keeps appearing:
              </p>
              <p className="text-[11px] text-[#c8c2bc] leading-relaxed italic">
                "{recurringPattern.length > 80 ? recurringPattern.slice(0, 80) + "…" : recurringPattern}"
              </p>
            </div>
          ) : result?.sourcesUsed?.history ? (
            <p className="text-[11px] text-[#76716b] leading-relaxed">
              Past patterns were used in this result.
            </p>
          ) : (
            <p className="text-[11px] text-[#4f4b47] leading-relaxed">
              Patterns from past sessions will inform future results.
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="px-5 pt-4">
        <Link href="/apps/defrag" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
          ← Back to Defrag
        </Link>
      </div>
    </div>
  )

  // ─── RIGHT PANEL — Library ─────────────────────────────────────────────────

  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>

      {/* Panel header */}
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Saved results</p>
      </div>

      {/* Audio — only when result has audio available */}
      {result?.media?.audioOverviewAvailable && (
        <div className="px-5 pt-4 pb-4 border-b border-white/[0.05]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Audio overview</p>
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

      {/* Library list */}
      <div className="flex-1">
        {libraryLoading ? (
          <div className="flex justify-center py-10">
            <span className="w-4 h-4 border border-white/[0.15] border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[12px] text-[#4f4b47] leading-relaxed">
              Saved results appear here.
            </p>
            <p className="text-[11px] text-[#4f4b47] mt-1 opacity-60">
              Save to Library after each session.
            </p>
          </div>
        ) : (
          library.map(item => (
            <a
              key={item.id}
              href={`/apps/defrag/${item.id}`}
              className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47]">Defrag</span>
                <span className="text-[10px] text-[#4f4b47]">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-[13px] text-[#76716b] group-hover:text-[#c8c2bc] transition-colors leading-snug line-clamp-2">
                {item.title}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  )

  // ─── CENTER PANEL — Thread ─────────────────────────────────────────────────

  const main = (
    <div className="flex flex-col h-full">

      {/* Thread header — shows active data sources */}
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#f4efe9]">Defrag</span>
          <span className="text-[#4f4b47] text-[10px]">·</span>
          <span className="text-[11px] text-[#4f4b47]">What's active. What keeps happening. One next move.</span>
        </div>
        {result?.sourcesUsed && (
          <div className="flex items-center gap-1.5">
            {result.sourcesUsed.baseline && (
              <span
                className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#e0743a]/60 border border-[#e0743a]/20 px-2 py-0.5"
                style={{ borderRadius: "var(--radius-minimal)" }}
              >
                Baseline Design active
              </span>
            )}
            {result.sourcesUsed.history && (
              <span
                className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] border border-white/[0.08] px-2 py-0.5"
                style={{ borderRadius: "var(--radius-minimal)" }}
              >
                Pattern history
              </span>
            )}
          </div>
        )}
      </div>

      {/* Result / empty state */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>

        {/* No baseline */}
        {!baselineLoading && !baseline && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-6">
            <p className="text-[15px] text-[#f4efe9] leading-snug">Set your Baseline Design first.</p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">
              Your Baseline Design is the private map that grounds every result. It takes 30 seconds to set — date, time, and place of birth.
            </p>
            <a
              href="/settings"
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-4 py-2 hover:border-white/[0.16]"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              Set Baseline Design →
            </a>
          </div>
        )}

        {/* Ready — no result yet */}
        {baseline && !result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-2">
            <p className="text-[15px] text-[#f4efe9] leading-snug">What's happening right now?</p>
            <p className="text-[13px] text-[#4f4b47] leading-relaxed max-w-xs">
              Describe the moment. The message. The conversation. The pattern you keep returning to.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-white/[0.45] rounded-full animate-spin" />
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">Reading the pattern…</p>
          </div>
        )}

        {/* Error */}
        {error && error !== "needs_baseline" && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-6">
            <p className="text-[13px] text-[#a8a29a] leading-relaxed max-w-sm">
              {error.includes("couldn't read") ? "The system couldn't read this moment clearly. Try describing it with more specific detail." : error}
            </p>
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

        {/* Result */}
        {result && (
          <>
            <ResultCard
              result={result}
              input={input}
              spaceName="Defrag"
              onSave={handleSave}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              onInvite={() => setInviteOpen(true)}
            />

            {/* Flow suggestion — contextual next space recommendation */}
            {(result as any).flow?.nextSpace && (
              <div className="mt-4 border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex items-center justify-between gap-4" style={{ borderRadius: "var(--radius-container)" }}>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1">
                    {(result as any).flow.urgency === "high" ? "Next" : "When you’re ready"}
                  </p>
                  <p className="text-[13px] text-[#a8a29a] leading-snug">
                    {(result as any).flow.nextSpace === "ALIGNMENT"
                      ? "Alignment separates what is yours to carry from what isn't — and shows you the clearest response."
                      : "Covenant finds the biblical story that fits this moment — and what it means for you."}
                  </p>
                </div>
                <a
                  href={`/apps/${(result as any).flow.nextSpace?.toLowerCase()}/workspace`}
                  className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-3 py-2 hover:border-white/[0.16]"
                  style={{ borderRadius: "var(--radius-button)" }}
                >
                  {(result as any).flow.nextSpace === "ALIGNMENT" ? "Open Alignment" : "Open Covenant"} →
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input composer */}
      <div className={`flex-none px-6 pb-6 ${!baseline ? "opacity-40 pointer-events-none" : ""}`}>
        <div
          className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors"
          style={{ borderRadius: "var(--radius-container)" }}
        >
          {compareMode && (
            <div className="px-5 pt-4 pb-0 border-b border-white/[0.05]">
              <input
                type="text"
                value={compareName}
                onChange={e => setCompareName(e.target.value)}
                placeholder="Who are you comparing with? (name or relation)"
                className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] outline-none text-[13px] pb-3"
                style={{ fontSize: "16px" }}
              />
            </div>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={compareMode ? "Describe the dynamic between you — what keeps happening." : "Describe what's happening — a message, a conversation, a pattern, a moment."}
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            maxLength={2000}
            style={{ fontSize: "16px" }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em] uppercase">↵ Run · Shift+Enter for new line</span>
            {result?.sourcesUsed?.invitedUsers === false && (
              <button
                type="button"
                onClick={() => setCompareMode(m => !m)}
                className={`font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${compareMode ? "text-[#e0743a]/70" : "text-[#4f4b47] hover:text-[#76716b]"}`}
              >
                {compareMode ? "Solo mode" : "+ Compare"}
              </button>
            )}
          </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              {isLoading ? "…" : "Show me what's active"}
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
          { id: "thread",  label: "Defrag",   content: main },
          { id: "context", label: "Baseline", content: sidebar },
          { id: "library", label: "Saved",    content: contextPanel },
        ]}
      />
    </>
  )
}