import Link from "next/link"
"use client"

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
        // First redeem the promo code, then proceed to checkout
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
      setError("Connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.0, 0.0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/20 mb-3">
            Sovereign.os
          </p>
          <div className="h-px w-full bg-[#F6F5F3]/10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40 mb-4">
            Space requires Pro
          </h1>
          <p className="text-sm leading-relaxed text-white/30 max-w-xs mx-auto">
            An active subscription is required to use the Defrag space.
            Upgrade to Pro for unlimited sessions, relational analysis, and
            pattern tracking.
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          whileHover={{ backgroundColor: "rgba(246,245,243,0.08)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full border border-border-hover px-4 py-3.5 font-mono text-[10px] uppercase tracking-widest text-foreground transition-colors duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                ···
              </motion.span>
            </span>
          ) : (
            "Upgrade to Pro — $20/mo"
          )}
        </motion.button>

        {/* Promo code toggle */}
        <motion.button
          type="button"
          onClick={() => setShowPromo(!showPromo)}
          className="mt-4 font-mono text-[9px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
        >
          {showPromo ? "Hide promo code" : "Have a promo code?"}
        </motion.button>

        <AnimatePresence>
          {showPromo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="ENTER CODE"
                className="w-full border border-border bg-transparent px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-foreground placeholder-white/15 focus:border-border-focus focus:outline-none transition-colors text-center"
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
              className="mt-4 font-mono text-[9px] uppercase tracking-widest text-red-400/70"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 font-mono text-[9px] uppercase tracking-widest text-white/15"
        >
          Pro unlocks people, groups, unlimited sessions
        </motion.p>

        <div className="mt-6">
          <a
            href="/"
            className="font-mono text-[9px] uppercase tracking-widest text-white/15 hover:text-white/35 transition-colors duration-200"
          >
            ← Back to Sovereign.os
          </a>
        </div>
      </motion.div>
    </div>
  )
}