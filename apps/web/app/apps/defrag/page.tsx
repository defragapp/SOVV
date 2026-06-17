"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"

// ─── Types (exact shape from explain-extended.ts) ──────────────────────────

interface Baseline {
  dob: string
  tob: { type: "exact" | "approx"; value: string }
  pob: string
}

// Plain-language statement derived from baseline design data.
// `statement` — plain-language tendency, written in first person.
// `chips`     — gate/channel/placement labels that produced it.
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
  sourcesUsed?: {
    baseline?: boolean
    history?: boolean
    invitedUsers?: boolean
  }
  media?: {
    audioOverviewAvailable?: boolean
    watchPreviewAvailable?: boolean
  }
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

// ─── Section component ─────────────────────────────────────────────────────

function Section({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="border-b border-white/[0.05] pb-7 mb-7 last:border-0 last:pb-0 last:mb-0">
      <p className="text-[11px] font-medium text-[#76716b] tracking-[0.04em] mb-2.5">
        {label}
      </p>
      <p className="text-[15px] text-[#f4efe9] leading-[1.75]">{value}</p>
    </div>
  )
}

// ─── Gate chip ─────────────────────────────────────────────────────────────

function GateChip({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: "9px",
        fontFamily: "'Inter',sans-serif",
        letterSpacing: "0.10em",
        padding: "2px 8px",
        borderRadius: "9999px",
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

export default function DefragPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<DefragResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Baseline fetched live from GET /api/baseline — shown in sidebar
  const [baseline, setBaseline] = React.useState<Baseline | null>(null)
  const [baselineLoading, setBaselineLoading] = React.useState(true)

  // Derived plain-language profile statements — fetched from GET /api/derive-profile
  // which reads the user's actual KV baseline and runs CF Workers AI to compute them.
  const [baselineStatements, setBaselineStatements] = React.useState<BaselineStatement[]>([])
  const [statementsLoading, setStatementsLoading] = React.useState(false)

  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  // Audio — real <audio> element driven by blob URL from POST /api/audio
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  // Library from GET /api/library?workspace_source=DEFRAG
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

  // Load baseline on mount
  React.useEffect(() => {
    fetch("/api/baseline", { credentials: "include" })
      .then(r => (r.ok ? r.json() : { baseline: null }))
      .then((d: any) => {
        const b: Baseline | null = d.baseline ?? null
        setBaseline(b)
      })
      .catch(() => {})
      .finally(() => setBaselineLoading(false))
  }, [])

  // Once baseline is confirmed present, fetch live derived statements from
  // GET /api/derive-profile — CF Worker reads KV baseline + runs AI to produce
  // 5 plain-language BaselineStatement objects keyed to the user's actual chart.
  React.useEffect(() => {
    if (!baseline) return
    setStatementsLoading(true)
    fetch("/api/derive-profile", { credentials: "include" })
      .then(r => (r.ok ? r.json() : { statements: [] }))
      .then((d: any) => {
        if (Array.isArray(d.statements) && d.statements.length > 0) {
          setBaselineStatements(d.statements)
        }
      })
      .catch(() => {})
      .finally(() => setStatementsLoading(false))
  }, [baseline])

  // Revoke previous blob URL when a new one is created
  React.useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Load library on mount and after each save
  React.useEffect(() => {
    setLibraryLoading(true)
    fetch("/api/library?workspace_source=DEFRAG", { credentials: "include" })
      .then(r => (r.ok ? r.json() : { items: [] }))
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
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()

      if (data.type === "needs_baseline") {
        setError("needs_baseline")
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        setError(
          data.error === "daily_limit_reached"
            ? "You've reached your free daily limit. Upgrade to continue."
            : data.message || data.error || "Something went wrong."
        )
        setIsLoading(false)
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
      const content =
        result.summary ||
        result.activePattern ||
        (typeof result.bestNextResponse === "string"
          ? result.bestNextResponse
          : result.bestNextResponse?.summary) ||
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
    } catch {
      /* silent */
    } finally {
      setIsSaving(false)
    }
  }

  // Audio gated on result.media.audioOverviewAvailable (set by worker when isPro).
  // Route: POST /api/audio — registered in audio.ts via registerAudioRoute().
  // Uses a real <audio> element; src is a blob URL created from the response stream.
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
            result.theRepeat,
            result.oldRole,
            result.giftUnderStrain,
            typeof result.bestNextResponse === "object"
              ? result.bestNextResponse?.summary
              : result.bestNextResponse,
          ]
            .filter(Boolean)
            .join(" "),
        }),
      })
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as any
        throw new Error(d.error || "Failed to generate audio")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      requestAnimationFrame(() => {
        audioRef.current?.play().catch(() => {})
      })
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
        <p className="text-[11px] font-medium text-[#a8a29a] tracking-[0.10em] uppercase">
          Context
        </p>
      </div>

      {/* Block 1 — Baseline Design */}
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-medium text-[#a8a29a] tracking-[0.04em]">
            Your Design
          </p>
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
            {/* Plain-language tendency statements — live from /api/derive-profile */}
            {statementsLoading ? (
              <span className="w-3.5 h-3.5 border border-white/[0.15] border-t-white/40 rounded-full animate-spin block" />
            ) : (
              <div className="flex flex-col">
                {baselineStatements.map(({ statement, chips }, i) => (
                  <div
                    key={i}
                    className="py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <p className="text-[12px] text-[#c8c2bc] leading-[1.65] mb-2">
                      {statement}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {chips.map(chip => (
                        <GateChip key={chip} label={chip} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-white/[0.04]">
              <p className="text-[10px] text-[#4f4b47]">Active in every result.</p>
              <a
                href="/settings"
                className="text-[10px] text-[#76716b] hover:text-[#a8a29a] transition-colors"
                style={{ fontFamily: "'Inter',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                Edit
              </a>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-[#111010] p-4">
            <p className="text-[11px] font-medium text-[#a8a29a] mb-1">Required to run</p>
            <p className="text-[12px] text-[#76716b] leading-relaxed mb-3">
              Add your date, time, and place of birth to begin. Takes about 30 seconds.
            </p>
            <a
              href="/settings"
              className="inline-flex h-8 px-4 rounded-xl bg-[#f4efe9] text-[#08070a] text-[11px] font-medium items-center hover:opacity-90 transition-opacity"
            >
              Add birth data →
            </a>
          </div>
        )}
      </div>

      {/* Block 2 — Pattern History */}
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        <p className="text-[11px] font-medium text-[#a8a29a] tracking-[0.04em] mb-3">
          Pattern history
        </p>
        {result?.sourcesUsed?.history ? (
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Past patterns were used in this result.
          </p>
        ) : (
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Past patterns will appear here after your first result.
          </p>
        )}
      </div>

      {/* Block 3 — Add another person (Pro) */}
      <div className="px-5 pt-5">
        <p className="text-[11px] font-medium text-[#a8a29a] tracking-[0.04em] mb-3">
          Add another person
        </p>
        <p className="text-[12px] text-[#76716b] leading-relaxed mb-3">
          Add another person's birth data to analyze the dynamic between you.
        </p>
        <span className="inline-block border border-white/[0.06] rounded-full px-3 py-1 text-[10px] text-[#4f4b47] cursor-not-allowed">
          Pro
        </span>
      </div>
    </div>
  )

  // ─── RIGHT PANEL — Library & Export ───────────────────────────────────────
  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="text-[11px] font-medium text-[#a8a29a] tracking-[0.10em] uppercase">
          Library
        </p>
      </div>

      {result && (
        <div className="px-5 pt-5 pb-5 border-b border-white/[0.06]">
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-9 rounded-xl bg-[#f4efe9] text-[#08070a] text-[12px] font-medium tracking-tight hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mb-5"
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save to Sovereign"}
          </button>

          <p className="text-[11px] font-medium text-[#a8a29a] tracking-[0.04em] mb-1.5">
            Audio overview
          </p>
          <p className="text-[11px] text-[#76716b] leading-relaxed mb-3">
            A spoken version of your result. Generated on demand.
          </p>

          {result.media?.audioOverviewAvailable ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              {!audioUrl && (
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors disabled:opacity-40"
                >
                  <div className="w-5 h-5 rounded-full border border-white/[0.12] flex items-center justify-center shrink-0 text-[#a8a29a] text-[9px]">
                    ▶
                  </div>
                  <span className="text-[12px] text-[#a8a29a]">
                    {isGeneratingAudio ? "Generating…" : "Generate audio"}
                  </span>
                </button>
              )}

              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  preload="auto"
                  className="w-full h-9 outline-none block"
                  style={{ opacity: 0.75 }}
                />
              )}

              {audioError && (
                <p className="text-[11px] text-[#76716b] px-3.5 pb-2.5">{audioError}</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-[#76716b]">
              Available on Pro.{" "}
              <a
                href="/upgrade"
                className="text-[#a8a29a] hover:text-[#f4efe9] transition-colors underline underline-offset-2"
              >
                Upgrade
              </a>
            </p>
          )}
        </div>
      )}

      <div className="flex-1">
        {libraryLoading ? (
          <div className="flex justify-center py-10">
            <span className="w-4 h-4 border border-white/[0.15] border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <p className="text-[12px] text-[#76716b] leading-relaxed px-5 py-8 text-center">
            Saved results will appear here.
          </p>
        ) : (
          library.map(item => (
            <a
              key={item.id}
              href={`/apps/defrag/${item.id}`}
              className="block px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#76716b] tracking-[0.04em]">Defrag</span>
                <span className="text-[10px] text-[#76716b]">
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
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

  // ─── CENTER PANEL — AI Thread ──────────────────────────────────────────────
  const main = (
    <div className="flex flex-col h-full">
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <span className="text-[11px] font-medium text-[#f4efe9] tracking-[0.04em]">Defrag</span>
        {result?.sourcesUsed && (
          <div className="flex items-center gap-2">
            {result.sourcesUsed.baseline && (
              <span className="text-[10px] text-[#76716b] border border-white/[0.10] rounded-full px-2.5 py-0.5">
                Birth data ✓
              </span>
            )}
            {result.sourcesUsed.history && (
              <span className="text-[10px] text-[#76716b] border border-white/[0.10] rounded-full px-2.5 py-0.5">
                Pattern history ✓
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4" style={{ scrollbarWidth: "none" }}>

        {!baselineLoading && !baseline && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-3">
            <p className="text-[15px] font-medium text-[#a8a29a]">Birth data required to run.</p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">
              Add your date, time, and place of birth in the Context panel on the left.
            </p>
          </div>
        )}

        {baseline && !result && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center text-center h-full gap-2">
            <p className="text-[16px] text-[#f4efe9] font-normal leading-snug">
              What's going on?
            </p>
            <p className="text-[13px] text-[#76716b] leading-relaxed max-w-xs">
              Describe what's happening. Be as specific or as brief as you want.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="w-5 h-5 border border-white/[0.15] border-t-white/[0.45] rounded-full animate-spin" />
            <p className="text-[13px] text-[#76716b]">Analyzing your input…</p>
          </div>
        )}

        {error && error !== "needs_baseline" && (
          <p className="text-[13px] text-[#a8a29a] text-center py-8 max-w-sm mx-auto leading-relaxed">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">

            <Section label="Active pattern"       value={result.activePattern} />
            <Section label="What keeps happening" value={result.theRepeat} />
            <Section label="Default mode"         value={result.oldRole} />
            <Section label="What shaped this"     value={result.whatYouLearnedToCarry} />
            <Section label="Under pressure"       value={result.strainPattern} />
            <Section label="What's working"       value={result.giftUnderStrain} />
            <Section label="What would help"      value={result.alignment} />

            {result.bestNextResponse && (
              <div className="border-b border-white/[0.05] pb-7 mb-7 last:border-0">
                <p className="text-[11px] font-medium text-[#76716b] tracking-[0.04em] mb-2.5">
                  Suggested response
                </p>
                <p className="text-[15px] text-[#f4efe9] leading-[1.75] mb-5">
                  {typeof result.bestNextResponse === "object"
                    ? result.bestNextResponse.summary
                    : result.bestNextResponse}
                </p>
                {typeof result.bestNextResponse === "object" &&
                  Array.isArray(result.bestNextResponse.phrasing) &&
                  result.bestNextResponse.phrasing.length > 0 && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                      {result.bestNextResponse.phrasing.map((phrase, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-[13px] text-[#a8a29a] leading-relaxed py-3 border-b border-white/[0.05] last:border-0 last:pb-0 cursor-pointer hover:text-[#f4efe9] transition-colors group"
                          onClick={() => navigator.clipboard.writeText(phrase)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="text-[#4f4b47] shrink-0 mt-0.5 select-none">↳</span>
                          <span className="flex-1">{phrase}</span>
                          <span className="text-[10px] text-[#4f4b47] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                            Copy
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {result.conversationalSteering && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-medium text-[#a8a29a] tracking-[0.04em] mb-3 uppercase">
                    In the next conversation, try
                  </p>
                  <ul className="space-y-3">
                    {result.conversationalSteering.do?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[#a8a29a] leading-relaxed">
                        <span className="text-[#76716b] shrink-0 select-none">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#a8a29a] tracking-[0.04em] mb-3 uppercase">
                    Avoid this
                  </p>
                  <ul className="space-y-3">
                    {result.conversationalSteering.avoid?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[#a8a29a] leading-relaxed">
                        <span className="text-[#76716b] shrink-0 select-none">−</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <div className={`flex-none px-6 pb-6 ${!baseline ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.14] transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe what's happening. Be specific."
            rows={3}
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none text-[14px] p-5 leading-[1.75] block"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="text-[10px] text-[#4f4b47] tracking-[0.08em]">↵ Run</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 rounded-xl bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? "…" : "Defrag"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
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
  )
}
