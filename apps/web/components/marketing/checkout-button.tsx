"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"


export function CheckoutButton({ priceId, cta }: { priceId: string; cta: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCheckout = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        // Fallback or explicit check if Stripe is not configured
        if (data.error && data.error.includes("STRIPE_SECRET_KEY")) {
           setError("Checkout is not configured in this environment.")
        } else {
           setError(data.error || "Checkout failed")
        }
      }
    } catch (e) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="premium" 
        className="w-full rounded-none border border-white/[0.06] bg-[#f4efe9] text-[#08070a] hover:bg-[#f4efe9]/90 font-sans font-medium text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors disabled:opacity-50"
        onClick={handleCheckout} 
        disabled={loading}
      >
        {loading ? "..." : cta}
      </Button>
      {error && <p className="text-red-400 text-[10px] font-sans font-medium mt-1">{error}</p>}
    </div>
  )
}
