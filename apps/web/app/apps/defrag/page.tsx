"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
      {upgraded && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-[#F6F5F3]/5 border-b border-[#F6F5F3]/10 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3]/70">
            Pro is active. Your full pattern is now available.
          </p>
          <button
            onClick={() => setUpgraded(false)}
            className="ml-6 font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60"
          >
            Dismiss
          </button>
        </div>
      )}
      <Shell tier={tier} spaceLabel="Defrag" />
    </>
  )
}

export default function DefragSpacePage() {
  return (
    <Suspense>
      <DefragSpaceInner />
    </Suspense>
  )
}