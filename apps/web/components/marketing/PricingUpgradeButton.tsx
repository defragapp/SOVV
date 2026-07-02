"use client"

import * as React from "react"

export function PricingUpgradeButton() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleUpgrade = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
      })

      if (res.status === 401) {
        window.location.href = "/app/login?return=/pricing"
        return
      }

      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setError(
          data.error === "billing_not_configured"
            ? "Checkout is not available right now."
            : "Something went wrong. Please try again."
        )
        return
      }

      window.location.href = data.url
    } catch {
      setError("Connection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="btn-primary w-full text-center relative disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "\u00b7\u00b7\u00b7" : "Upgrade to Pro"}
      </button>
      {error && (
        <p className="text-[11px] text-red-400/80 text-center leading-relaxed">{error}</p>
      )}
    </div>
  )
}