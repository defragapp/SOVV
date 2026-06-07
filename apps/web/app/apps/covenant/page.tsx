"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Tier } from "@/components/workspace/types"

// Covenant space — faith-context reflection space inside Sovereign.os
// Shares auth, Baseline Design, Library, and subscription with Defrag and all spaces.
// Saves Covenant Briefs to library with workspace_source: "COVENANT".

export default function CovenantSpacePage() {
  const router = useRouter()
  const [tier, setTier] = useState<Tier | null>(null)
  const [moment, setMoment] = useState("")
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to reach Covenant space.")
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
      <div className="flex min-h-screen items-center justify-center bg-[#05070B]">
        <div className="shimmer h-4 w-24 rounded-none" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070B] text-[#F6F5F3] flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#F6F5F3]/8 px-6 glass sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-micro text-[#F6F5F3]/25 hover:text-[#F6F5F3]/50 transition-colors">
            Sovereign.os
          </Link>
          <span className="text-[#F6F5F3]/15 text-micro">/</span>
          <span className="text-micro text-[#F6F5F3]/40">Covenant space</span>
        </div>
        <div className="flex items-center gap-4">
          {tier === "pro" && (
            <span className="text-micro text-[#F6F5F3]/25 border border-[#F6F5F3]/10 px-2 py-0.5">Pro</span>
          )}
          <Link href="/apps/defrag" className="text-micro text-[#F6F5F3]/30 hover:text-[#F6F5F3]/60 transition-colors">
            Defrag space
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-micro text-[#F6F5F3]/25 hover:text-[#F6F5F3]/50 transition-colors touch-target">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-6 py-16 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-10">

          {/* Space intro */}
          <div className="space-y-4">
            <span className="space-badge-covenant">Covenant space</span>
            <h1 className="text-headline mt-3">
              Faith-context reflection<br />for what you are walking through.
            </h1>
            <p className="text-body">
              Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through. Put the moment into context. Receive a structured reflection, a story connection, and a grounded next step — without preaching, certainty, or performance.
            </p>
            <div className="accent-oxblood">
              <p className="text-caption text-xs">
                Uses your shared Baseline Design. Saves Covenant Briefs to your Sovereign.os Library.
              </p>
            </div>
          </div>

          {/* Pro gate */}
          {tier === "free" && (
            <div className="border border-white/12 bg-white/3 p-6 space-y-4">
              <p className="text-label text-[#F6F5F3]/55">Pro feature</p>
              <p className="text-body text-sm">
                Covenant is available on the Pro plan. Upgrade to access faith-context reflection alongside Defrag.
              </p>
              <Link href="/pricing" className="sovv-button inline-flex py-3 px-6">
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Input form — only for Pro */}
          {tier === "pro" && (
            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Covenant reflection input">
              <div>
                <label htmlFor="covenant-moment" className="sovv-label">
                  What are you walking through?
                </label>
                <textarea
                  id="covenant-moment"
                  value={moment}
                  onChange={(e) => setMoment(e.target.value)}
                  placeholder="Describe what is happening — a relationship, a decision, a grief, a pattern you keep returning to."
                  rows={5}
                  className="sovv-input resize-none leading-7"
                  style={{ fontSize: "16px" }} // iOS zoom prevention
                />
              </div>
              <button
                type="submit"
                disabled={loading || !moment.trim()}
                className="sovv-button py-3.5 px-8 w-full sm:w-auto"
              >
                {loading ? "Reflecting…" : "Bring it to Covenant"}
              </button>
            </form>
          )}

          {/* Error */}
          {error && (
            <p className="text-label text-red-400/60">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-8 border-t border-[#F6F5F3]/8 pt-10">
              {result.moment_feels_like && (
                <div className="space-y-2">
                  <p className="text-label">The moment</p>
                  <p className="text-body text-sm leading-7">{result.moment_feels_like}</p>
                </div>
              )}
              {result.story_connection && (
                <div className="space-y-2 accent-oxblood">
                  <p className="text-label">A connection</p>
                  <p className="text-body text-sm leading-7">{result.story_connection}</p>
                </div>
              )}
              {result.reflection_prompt && (
                <div className="space-y-2">
                  <p className="text-label">Carry this</p>
                  <p className="text-body text-sm leading-7 italic text-[#F6F5F3]/50">{result.reflection_prompt}</p>
                </div>
              )}
              {result.next_step && (
                <div className="space-y-2">
                  <p className="text-label">One grounded step</p>
                  <p className="text-body text-sm leading-7">{result.next_step}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="sovv-button py-3 px-6 text-[9px]"
                >
                  {saved ? "Saved to Library" : "Save to Sovereign.os Library"}
                </button>
                <button
                  onClick={() => { setResult(null); setMoment(""); setSaved(false) }}
                  className="sovv-button-ghost py-3"
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