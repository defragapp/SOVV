"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"

// ── Types ────────────────────────────────────────────────────────────────────
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
}

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
  payload?: string
}

// ── Result section renderer ───────────────────────────────────────────────────
function Section({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="border-b border-white/[0.05] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-2">{label}</p>
      <p className="text-[15px] text-[#f4efe9] leading-[1.7]">{value}</p>
    </div>
  )
}

export default function DefragPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<DefragResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

  // Load library on mount
  React.useEffect(() => {
    fetch("/api/history", { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: any) => setLibrary(d.items || []))
      .catch(() => {})
      .finally(() => setLibraryLoading(false))
  }, [saveSuccess])

  const handleSubmit = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setSaveSuccess(false)
    setAudioUrl(null)
    setAudioError("")
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Failed to process")
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: input.slice(0, 60) + (input.length > 60 ? "…" : ""),
          payload: result,
          workspace_source: "DEFRAG",
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveSuccess(true)
    } catch { /* silent */ } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!result) return
    setIsGeneratingAudio(true)
    setAudioError("")
    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: {
            activePattern: result.activePattern,
            theRepeat: result.theRepeat,
            oldRole: result.oldRole,
            giftUnderStrain: result.giftUnderStrain,
            bestNextResponse: typeof result.bestNextResponse === "object"
              ? result.bestNextResponse?.summary
              : result.bestNextResponse,
          },
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as any
        throw new Error(d.error || "Failed to generate audio")
      }
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (err: any) {
      setAudioError(err.message || "Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  // ── LEFT: People / Baseline Design context ────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#76716b]">Context</p>
      </div>

      {/* Baseline Design */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Your Baseline Design</p>
        <p className="text-xs text-[#76716b] leading-relaxed mb-3">
          Active beneath every thread. Your emotional architecture, relational tendencies, and processing style are injected into every response.
        </p>
        <a
          href="/settings"
          className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#e0743a]/60 hover:text-[#e0743a] transition-colors"
        >
          Edit Baseline Design →
        </a>
      </div>

      {/* Invite Privately */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Invite Privately</p>
        <p className="text-xs text-[#76716b] leading-relaxed mb-3">
          When both sides matter. Overlay a second Baseline Design to surface the shared loop.
        </p>
        <button
          disabled
          className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#4f4b47] cursor-not-allowed"
        >
          Pro feature
        </button>
      </div>

      {/* Pattern history */}
      <div className="px-5 py-5 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Pattern History</p>
        <p className="text-xs text-[#76716b] leading-relaxed">
          Your recurring patterns are tracked across sessions and used to deepen every Result.
        </p>
      </div>
    </div>
  )

  // ── RIGHT: Library / Multimedia output ────────────────────────────────────
  const contextPanel = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#76716b]">Library</p>
      </div>

      {/* Current result actions */}
      {result && (
        <div className="px-5 py-5 border-b border-white/[0.06] flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-9 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save to Sovereign"}
          </button>

          {/* Audio Overview */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">Audio Overview</p>
            {audioUrl ? (
              <audio controls src={audioUrl} className="w-full h-8 outline-none opacity-80" />
            ) : (
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="w-full h-8 rounded-lg border border-white/[0.08] text-xs text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/20 transition-all disabled:opacity-30"
                >
                  {isGeneratingAudio ? "Generating…" : "Generate Audio"}
                </button>
                {audioError && <p className="text-xs text-red-400/70">{audioError}</p>}
                {!audioError && <p className="text-[10px] text-[#4f4b47]">Pro · Requires active subscription</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved library items */}
      <div className="flex-1 overflow-y-auto">
        {libraryLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-4 h-4 border border-white/20 border-t-[#f4efe9]/40 rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-[#4f4b47] leading-relaxed">
              Save Results here. Return before the old pattern takes over again.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {library.map((item) => (
              <a
                key={item.id}
                href={`/apps/defrag/${item.id}`}
                className="px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#4f4b47]">
                    {item.workspace_source === "DEFRAG" ? "Defrag" : item.workspace_source === "COVENANT" ? "Covenant" : item.workspace_source === "ALIGNMENT" ? "Alignment" : "Library"}
                  </span>
                  <span className="text-[10px] text-[#4f4b47]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[#a8a29a] group-hover:text-[#f4efe9] transition-colors leading-snug line-clamp-2">
                  {item.title || "Untitled"}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── CENTER: AI Thread ─────────────────────────────────────────────────────
  const main = (
    <div className="flex flex-col gap-6 h-full max-w-2xl mx-auto w-full">

      {/* Empty state */}
      {!result && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-50 py-12">
          <p className="font-serif text-xl text-[#f4efe9]">What is active right now?</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed max-w-xs">
            Describe the situation, the pressure, or the pattern. Say it how it actually happened.
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex-1 overflow-y-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-9">
            <Section label="Active pattern" value={result.activePattern} />
            <Section label="The Repeat" value={result.theRepeat} />
            <Section label="Old Role" value={result.oldRole} />
            <Section label="What You Learned to Carry" value={result.whatYouLearnedToCarry} />
            <Section label="Strain Pattern" value={result.strainPattern} />
            <Section label="Gift Under Strain" value={result.giftUnderStrain} />
            <Section label="Alignment" value={result.alignment} />

            {result.bestNextResponse && (
              <div className="border-b border-white/[0.05] pb-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-2">Best Next Response</p>
                <p className="text-[15px] text-[#f4efe9] leading-[1.7] mb-4">
                  {typeof result.bestNextResponse === "object"
                    ? result.bestNextResponse.summary
                    : result.bestNextResponse}
                </p>
                {typeof result.bestNextResponse === "object" &&
                  Array.isArray(result.bestNextResponse.phrasing) &&
                  result.bestNextResponse.phrasing.length > 0 && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3">
                      {result.bestNextResponse.phrasing.map((phrase, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-[#a8a29a] leading-relaxed">
                          <span className="text-[#e0743a]/50 shrink-0 mt-0.5">↳</span>
                          <span>{phrase}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {result.conversationalSteering && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-3">Steer Toward</p>
                  <ul className="space-y-2">
                    {result.conversationalSteering.do?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#a8a29a] leading-relaxed">
                        <span className="text-[#e0743a]/50 shrink-0">+</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-3">Avoid</p>
                  <ul className="space-y-2">
                    {result.conversationalSteering.avoid?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#a8a29a] leading-relaxed">
                        <span className="text-red-400/40 shrink-0">−</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-6 h-6 border border-white/20 border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-sm text-[#76716b]">Reading the pattern…</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-none">
        {error && <p className="text-sm text-red-400/80 text-center mb-3">{error}</p>}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the situation, the pressure, or the pattern. Say it how it actually happened."
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[100px] text-sm p-5 leading-[1.75]"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          />
          <div className="flex justify-between items-center px-5 py-3 border-t border-white/[0.06]">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">↵ Enter to run Defrag</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
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
        { id: "input", label: "Defrag", content: main },
        { id: "context", label: "Context", content: sidebar },
        { id: "library", label: "Library", content: contextPanel },
      ]}
    />
  )
}