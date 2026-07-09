"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { InviteModal } from "@/components/spaces/InviteModal"
import { ResultCard } from "@/components/spaces/ResultCard"
import { PanelHeader, EvidenceChip, PremiumEmptyState, PremiumLoadingState, PremiumErrorState } from "@/components/spaces/WorkspaceStates"
import Link from "next/link"

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
  confidence?: { score: number; strength: "low" | "medium" | "high" }
  presence?: { stepDeeperChoices?: Array<"keep_simple" | "show_pattern" | "map_baseline" | "turn_into_action" | "save_pattern" | "go_deeper" | "steady_first"> }
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

function formatBirthSummary(b: Baseline): string {
  const city = b.pob.split(",")[0].trim()
  return `${b.dob} Â· ${b.tob.value} Â· ${city}`
}

// EvidenceChip is now imported from WorkspaceStates

export default function DefragWorkspacePage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<DefragResult | null>(null)
  const [thread, setThread] = React.useState<Array<{input: string; result: DefragResult}>>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState("")
  const [error, setError] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)

  const [baseline, setBaseline] = React.useState<Baseline | null>(null)
  const [baselineLoading, setBaselineLoading] = React.useState(true)
  const [baselineStatements, setBaselineStatements] = React.useState<BaselineStatement[]>([])
  const [statementsLoading, setStatementsLoading] = React.useState(false)
  const [datasetStatus, setDatasetStatus] = React.useState<"none" | "pending" | "ready" | "failed" | null>(null)
  const [recurringPattern, setRecurringPattern] = React.useState<string | null>(null)
  const [sessionCount, setSessionCount] = React.useState(0)
  const [compareMode, setCompareMode] = React.useState(false)
  const [compareName, setCompareName] = React.useState("")
  const [messageMode, setMessageMode] = React.useState(false)

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("prompt")
      if (p) setInput(prev => prev || decodeURIComponent(p))
    }
  }, [])

  React.useEffect(() => {
    fetch("/api/baseline", { credentials: "include" })
      .then(r => r.ok ? r.json() : { baseline: null })
      .then((d: { baseline?: Baseline | null }) => setBaseline(d.baseline ?? null))
      .catch(() => {})
      .finally(() => setBaselineLoading(false))
  }, [])

  React.useEffect(() => {
    if (!baseline) return
    let active = true
    const poll = async () => {
      try {
        const r = await fetch("/api/baseline/status", { credentials: "include" })
        if (!r.ok || !active) return null
        const d = await r.json() as { status?: "none" | "pending" | "ready" | "failed" }
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

  React.useEffect(() => {
    if (!baseline) return
    setStatementsLoading(true)
    fetch("/api/derive-profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : { statements: [] })
      .then((d: { statements?: BaselineStatement[] }) => { if (Array.isArray(d.statements) && d.statements.length > 0) setBaselineStatements(d.statements) })
      .catch(() => {})
      .finally(() => setStatementsLoading(false))
  }, [baseline])

  React.useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }
  }, [audioUrl])

  React.useEffect(() => {
    fetch("/api/memory", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { recurringPattern?: string; sessionCount?: number } | null) => {
        if (d?.recurringPattern) setRecurringPattern(d.recurringPattern)
        if (d?.sessionCount) setSessionCount(d.sessionCount)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    setLibraryLoading(true)
    fetch("/api/library?workspace_source=DEFRAG", { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: { items?: LibraryItem[] }) => setLibrary(d.items || []))
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
    setStreamingText("")

    if (messageMode) {
      try {
        const res = await fetch("/api/defrag/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: input }),
        })
        const data = await res.json() as {
          error?: string
          whatMightBeActive?: string
          whatTheyMightMean?: string
          yourPattern?: string
          bestNextResponse?: string
          tone?: string
        }
        if (!res.ok) {
          setError(data.error || "Something went wrong.")
          return
        }
        const messageResult: DefragResult = {
          activePattern: data.whatMightBeActive,
          theRepeat: data.whatTheyMightMean,
          alignment: data.yourPattern,
          bestNextResponse: data.bestNextResponse,
          summary: data.tone,
          sourcesUsed: { baseline: true, history: false, invitedUsers: false },
        }
        setResult(messageResult)
        setThread(prev => [...prev.slice(-2), { input, result: messageResult }])
      } catch {
        setError("Unable to connect. Check your connection and try again.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
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
              const d = JSON.parse(line.slice(6)) as { token?: string; done?: boolean; error?: string }
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
          ...(compareMode && compareName.trim() ? {
            target: { id: "compare", relation: "partner" },
            targetName: compareName.trim(),
          } : {}),
          ...(thread.length > 0 ? {
            priorPatterns: thread.slice(-2).map(t => t.result.activePattern).filter(Boolean),
          } : {}),
        }),
      })
      const data = await res.json() as DefragResult & { type?: string; error?: string; message?: string }
      if (data.type === "needs_baseline") { setError("needs_baseline"); return }
      if (!res.ok) {
        setError(data.error === "daily_limit_reached"
          ? "You've reached your free daily limit. Upgrade to continue."
          : data.message || data.error || "Something went wrong.")
        return
      }
      setStreamingText("")
      setResult(data)
      setThread(prev => [...prev.slice(-2), { input, result: data }])
    } catch {
      setError("Unable to connect. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepDeeper = async (choice: "keep_simple" | "show_pattern" | "map_baseline" | "turn_into_action" | "save_pattern" | "go_deeper" | "steady_first") => {
    if (!result) return
    if (choice === "keep_simple" || choice === "steady_first") {
      await handleSubmitWithDepth("simple")
    } else if (choice === "go_deeper" || choice === "map_baseline" || choice === "show_pattern") {
      await handleSubmitWithDepth("deep")
    } else if (choice === "turn_into_action") {
      const prompt = result.alignment || input
      window.location.href = `/apps/alignment/workspace?prompt=${encodeURIComponent(prompt)}`
    } else if (choice === "save_pattern") {
      handleSave()
    }
  }

  const handleSubmitWithDepth = async (depth: "simple" | "deep") => {
    if (!input.trim() || isLoading) return
    setIsLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: input, depth }),
      })
      if (!res.ok) return
      const data = await res.json() as DefragResult
      setResult(data)
    } catch {}
    finally { setIsLoading(false) }
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
          title: input.slice(0, 60) + (input.length > 60 ? "â¦" : ""),
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
      if (!res.ok) { const d = (await res.json().catch(() => ({}))) as { error?: string }; throw new Error(d.error || "Failed") }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      requestAnimationFrame(() => { audioRef.current?.play().catch(() => {}) })
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <PanelHeader label="Baseline" />
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        {baselineLoading ? (
          <div className="flex flex-col gap-2.5 py-1">
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-4/5" />
            <div className="skeleton skeleton-text w-3/5" />
          </div>
        ) : baseline ? (
          <>
            <p className="font-mono text-[9px] text-[#4f4b47] mb-4 tracking-[0.1em]">{formatBirthSummary(baseline)}</p>
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
                    {chips.length > 0 && <div className="flex gap-1 flex-wrap">{chips.map(chip => <EvidenceChip key={chip} label={chip} />)}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#76716b] leading-relaxed">Your Baseline is active. Behavioral profile is being derived.</p>
            )}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                {datasetStatus === "ready" && <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/50" />}
                {datasetStatus === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />}
                <p className="text-[10px] text-[#4f4b47]">{datasetStatus === "ready" ? "Understanding model active." : datasetStatus === "pending" ? "Compilingâ¦" : "Active in every result."}</p>
              </div>
              <a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#76716b] hover:text-[#a8a29a] transition-colors">Edit</a>
            </div>
          </>
        ) : (
          <div className="border border-white/[0.08] bg-white/[0.02] p-4" style={{ borderRadius: "var(--radius-container)" }}>
            <p className="text-[12px] text-[#a8a29a] mb-1">Baseline required</p>
            <p className="text-[12px] text-[#76716b] leading-relaxed mb-3">Add your date, time, and place of birth to begin. This private layer grounds every result.</p>
            <a href="/settings" className="inline-flex h-8 px-4 bg-[#f4efe9] text-[#08070a] text-[11px] font-medium items-center hover:opacity-90 transition-opacity" style={{ borderRadius: "var(--radius-button)" }}>Add birth data â</a>
          </div>
        )}
      </div>
      {baseline && (
        <div className="px-5 pt-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Pattern history</p>
            {sessionCount > 0 && <span className="font-mono text-[8px] text-[#4f4b47]">{sessionCount} session{sessionCount !== 1 ? "s" : ""}</span>}
          </div>
          {recurringPattern ? (
            <div>
              <p className="text-[11px] text-[#76716b] leading-relaxed mb-1">This pattern keeps appearing:</p>
              <p className="text-[11px] text-[#c8c2bc] leading-relaxed italic">"{recurringPattern.length > 80 ? recurringPattern.slice(0, 80) + "â¦" : recurringPattern}"</p>
            </div>
          ) : result?.sourcesUsed?.history ? (
            <p className="text-[11px] text-[#76716b] leading-relaxed">Past patterns were used in this result.</p>
          ) : (
            <p className="text-[11px] text-[#4f4b47] leading-relaxed">Patterns from past sessions will inform future results.</p>
          )}
        </div>
      )}
      <div className="px-5 pt-4">
        <Link href="/apps/defrag" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">â Back to Defrag</Link>
      </div>
    </div>
  )

  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <PanelHeader label="Saved understanding" />
      {result?.media?.audioOverviewAvailable && (
        <div className="px-5 pt-4 pb-4 border-b border-white/[0.05]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Audio overview</p>
          <div className="border border-white/[0.07] bg-white/[0.02] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {!audioUrl ? (
              <button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors disabled:opacity-40">
                <div className="w-5 h-5 border border-white/[0.12] flex items-center justify-center shrink-0 text-[#a8a29a] text-[9px]" style={{ borderRadius: "50%" }}>â¶</div>
                <span className="text-[12px] text-[#a8a29a]">{isGeneratingAudio ? "Generatingâ¦" : "Generate audio overview"}</span>
              </button>
            ) : (
              <audio ref={audioRef} src={audioUrl} controls preload="auto" className="w-full h-9 outline-none block" style={{ opacity: 0.75 }} />
            )}
            {audioError && <p className="text-[11px] text-[#76716b] px-4 pb-3">{audioError}</p>}
          </div>
        </div>
      )}
      <div className="flex-1">
        {libraryLoading ? (
          <div className="flex justify-center py-10"><span className="w-4 h-4 border border-white/[0.15] border-t-white/30 rounded-full animate-spin" /></div>
        ) : library.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[12px] text-[#4f4b47] leading-relaxed">Saved understanding appears here.</p>
            <p className="text-[11px] text-[#4f4b47] mt-1 opacity-60">Save the patterns worth remembering.</p>
          </div>
        ) : (
          library.map(item => (
            <a key={item.id} href={`/apps/defrag/${item.id}`} className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47]">Defrag</span>
                <span className="text-[10px] text-[#4f4b47]">{new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </div>
              <p className="text-[13px] text-[#76716b] group-hover:text-[#c8c2bc] transition-colors leading-snug line-clamp-2">{item.title}</p>
            </a>
          ))
        )}
      </div>
    </div>
  )

  const main = (
    <div className="flex flex-col h-full">
      <PanelHeader
        label="Defrag"
        detail="Experience → Understanding → Clean move"
        right={result?.sourcesUsed ? (
          <div className="flex items-center gap-1.5">
            {result.sourcesUsed.baseline && <EvidenceChip label="Baseline active" tone="accent" />}
            {result.sourcesUsed.history && <EvidenceChip label="Pattern history" tone="neutral" />}
          </div>
        ) : undefined}
      />

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>
        {!baselineLoading && !baseline && (
          <PremiumEmptyState
            label="Baseline required"
            title="Set your Baseline first."
            body="Your Baseline is the private model that gives every result context."
            action={<a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-4 py-2 hover:border-white/[0.16]" style={{ borderRadius: "var(--radius-button)" }}>Set Baseline →</a>}
          />
        )}
        {baseline && !result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3">
            <p className="font-serif text-[clamp(1.9rem,4vw,3.1rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.025em] max-w-lg">Tell me what happened.</p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-sm">No categories. No diagnosis. Bring the message, the silence, the argument, the pressure, or the loop you keep returning to.</p>
          </div>
        )}
        {isLoading && (
          streamingText ? (
            <div className="px-6 pt-6 pb-4">
              <div className="border border-white/[0.06] bg-white/[0.01] p-6 scan-lines" style={{ borderRadius: "var(--radius-container)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/50 animate-pulse" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Building understanding</p>
                </div>
                <p className="text-[14px] text-[#f4efe9]/70 leading-[1.7] whitespace-pre-wrap">{streamingText}<span className="inline-block w-0.5 h-4 bg-[#e0743a]/40 ml-0.5 animate-pulse align-middle" /></p>
              </div>
            </div>
          ) : (
            <PremiumLoadingState
              label="Reading the signal"
              body="Separating the moment from the pattern."
            />
          )
        )}
        {error && error !== "needs_baseline" && (
          <PremiumErrorState
            label="Something went wrong"
            title={error.includes("daily limit") ? "Daily limit reached" : error.includes("connect") ? "Connection issue" : "Something went wrong"}
            body={error.includes("daily limit") ? "You've reached your free daily limit. Upgrade to continue." : error.includes("connect") ? "Check your network and try again." : error || "Try again."}
            action={error.includes("daily limit") ? <a href="/pricing" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-4 py-2 hover:border-white/[0.16]" style={{ borderRadius: "var(--radius-button)" }}>See Pro plans →</a> : undefined}
          />
        )}
        {result && (
          <>
            <ResultCard result={result} input={input} spaceName="Defrag" onSave={handleSave} isSaving={isSaving} saveSuccess={saveSuccess} onInvite={() => setInviteOpen(true)} onStepDeeper={handleStepDeeper} />
            {result && !((result as { flow?: { nextSpace?: string } }).flow?.nextSpace) && result.alignment && (
              <div className="mt-4 border border-white/[0.05] bg-white/[0.01] px-5 py-3 flex items-center justify-between gap-4" style={{ borderRadius: "var(--radius-container)" }}>
                <p className="text-[12px] text-[#4f4b47] leading-snug">Take this to Alignment â understand what happens between you.</p>
                <a href={`/apps/alignment/workspace?prompt=${encodeURIComponent(result.alignment || "")}`} className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors whitespace-nowrap shrink-0">Alignment â</a>
              </div>
            )}
          </>
        )}
      </div>

      <div className={`flex-none px-6 pb-6 ${!baseline ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors" style={{ borderRadius: "var(--radius-container)" }}>
          {compareMode && (
            <div className="px-5 pt-4 pb-0 border-b border-white/[0.05]">
              <input type="text" value={compareName} onChange={e => setCompareName(e.target.value)} placeholder="Who is involved? Name or relation." className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] outline-none text-[13px] pb-3" style={{ fontSize: "16px" }} />
            </div>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={messageMode ? "Paste the message exactly as it was sent." : compareMode ? "Tell me what keeps happening between you." : "Tell me what happened."}
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            maxLength={2000}
            style={{ fontSize: "16px" }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em] uppercase">Enter to run Â· Shift+Enter for new line</span>
              {result?.sourcesUsed?.invitedUsers === false && (
                <button type="button" onClick={() => { setCompareMode(m => !m); if (!compareMode) setMessageMode(false) }} className={`font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${compareMode ? "text-[#e0743a]/70" : "text-[#4f4b47] hover:text-[#76716b]"}`}>{compareMode ? "Solo mode" : "+ Relationship"}</button>
              )}
              <button type="button" onClick={() => { setMessageMode(m => !m); setCompareMode(false) }} className={`font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${messageMode ? "text-[#e0743a]/70" : "text-[#4f4b47] hover:text-[#76716b]"}`}>{messageMode ? "Clear" : "Read a message"}</button>
            </div>
            <button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="h-8 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderRadius: "var(--radius-button)" }}>{isLoading ? "â¦" : "Understand"}</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} workspaceSource="DEFRAG" />
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
