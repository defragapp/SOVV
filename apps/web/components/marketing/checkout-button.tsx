"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CheckoutButton({ priceId, cta }: { priceId: string; cta: string }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
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
        alert(data.error || "Checkout failed")
      }
    } catch (e) {
      alert("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <Button
      variant="premium"
      className="w-full rounded-none border border-white bg-white text-black hover:bg-white/90 font-mono text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors disabled:opacity-50"
      onClick={handleCheckout}
=======
>>>>>>> cb16636 (feat: resolve merge conflict and redesign landing page to premium soft-brutalist theme)
    <Button
      variant="premium"
      className="w-full rounded-none border border-white bg-white text-black hover:bg-white/90 font-mono text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors disabled:opacity-50"
      onClick={handleCheckout}
<<<<<<< HEAD
=======
>>>>>>> c519dbe (feat: redesign landing page to premium soft-brutalist theme, standardize UI files, fix copy language rules, and verify end-to-end functionality)
>>>>>>> cb16636 (feat: resolve merge conflict and redesign landing page to premium soft-brutalist theme)
      disabled={loading}
    >
      {loading ? "..." : cta}
    </Button>
  )
}
