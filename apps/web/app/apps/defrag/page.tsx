"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"

export default function DefragPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

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
      setResult(null)
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
        body: JSON.stringify({ title: input.slice(0, 60) + (input.length > 60 ? "…" : ""), payload: result, workspace_source: "DEFRAG" }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveSuccess(true)
    } catch {
      // silent
    } finally {
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
        body: JSON.stringify({ result: { activePattern: result.activePattern, theRepeat: result.theRepeat, oldRole: result.oldRole, giftUnderStrain: result.giftUnderStrain, bestNextResponse: result.bestNextResponse?.summary || "" } }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})) as any; throw new Error(d.error || "Failed to generate audio") }
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (err: any) {
      setAudioError(err.message || "Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  // ── Result section renderer ──────────────────────────────────────
  const ResultSection = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null
    return (
      <div className="border-b border-white/[0.06] pb-7 mb-7 last:border-0 last:pb-0 last:mb-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">{label}</p>
        <p className="text-[15px] text-[#f4efe9] leading-relaxed">{value}</p>
      </div>
    )
  }

  // ── Sidebar ──────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Sovereign.os Library</p>
      </div>
      <div className="flex-1 px-6 py-8">
        <p className="text-sm text-[#76716b] leading-relaxed">
          The private record of what helped. Return here before the old pattern takes over again.
        </p>
      </div>
    </div>
  )

  // ── Context panel ────────────────────────────────────────────────
  const context = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Context</p>
      </div>
      <div className="p-6 flex flex-col gap-5">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-2">Baseline Design</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed">
            Your Baseline Design is active beneath every thread and never exposed in outputs.
          </p>
        </div>

        {result && (
          <div className="flex flex-col gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className="w-full h-10 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? "Saving…" : saveSuccess ? "Saved to Library ✓" : "Save to Sovereign"}
            </button>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-3">Audio Overview</p>
              {audioUrl ? (
                <audio controls src={audioUrl} className="w-full h-8 outline-none opacity-80 mt-1" />
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    className="w-full h-9 rounded-lg border border-white/[0.1] text-xs text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/20 transition-all disabled:opacity-30"
                  >
                    {isGeneratingAudio ? "Generating…" : "Generate Audio"}
                  </button>
                  {audioError && <p className="text-xs text-red-400/70">{audioError}</p>}
                  {!audioError && !isGeneratingAudio && <p className="text-xs text-[#4f4b47]">Pro feature</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── Input area ───────────────────────────────────────────────────
  const inputArea = (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {!result && (
        <div className="text-center py-8 opacity-60">
          <p className="font-serif text-xl text-[#f4efe9] mb-2">What is active right now?</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed max-w-sm mx-auto">
            Describe the situation, the pressure, or the pattern. Say it how it actually happened.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/20 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the situation, the pressure, or the pattern you want to understand."
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[140px] text-sm p-5 leading-[1.75]"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
        />
        <div className="flex justify-between items-center px-5 py-4 border-t border-white/[0.06]">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47]">Enter to run Defrag</span>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="h-9 px-6 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Running…" : "Defrag"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400/80 text-center">{error}</p>
      )}
    </div>
  )

  // ── Result area ──────────────────────────────────────────────────
  const resultArea = (
    <div className="max-w-3xl mx-auto w-full">
      {!result ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] flex items-center justify-center py-20 text-center">
          <p className="text-sm text-[#4f4b47] max-w-[260px] leading-relaxed">
            Your structured Result will appear here — Active pattern, Best Next Response, and Conversational Steering.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10">
          <ResultSection label="Active pattern" value={result.activePattern} />
          <ResultSection label="The Repeat" value={result.theRepeat} />
          <ResultSection label="Old Role" value={result.oldRole} />
          <ResultSection label="What You Learned to Carry" value={result.whatYouLearnedToCarry} />
          <ResultSection label="Strain Pattern" value={result.strainPattern} />
          <ResultSection label="Gift Under Strain" value={result.giftUnderStrain} />
          <ResultSection label="Alignment" value={result.alignment} />

          {result.bestNextResponse && (
            <div className="border-b border-white/[0.06] pb-7 mb-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">Best Next Response</p>
              <p className="text-[15px] text-[#f4efe9] leading-relaxed mb-4">
                {result.bestNextResponse.summary || String(result.bestNextResponse)}
              </p>
              {Array.isArray(result.bestNextResponse.phrasing) && result.bestNextResponse.phrasing.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3">
                  {result.bestNextResponse.phrasing.map((phrase: string, i: number) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">Steer Toward</p>
                <ul className="space-y-2">
                  {Array.isArray(result.conversationalSteering.do) && result.conversationalSteering.do.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#a8a29a] leading-relaxed">
                      <span className="text-[#e0743a]/60 shrink-0">+</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">Avoid</p>
                <ul className="space-y-2">
                  {Array.isArray(result.conversationalSteering.avoid) && result.conversationalSteering.avoid.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#a8a29a] leading-relaxed">
                      <span className="text-red-400/50 shrink-0">−</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const main = (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex-none">{inputArea}</div>
      <div className="flex-1 min-h-0 overflow-y-auto">{resultArea}</div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebar}
      contextPanel={context}
      main={main}
      mobileTabs={[
        { id: "input", label: "Defrag", content: inputArea },
        { id: "result", label: "Result", content: resultArea },
        { id: "context", label: "Context", content: context },
      ]}
    />
  )
}