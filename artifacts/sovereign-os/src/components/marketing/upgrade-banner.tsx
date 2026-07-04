import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRICING_CONFIG } from "@/data/marketing"

export function UpgradeBanner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUpgrade = async () => {
    if (loading) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? "Could not start checkout. Please try again.")
        setLoading(false)
      }
    } catch {
      setError("Connection failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#111111] to-[#0A0A0A] border border-white/[0.06] rounded-[10px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 ">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-[15px] text-[#f4efe9]">Sovereign.os Pro</h3>
          <Badge variant="pro">{PRICING_CONFIG.pro.price}/{PRICING_CONFIG.pro.period}</Badge>
        </div>
        <p className="text-sm text-[#a8a29a]">
          Unlock saved Results, your private Library, and deeper context across Defrag and Covenant.
        </p>
        {error ? <p className="text-xs text-red-400/80">{error}</p> : null}
      </div>
      <div className="w-full sm:w-auto shrink-0">
        <Button variant="premium" className="w-full sm:w-auto" onClick={handleUpgrade} disabled={loading}>
          {loading ? "···" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  )
}
