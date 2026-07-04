

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
      if (res.status === 401) {
        window.location.href = "/app/login?next=/pricing"
        return
      }
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
        className="w-full h-12 px-8 bg-[#f4efe9] text-[#08070a] font-mono text-[10px] tracking-[0.14em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ borderRadius: "var(--radius-button)" }}
        onClick={handleCheckout} 
        disabled={loading}
      >
        {loading ? "..." : cta}
      </Button>
      {error && <p className="font-mono text-[9px] text-red-400/70 mt-1">{error}</p>}
    </div>
  )
}
