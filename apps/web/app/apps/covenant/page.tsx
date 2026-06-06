"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Tier } from "@/components/workspace/types"

// Covenant space — optional faith-context reflection space inside Sovereign.os
// Shares auth, Baseline Design, Library, and subscription with Defrag and all spaces.
// Saves outputs to library with workspace_source: "COVENANT".

export default function CovenantSpacePage() {
  const router = useRouter()
  const [tier, setTier] = useState<Tier | null>(null)
  const [moment, setMoment] = useState("")
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Verify auth and tier — shared with all spaces
    fetch("/api/auth/tier", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.push("/app/login")
          return null
        }
        return res.ok ? res.json() : { tier: "free" }
      })
      .then((data) => { if (data) setTier(data.tier) })
      .catch(() => router.push("/app/login"))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!moment.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)

    try {
      const res = await fetch("/api/covenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ moment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong.")
      const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result
      setResult(parsed)
    } catch (err: any) {
      setError(err.message || "Unable to reach Covenant space.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workspace_source: "COVENANT",
          title: moment.slice(0, 80),
          payload: result,
        }),
      })
      if (res.ok) setSaved(true)
    } catch {
      // silent — save is best-effort
    }
  }

  if (tier === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#F6F5F3] flex flex-col">
      {/* Header */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#F6F5F3]/10 px-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-white/40">
            Sovereign.os
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">
            / Covenant space
          </span>
        </div>
        <div className="flex items-center gap-4">
          {tier === "pro" && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/25 border border-white/10 px-2 py-0.5">
              Pro
            </span>
          )}
          <button
            onClick={() => router.push("/apps/defrag")}
            className="font-mono text-xs uppercase tracking-widest text-white/40 hover:text-[#F6F5F3]"
          >
            Defrag space
          </button>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-widest text-white/40 hover:text-[#F6F5F3]"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-16 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">
              Covenant — reflection space
            </p>
            <h1 className="text-2xl font-light text-white">
              What are you walking through?
            </h1>
            <p className="text-sm text-white/40 leading-7">
              Bring the moment here. Covenant will connect it to a faith-based theme and offer a grounded reflection — not preaching, not pressure.
            </p>
            <p className="text-xs text-white/25 font-mono uppercase tracking-widest">
              Uses your shared Baseline Design and saves to your Sovereign.os Library.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={moment}
              onChange={(e) => setMoment(e.target.value)}
              placeholder="Describe what is happening..."
              rows={5}
              className="w-full bg-transparent border border-[#F6F5F3]/10 px-4 py-3 text-sm text-[#F6F5F3] placeholder-white/20 focus:outline-none focus:border-[#F6F5F3]/30 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !moment.trim()}
              className="border border-[#F6F5F3]/20 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Reflecting..." : "Bring it to Covenant"}
            </button>
          </form>

          {error && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-red-400/70">{error}</p>
          )}

          {result && (
            <div className="space-y-6 border-t border-[#F6F5F3]/10 pt-8">
              {result.moment_feels_like && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-2">The moment</p>
                  <p className="text-sm leading-7 text-white/70">{result.moment_feels_like}</p>
                </div>
              )}
              {result.story_connection && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-2">A connection</p>
                  <p className="text-sm leading-7 text-white/70">{result.story_connection}</p>
                </div>
              )}
              {result.reflection_prompt && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-2">Carry this</p>
                  <p className="text-sm leading-7 text-white/60 italic">{result.reflection_prompt}</p>
                </div>
              )}
              {result.next_step && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-2">One step</p>
                  <p className="text-sm leading-7 text-white/70">{result.next_step}</p>
                </div>
              )}

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="border border-[#F6F5F3]/15 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/80 hover:border-[#F6F5F3]/30 transition-colors disabled:opacity-30"
                >
                  {saved ? "Saved to Library" : "Save to Sovereign.os Library"}
                </button>
                <button
                  onClick={() => { setResult(null); setMoment(""); setSaved(false) }}
                  className="font-mono text-[9px] uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
                >
                  New reflection
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}