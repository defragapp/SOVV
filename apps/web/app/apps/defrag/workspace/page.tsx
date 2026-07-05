"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { InviteModal } from "@/components/spaces/InviteModal"
import { ResultCard } from "@/components/spaces/ResultCard"
import Link from "next/link"

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
  const [result, setResult] = React.useState<DefragResult | null>(null)
  const [thread, setThread] = React.useState<Array<{input: string; result: DefragResult}>>([])  // conversation history
  const [isLoading, setIsLoading] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState("")  // progressive AI output
  const [error, setError] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [saveError, setSaveError] = React.useState<"pro_required" | "error" | null>(null)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [limitRemaining, setLimitRemaining] = React.useState<number | null>(null)
  const [limitReached, setLimitReached] = React.useState(false)

  const [baseline, setBaseline] = React.useState<Baseline | null>(null)
  const [baselineLoading, setBaselineLoading] = React.useState(true)
  const [baselineStatements, setBaselineStatements] = React.useState<BaselineStatement[]>([])
  const [statementsLoading, setStatementsLoading] = React.useState(false)
  const [datasetStatus, setDatasetStatus] = React.useState<"none" | "pending" | "ready" | "failed" | null>(null)
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

  // Poll baseline compilation status
  React.useEffect(() => {
    if (!baseline) return
    let active = true
    const poll = async () => {
      try {
        const r = await fetch("/api/baseline/status", { credentials: "include" })
        if (!r.ok || !active) return
        const d = await r.json() as any
        setDatasetStatus(d.status ?? "none")
        return d.status
      } catch { return null }
    }
    poll().then(status => {
      if (status === "pending") {
        const interval = setInterval(async () => {
          const s = await poll()
          if (s === "ready" || s === "failed" || !active) clearInterval(interval)
        }, 5000)
        return () => { active = false; clearInterval(interval) }
      }
    })
    return () => { active = false }
  }, [baseline])

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
    setStreamingText("")  // clear previous stream
    try {
      // Start streaming for progressive display
      const streamController = new AbortController()
      fetch("/api/explain/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: streamController.signal,
        body: JSON.stringify({ message: input }),
      }).then(async (streamRes) => {
        if (!streamRes.ok || !streamRes.body) return
        const reader = streamRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const evtLines = buffer.split("\n\n")
          buffer = evtLines.pop() ?? ""
          for (const line of evtLines) {
            if (!line.startsWith("data: ")) continue
            try {
              const d = JSON.parse(line.slice(6))
              if (d.token) setStreamingText(prev => prev + d.token)
              if (d.done || d.error) break
            } catch { /* ignore */ }
          }
        }
      }).catch(() => { /* stream failed, main fetch will handle */ })

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: input,
          // Compare With Someone — passes target name for relational overlay
          ...(compareMode && compareName.trim() ? {
            target: { id: "compare", relation: "partner" },
            targetName: compareName.trim(),
          } : {}),
          // Pass recent patterns for conversational continuity
          ...(thread.length > 0 ? {
            priorPatterns: thread.slice(-2).map(t => t.result?.activePattern).filter(Boolean),
          } : {}),
        }),
      })
      const data = await res.json()
      if (data.type === "needs_baseline") { setError("needs_baseline"); return }
      if (!res.ok) {
        setError(data.error === "daily_limit_reached"
          ? "You've reached your free daily limit. Upgrade to continue."
          : data.message || data.error || "Something went wrong.")
        return
      }
      setStreamingText("")  // clear stream, show structured result
      setResult(data)
      setThread(prev => [...prev.slice(-2), { input, result: data }])
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
      if (res.status === 403) {
        setSaveError("pro_required")
        return
      }
      if (!res.ok) {
        setSaveError("error")
        return
      }
      setSaveSuccess(true)
      setSaveError(null)
    } catch { setSaveError("error") } finally {
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
          text: (() => {
            const parts: string[] = []
            if (result.activePattern) parts.push(`Here is what is active right now. ${result.activePattern}.`)
            if (result.theRepeat) parts.push(`What keeps happening: ${result.theRepeat}.`)
            if (result.oldRole) parts.push(`The role being pulled into: ${result.oldRole}.`)
            if (result.strainPattern) parts.push(`Under pressure: ${result.strainPattern}.`)
            if (result.alignment) parts.push(`What gives this moment a better chance: ${result.alignment}.`)
            const bnr = result.bestNextResponse
            const bnrText = typeof bnr === "object" ? bnr?.summary : bnr
            if (bnrText) parts.push(`The next move: ${bnrText}.`)
            return parts.join(" ")
          })(),
        }),
      })
      if (res.status === 403) {
        const d = await res.json().catch(() => ({})) as any
        throw new Error(d.error === "subscription_required" ? "Audio Overview requires Pro." : "Access denied.")
      }
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
          <div className="flex flex-col gap-2.5 py-1">
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-4/5" />
            <div className="skeleton skeleton-text w-3/5" />
          </div>
        ) : baseline ? (
          <>
            {/* Birth summary — compact, low priority */}
            <p className="font-mono text-[9px] text-[#4f4b47] mb-4 tracking-[0.1em]">
              {formatBirthSummary(baseline)}
            </p>

            {/* Derived behavioral statements with evidence chips */}
            {statementsLoading ? (
              <div className="flex flex-col gap-2.5 py-1">
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-4/5" />
            <div className="skeleton skeleton-text w-3/5" />
          </div>
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
              <div className="flex items-center gap-1.5">
                {datasetStatus === "ready" && <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/50" />}
                {datasetStatus === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />}
                <p className="text-[10px] text-[#4f4b47]">
                  {datasetStatus === "ready" ? "Pattern map active." :
                   datasetStatus === "pending" ? "Compiling…" :
                   "Active in every result."}
                </p>
              </div>
              <a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#76716b] hover:text-[#a8a29a] transition-colors">
                Edit
              </a>
            </div>
          </>
        ) : (
          /* No baseline — prompt to add */
          <div className="border border-white/[0.08] bg-white/[0.02] p-4" style={{ borderRadius: "var(--radius-container)" }}>
            <p className="text-[12px] text-[#a8a29a] mb-1">Baseline Design required</p>
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
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-[#4f4b47] leading-relaxed">
                Your first pattern will appear here after your first session.
              </p>
              <p className="text-[10px] text-[#4f4b47]/60 leading-relaxed">
                Each result you run builds a pattern map that makes future results more grounded.
              </p>
            </div>
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
          streamingText ? (
            <div className="px-6 pt-6 pb-4">
              <div className="border border-white/[0.06] bg-white/[0.01] p-6 scan-lines" style={{ borderRadius: "var(--radius-container)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/50 animate-pulse" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Reading the pattern</p>
                </div>
                <p className="text-[14px] text-[#f4efe9]/70 leading-[1.7] whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-0.5 h-4 bg-[#e0743a]/40 ml-0.5 animate-pulse align-middle" />
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <span className="w-5 h-5 border border-white/[0.15] border-t-[#e0743a]/40 rounded-full animate-spin" />
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">Reading the pattern…</p>
            </div>
          )
        )}

        {/* Error */}
        {error && error !== "needs_baseline" && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-5 px-6">
            {(error === "daily_limit_reached" || limitReached) ? (
              <>
                <div className="flex flex-col items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">Daily limit reached</span>
                  <p className="text-[14px] text-[#f4efe9] leading-relaxed max-w-xs">
                    You&rsquo;ve used your free sessions for today.
                  </p>
                  <p className="text-[12px] text-[#76716b] leading-relaxed max-w-xs">
                    Free access resets at midnight UTC. Upgrade to Pro for unlimited sessions, Covenant, Alignment, and your Library.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <a
                    href="/pricing"
                    className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#f4efe9] bg-[#e0743a]/20 hover:bg-[#e0743a]/30 transition-colors border border-[#e0743a]/30 px-5 py-2.5"
                    style={{ borderRadius: "var(--radius-button)" }}
                  >
                    Upgrade to Pro →
                  </a>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#4f4b47]">
                    Resets at midnight UTC
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[#a8a29a] leading-relaxed max-w-sm">
                {error.includes("connect") || error.includes("Connection")
                  ? "Connection issue. Check your network and try again."
                  : error.includes("couldn't read") || error.includes("couldn't")
                  ? "The system couldn't read this moment clearly. Try describing it with more specific detail."
                  : error || "Something went wrong. Try again."}
              </p>
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
              saveError={saveError}
              onInvite={() => setInviteOpen(true)}
            />

            {/* Flow suggestion — contextual next space recommendation */}
            {/* Show Alignment CTA when result has a clear next move */}
            {result && !((result as any).flow?.nextSpace) && result.alignment && (
              <div className="mt-4 border border-white/[0.05] bg-white/[0.01] px-5 py-3 flex items-center justify-between gap-4" style={{ borderRadius: "var(--radius-container)" }}>
                <p className="text-[12px] text-[#4f4b47] leading-snug">
                  Take this to Alignment — separate what&rsquo;s yours to carry from what isn&rsquo;t.
                </p>
                <a
                  href={`/apps/alignment/workspace?prompt=${encodeURIComponent(result.alignment || "")}&autorun=1`}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors whitespace-nowrap shrink-0"
                >
                  Alignment →
                </a>
              </div>
            )}
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
            {input.length > 1500 && (
              <span className={`font-mono text-[8px] tracking-[0.1em] ${input.length > 1900 ? "text-red-400/70" : "text-[#4f4b47]"}`}>
                {input.length} / 2000
              </span>
            )}
            {limitRemaining !== null && limitRemaining <= 3 && !limitReached && (
              <span className={`font-mono text-[8px] uppercase tracking-[0.1em] ${limitRemaining <= 1 ? "text-[#e0743a]/70" : "text-[#4f4b47]"}`}>
                {limitRemaining} session{limitRemaining !== 1 ? "s" : ""} left today
              </span>
            )}
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