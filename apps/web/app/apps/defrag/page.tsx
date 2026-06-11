"use client"
<<<<<<< HEAD

import { useEffect, useMemo, useState } from "react"

type DefragResult = {
  id: string
  workspaceSource: "DEFRAG"
  createdAt: string
  title: string
  summary: string
  activePattern: string
  theRepeat: string
  oldRole: string
  whatYouLearnedToCarry: string
  strainPattern: string
  giftUnderStrain: string
  alignment: string
  bestNextResponse: {
    summary: string
    phrasing: string[]
  }
  conversationalSteering: {
    do: string[]
    avoid: string[]
  }
  sourcesUsed: {
    baseline: boolean
    history: boolean
    sourceIds?: string[]
    invitedUsers?: boolean
  }
  media: {
    audioOverviewAvailable: boolean
    watchPreviewAvailable: boolean
  }
  metadata: {
    confidence?: "low" | "medium" | "high"
    structured: true
  }
}

type BaselineResponse = {
  loaded: boolean
  baseline?: unknown
}

type TierResponse = {
  tier: "FREE" | "PRO" | string
}

export default function DefragPage() {
  const [prompt, setPrompt] = useState("")
  const [baselineLoaded, setBaselineLoaded] = useState(false)
  const [tier, setTier] = useState<string>("FREE")
  const [result, setResult] = useState<DefragResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void bootstrap()
  }, [])

  async function bootstrap() {
    try {
      const [baselineRes, tierRes] = await Promise.all([
        fetch("/api/baseline", { credentials: "include" }),
        fetch("/api/auth/tier", { credentials: "include" }),
      ])

      if (baselineRes.ok) {
        const baselineJson = (await baselineRes.json()) as BaselineResponse
        setBaselineLoaded(Boolean(baselineJson?.loaded))
      }

      if (tierRes.ok) {
        const tierJson = (await tierRes.json()) as TierResponse
        setTier(tierJson?.tier ?? "FREE")
      }
    } catch {
      // preserve trust: do not hard-fail page load
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
=======
import * as React from "react"
import { SpaceShell } from "@/components/workspace/space-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DefragPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const handleExplain = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setResult(null)
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to explain")
      }
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
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_source: "DEFRAG",
          title: result.title || result.activePattern || "Defrag Result",
          payload: result,
          content: result.summary || ""
        })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to save")
      }
      setSaveSuccess(true)
    } catch (err: any) {
      alert("Save failed: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em]">Library</h3>
      </div>
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-mono text-[#3F3F46] leading-relaxed">Save useful Results here so you can return before the old pattern takes over again.</p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-px">
      <div className="border border-white/[0.06] bg-[#080808] p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Baseline Design</p>
        <p className="text-xs text-[#71717A]">Your Baseline Design gives the system context before you describe this moment.</p>
      </div>
      
      {result && (
        <>
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-3">
             <Button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="w-full rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8"
              >
                {isSaving ? "Saving..." : saveSuccess ? "Saved to Library" : "Save to Sovereign"}
              </Button>
          </div>
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Audio Overview</p>
            <p className="text-xs text-[#52525B]">Audio Overview is not available for this Result yet.</p>
          </div>
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Watch Preview</p>
            <p className="text-xs text-[#52525B]">Watch Preview is not available for this Result yet.</p>
          </div>
        </>
      )}
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 max-w-sm mx-auto opacity-50">
        <div className="w-10 h-10 border border-white/[0.08] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#71717A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="gap-2 flex flex-col">
          <h2 className="text-base font-medium text-[#FAFAFA] tracking-tight">What’s happening right now?</h2>
          <p className="text-xs text-[#52525B] font-mono leading-relaxed">
            Understand what is active in the moment and what response gives it a better chance.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-4 font-mono">
          {error}
        </div>
      )}

      <div className="border border-white/[0.08] bg-[#080808] focus-within:border-white/[0.18] transition-colors duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the situation, pressure, or pattern you want to understand."
          className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3F3F46] resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleExplain();
            }
          }}
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-[#3F3F46] font-mono tracking-wide">ENTER TO DEFRAG</span>
          <Button
            size="sm"
            onClick={handleExplain}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Running..." : "Defrag"}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSection = (title: string, content: any, isArray: boolean = false) => {
    if (!content) return null;
    return (
      <div className="border-b border-white/[0.06] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
        <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">{title}</h4>
        {isArray ? (
          <ul className="list-disc pl-4 space-y-2">
            {Array.isArray(content) ? content.map((item: string, i: number) => (
              <li key={i} className="text-sm text-[#FAFAFA] font-mono leading-relaxed">{item}</li>
            )) : <li className="text-sm text-[#FAFAFA] font-mono leading-relaxed">{String(content)}</li>}
          </ul>
        ) : (
          <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed whitespace-pre-wrap">{String(content)}</p>
        )}
      </div>
    )
  }

  const mainResultArea = (
    <div className="h-full flex flex-col">
      {!result ? (
        <div className="flex-1 flex items-center justify-center border border-white/[0.06] bg-[#080808] p-6 text-center">
          <p className="text-sm text-[#52525B] font-mono leading-relaxed max-w-sm">
            Your Result will appear here in structured sections you can use, save, and return to later.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-white/[0.06] bg-[#080808] p-8">
           {renderSection("Active pattern", result.activePattern)}
           {renderSection("The Repeat", result.theRepeat)}
           {renderSection("Old Role", result.oldRole)}
           {renderSection("What You Learned to Carry", result.whatYouLearnedToCarry)}
           {renderSection("Strain Pattern", result.strainPattern)}
           {renderSection("Gift Under Strain", result.giftUnderStrain)}
           {renderSection("Alignment", result.alignment)}
           
           {result.bestNextResponse && (
             <div className="border-b border-white/[0.06] pb-6 mb-6">
                <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">Best Next Response</h4>
                <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed mb-4">{result.bestNextResponse.summary || String(result.bestNextResponse)}</p>
                {Array.isArray(result.bestNextResponse.phrasing) && result.bestNextResponse.phrasing.length > 0 && (
                   <div className="bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col gap-2">
                      {result.bestNextResponse.phrasing.map((phrase: string, i: number) => (
                        <div key={i} className="text-sm text-[#E4E4E7] font-mono leading-relaxed flex items-start gap-3">
                           <span className="text-[#3F3F46] mt-0.5">↳</span>
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
                  <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">Steer Toward</h4>
                  <ul className="space-y-2">
                    {Array.isArray(result.conversationalSteering.do) ? result.conversationalSteering.do.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-[#E4E4E7] font-mono flex items-start gap-2">
                        <span className="text-[#10B981]">+</span>
                        <span>{item}</span>
                      </li>
                    )) : <li className="text-sm text-[#E4E4E7] font-mono">{String(result.conversationalSteering)}</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">Avoid</h4>
                  <ul className="space-y-2">
                    {Array.isArray(result.conversationalSteering.avoid) ? result.conversationalSteering.avoid.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-[#E4E4E7] font-mono flex items-start gap-2">
                        <span className="text-[#EF4444]">-</span>
                        <span>{item}</span>
                      </li>
                    )) : null}
                  </ul>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  )
>>>>>>> 0d32d2b (feat: complete platform implementation (defrag, library, spaces, api normalization))

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode: "self",
          baselineLoaded,
        }),
      })

      if (!res.ok) {
        throw new Error("Unable to generate Defrag Result.")
      }

      const json = (await res.json()) as DefragResult
      setResult(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/history", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_source: "DEFRAG",
          title: result.title,
          payload: result,
        }),
      })

      if (!res.ok) {
        throw new Error("Unable to save to Sovereign.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.")
    } finally {
      setSaving(false)
    }
  }

  const canGenerate = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading])

  // On Desktop we can show Input and Result side by side, or adapt SpaceShell.
  // SpaceShell expects one "main" node. We'll compose them.
  const desktopMain = (
    <div className="flex flex-col h-full gap-6">
       <div className="flex-none">{mainInputArea}</div>
       <div className="flex-1 min-h-0">{mainResultArea}</div>
    </div>
  )

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-[#0B0B0D] text-[#F5F5F6]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 border-b border-[#2A2A31] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Defrag</h1>
              <p className="mt-1 text-sm text-[#B1B1BA]">
                Understand what is active in the moment and what response gives it a better chance.
              </p>
            </div>

            <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#2A2A31] px-3 py-1 text-xs text-[#B1B1BA]">
                {baselineLoaded ? "Baseline Design active" : "Baseline Design incomplete"}
              </span>
              <span className="rounded-full border border-[#2A2A31] px-3 py-1 text-xs text-[#B1B1BA]">
                {tier}
              </span>
            </div>
          </div>
        </header>

        {/* Desktop grid */}
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          {/* Context panel */}
          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
              <h2 className="text-sm font-medium text-[#F5F5F6]">Context</h2>
              <p className="mt-2 text-sm text-[#B1B1BA]">
                The system uses your Baseline Design as context before you describe this moment.
              </p>
            </section>

            <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
              <h2 className="text-sm font-medium text-[#F5F5F6]">Library</h2>
              <p className="mt-2 text-sm text-[#B1B1BA]">
                Save useful Results so you can return before the old pattern takes over again.
              </p>
            </section>

            <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
              <h2 className="text-sm font-medium text-[#F5F5F6]">Invite Privately</h2>
              <p className="mt-2 text-sm text-[#B1B1BA]">
                When both sides matter, compare perspectives only with permission.
              </p>
            </section>
          </aside>

          {/* Thread / input */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
              <label htmlFor="defrag-prompt" className="mb-3 block text-sm font-medium text-[#F5F5F6]">
                What’s happening right now?
              </label>
              <textarea
                id="defrag-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[180px] w-full rounded-xl border border-[#2A2A31] bg-[#131317] px-4 py-3 text-sm text-[#F5F5F6] outline-none placeholder:text-[#7D7D86]"
                placeholder="Describe the situation, pressure, or pattern you want to understand."
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="rounded-xl bg-[#F5F5F6] px-4 py-2 text-sm font-medium text-[#0B0B0D] disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Defrag Result"}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-[#472B2B] bg-[#1B1212] p-4 text-sm text-[#F0C7C7]">
                {error}
              </div>
            ) : null}
          </section>

          {/* Result panel */}
          <section className="space-y-4">
            {!result ? (
              <div className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
                <h2 className="text-sm font-medium text-[#F5F5F6]">Defrag Result</h2>
                <p className="mt-2 text-sm text-[#B1B1BA]">
                  Your Result will appear here in structured sections you can use, save, and return to later.
                </p>
              </div>
            ) : (
              <>
                <ResultCard title="What is active" body={result.activePattern} />
                <ResultCard title="The Repeat" body={result.theRepeat} />
                <ResultCard title="Old Role" body={result.oldRole} />
                <ResultCard title="What You Learned to Carry" body={result.whatYouLearnedToCarry} />
                <ResultCard title="Strain Pattern" body={result.strainPattern} />
                <ResultCard title="Gift Under Strain" body={result.giftUnderStrain} />
                <ResultCard title="Alignment" body={result.alignment} />

                <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
                  <h2 className="text-lg font-semibold text-[#F5F5F6]">Best Next Response</h2>
                  <p className="mt-2 text-sm text-[#F5F5F6]">{result.bestNextResponse.summary}</p>
                  {result.bestNextResponse.phrasing?.length ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#B1B1BA]">
                      {result.bestNextResponse.phrasing.map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
                  <h2 className="text-lg font-semibold text-[#F5F5F6]">Conversational Steering</h2>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-[#F5F5F6]">Do</h3>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[#B1B1BA]">
                        {result.conversationalSteering.do.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#F5F5F6]">Avoid</h3>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[#B1B1BA]">
                        {result.conversationalSteering.avoid.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl bg-[#F5F5F6] px-4 py-2 text-sm font-medium text-[#0B0B0D] disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save to Sovereign.os Library"}
                    </button>
                    <button
                      disabled={!result.media.audioOverviewAvailable}
                      className="rounded-xl border border-[#2A2A31] px-4 py-2 text-sm text-[#F5F5F6] disabled:opacity-50"
                    >
                      Audio Overview
                    </button>
                    <button
                      disabled={!result.media.watchPreviewAvailable}
                      className="rounded-xl border border-[#2A2A31] px-4 py-2 text-sm text-[#F5F5F6] disabled:opacity-50"
                    >
                      Watch Preview
                    </button>
                  </div>
                </section>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function ResultCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-[#2A2A31] bg-[#16161C] p-5">
      <h2 className="text-lg font-semibold text-[#F5F5F6]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#B1B1BA]">{body}</p>
    </section>
=======
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebarContent}
      main={desktopMain}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
>>>>>>> 0d32d2b (feat: complete platform implementation (defrag, library, spaces, api normalization))
  )
}
