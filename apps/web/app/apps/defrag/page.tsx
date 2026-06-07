"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Shell from "@/components/workspace/Shell"
import type { Tier } from "@/components/workspace/types"

// Defrag space — the relational intelligence space inside Sovereign.os
// Shares auth, Baseline Design, Library, and subscription with all spaces.

function DefragSpaceInner() {
  const [tier, setTier] = useState<Tier>("free")
  const [upgraded, setUpgraded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch("/api/auth/tier", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { tier: "free" }))
      .then((data) => setTier(data.tier))
      .catch(() => setTier("free"))

    if (searchParams.get("upgraded") === "1") {
      setUpgraded(true)
      const url = new URL(window.location.href)
      url.searchParams.delete("upgraded")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  return (
    <>
      {/* Pro upgrade banner */}
      <AnimatePresence>
        {upgraded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[#B8960C]/10 border-b border-[#B8960C]/25 px-6 py-3"
          >
            <p className="text-micro text-[#B8960C]">
              Pro is active. Your full pattern is now available.
            </p>
            <button
              onClick={() => setUpgraded(false)}
              className="text-micro text-[#F6F5F3]/30 hover:text-[#F6F5F3]/60 transition-colors touch-target"
              aria-label="Dismiss upgrade notice"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Shell tier={tier} spaceLabel="Defrag" />
    </>
  )
}

function DefragLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05070B]">
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-micro text-[#F6F5F3]/30"
      >
        Loading Defrag space…
      </motion.div>
    </div>
  )
}

export default function DefragSpacePage() {
  return (
    <Suspense fallback={<DefragLoading />}>
      <DefragSpaceInner />
    </Suspense>
  )
}