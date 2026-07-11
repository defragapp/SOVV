"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function UpgradeBanner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [showPromo, setShowPromo] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    setError("")

    try {
      if (promoCode.trim()) {
        const promoRes = await fetch("/api/promo/redeem", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
        })
        const promoData = await promoRes.json() as { discount_percent?: number; error?: string }
        if (!promoRes.ok && promoData.error !== "Invalid or inactive promo code") {
          setError(promoData.error || "Invalid promo code")
          return
        }
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
      })

      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setError(data.error || "Checkout unavailable")
        return
      }

      window.location.href = data.url
    } catch {
      setError("Connection failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#08070a] text-[#f4efe9] relative overflow-hidden">

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
        className="relative z-10 w-full max-w-md px-6 py-12 text-center"
      >

        {/* Wordmark */}
        <div className="mb-12">
          <span className="font-mono text-xs tracking-[0.28em] text-[#f4efe9] uppercase">
            SOVEREIGN.OS
          </span>
          <div className="h-px w-full bg-white/[0.06] mt-4" />
        </div>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="font-serif text-2xl text-[#f4efe9] mb-4">
            This space requires Pro.
          </h1>
          <p className="text-base text-[#a8a29a] leading-relaxed max-w-sm mx-auto">
            Upgrade to Pro for unlimited sessions, the Covenant space, the Alignment space, full Sovereign.os Library depth, and Invite Privately.
          </p>
        </div>

        {/* Upgrade button */}
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-11 bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed mb-4"
          style={{ borderRadius: "var(--radius-button)" }}
        >
          {loading ? "···" : "Upgrade to Pro — $20/mo"}
        </button>

        {/* Promo code */}
        <button
          type="button"
          onClick={() => setShowPromo(!showPromo)}
          className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200 mb-3"
        >
          {showPromo ? "Hide promo code" : "Have a promo code?"}
        </button>

        <AnimatePresence>
          {showPromo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 text-center tracking-[0.2em] uppercase"
                style={{ borderRadius: "var(--radius-input)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400/80 mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* What Pro includes */}
        <div className="mt-8 text-left border border-white/[0.06] rounded-[14px] p-6 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#76716b] mb-4">Pro includes</p>
          {[
            "Unlimited sessions",
            "Covenant space — faith-context reflection",
            "Alignment space — response integration",
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

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200"
          >
            ← Back to Sovereign.os
          </Link>
        </div>

      </motion.div>
    </div>
  )
}
