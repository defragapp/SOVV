"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FadeUp } from "@/components/ui/fade-up"
import type { Tier, SubscriptionStatus } from "@/components/workspace/types"

// Covenant space — faith-context reflection space inside Sovereign.os
// Shares auth, Baseline Design, Library, and subscription with Defrag and all spaces.
// Saves Covenant Briefs to library with workspace_source: "COVENANT".

export default function CovenantSpacePage() {
  const router = useRouter()
  const [tier, setTier] = useState<Tier | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
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
        return res.ok ? res.json() : { tier: "free", subscription_status: "free" }
      })
      .then((data) => {
        if (data) {
          setTier(data.tier)
          setSubscriptionStatus(data.subscription_status || "free")
        }
      })
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
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-micro text-[#F6F5F3]/30"
        >
          Loading Covenant space…
        </motion.div>
      </div>
    )
  }

  const subscriptionActive = tier === "pro" || subscriptionStatus === "active"

  return (
    <div className="min-h-screen bg-black text-[#F6F5F3] flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-12 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-8 bg-black/80 backdrop-blur-xl sticky top-0 z-40"
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="text-micro text-[#F6F5F3]/25 hover:text-[#F6F5F3]/50 transition-colors">
            Sovereign.os
          </Link>
          <span className="text-[#F6F5F3]/15 text-micro">/</span>
          <span className="text-micro text-[#F6F5F3]/40">Covenant space</span>
        </div>
        <div className="flex items-center gap-4">
          {tier === "pro" && (
            <span className="text-micro text-[#F6F5F3]/25 border border-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded-iOS">Pro</span>
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
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-start px-8 py-16 max-w-2xl mx-auto w-full">
        <FadeUp className="w-full space-y-10">
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
          {!subscriptionActive && (
            <FadeUp delay={0.1}>
              <div className="border border-[rgba(255,255,255,0.08)] bg-white/3 p-8 space-y-4 rounded-iOS">
                <p className="text-label text-[#F6F5F3]/55">Pro feature</p>
                <p className="text-body text-sm">
                  Covenant is available on the Pro plan. Upgrade to access faith-context reflection alongside Defrag.
                </p>
                <Link
                  href="/api/billing/checkout"
                  className="inline-flex border border-[#F6F5F3]/20 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3] hover:bg-white/5 transition-all duration-200 rounded-iOS"
                >
                  Upgrade to Pro — $20/mo
                </Link>
              </div>
            </FadeUp>
          )}

          {/* Input form — only for Pro */}
          {subscriptionActive && (
            <FadeUp delay={0.1}>
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
                    className="sovv-input resize-none leading-7 bg-white/3 border-[rgba(255,255,255,0.08)] rounded-iOS"
                    style={{ fontSize: "16px" }} // iOS zoom prevention
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || !moment.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="border border-[#F6F5F3]/20 py-3.5 px-8 font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3] hover:bg-white/5 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed rounded-iOS"
                >
                  {loading ? "Reflecting…" : "Bring it to Covenant"}
                </motion.button>
              </form>
            </FadeUp>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-label text-red-400/60"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <FadeUp>
                <div className="space-y-8 border-t border-[rgba(255,255,255,0.08)] pt-10">
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
                    <motion.button
                      onClick={handleSave}
                      disabled={saved}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="border border-[#F6F5F3]/20 py-3 px-6 font-mono text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all duration-200 rounded-iOS disabled:opacity-30"
                    >
                      {saved ? "Saved to Library" : "Save to Sovereign.os Library"}
                    </motion.button>
                    <button
                      onClick={() => { setResult(null); setMoment(""); setSaved(false) }}
                      className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors py-3"
                    >
                      New reflection
                    </button>
                  </div>
                </div>
              </FadeUp>
            )}
          </AnimatePresence>
        </FadeUp>
      </main>
    </div>
  )
}