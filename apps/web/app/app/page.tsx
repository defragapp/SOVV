"use client"

import { useState, useEffect } from "react"
import Shell from "@/components/workspace/Shell"
import type { Tier } from "@/components/workspace/types"

export default function AppPage() {
  const [tier, setTier] = useState<Tier>("free")

  useEffect(() => {
    fetch("/api/auth/tier", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { tier: "free" }))
      .then((data) => setTier(data.tier))
      .catch(() => setTier("free"))
  }, [])

  return <Shell tier={tier} />
}
