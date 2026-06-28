"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/auth"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getSession().then((session) => {
      if (!session?.authenticated) {
        router.push("/app/login")
      }
    })
  }, [router])

  async function startCheckout() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout unavailable. Try again.")
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError("Connection failed. Try again.")
      setLoading(false)
    }
  }

  async function openPortal() {
    setPortalLoading(true)
    setError("")
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error || "Portal unavailable. Try again.")
        setPortalLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError("Connection failed. Try again.")
      setPortalLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#08070a] text-[#f4efe9] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Warm ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(224,116,58,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >

        {/* Wordmark */}
        <div className="mb-10 text-center">
          <span className="font-mono text-xs tracking-[0.3em] text-[#f4efe9] uppercase font-medium">
            SOVEREIGN.OS
          </span>
          <div className="h-px w-full bg-white/[0.06] mt-4" />
        </div>

        <div className="border border-white/[0.08] bg-[#0c0a0d] p-8 flex flex-col gap-8"
          style={{ borderRadius: "var(--radius-container)" }}>

          <div className="text-center">
            <h1 className="font-serif text-2xl text-[#f4efe9] mb-3">
              Upgrade to Pro
            </h1>
            <p className="text-sm text-[#a8a29a] leading-relaxed">
              Unlimited sessions, all spaces, full Library depth, and Invite Privately.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-[10px] border border-red-500/20 bg-red-500/5 p-4 text-center"
              >
                <p className="text-sm text-red-400/80">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">

            {/* Pro plan */}
            <button
              onClick={startCheckout}
              disabled={loading}
              className="w-full border border-white/[0.08] bg-white/[0.02] p-5 text-left hover:border-[#e0743a]/30 hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: "var(--radius-container)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-medium text-[#f4efe9]">Sovereign.os Pro</span>
                <span className="font-serif text-lg text-[#f4efe9]">$12<span className="text-sm text-[#76716b] font-sans font-normal">/mo</span></span>
              </div>
              <p className="text-sm text-[#a8a29a]">
                {loading ? "Redirecting to checkout…" : "Unlimited sessions · All spaces · Full Library"}
              </p>
            </button>

            {/* Manage existing */}
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="w-full h-11 border border-white/[0.08] text-sm text-[#76716b] hover:text-[#f4efe9] hover:border-white/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderRadius: 8 }}
            >
              {portalLoading ? "···" : "Manage existing subscription"}
            </button>

          </div>

          {/* What Pro includes */}
          <div className="border-t border-white/[0.06] pt-6 space-y-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-4">Pro includes</p>
            {[
              "Everything in Free",
              "Unlimited sessions",
              "Covenant space",
              "Alignment space",
              "Full Sovereign.os Library depth",
              "Invite Privately",
              "Audio Overview",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#a8a29a]">
                <span className="text-[#e0743a]/60 shrink-0">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-6 text-center">
          <Link
            href="/apps/defrag"
            className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200"
          >
            ← Back to your space
          </Link>
        </div>

      </motion.div>
    </div>
  )
}