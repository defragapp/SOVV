"use client"

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

  return (
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
              <span className="rounded-full border border-[#2A2A31] px-3 py-1 text-xs text-[#B1B1BA]">
                {baselineLoaded ? "Baseline active" : "Baseline incomplete"}
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
                  <p className="mt-2 text-sm text-[#F5F5F6]">{result.bestNextResponse?.summary}</p>
                  {result.bestNextResponse?.phrasing?.length ? (
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
                      {saving ? "Saving..." : "Save to Sovereign"}
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
  )
}
