

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
        className="w-full relative inline-flex items-center justify-center px-6 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#f4efe9', color: '#08070a' }}
      >
        {loading ? "\u00b7\u00b7\u00b7" : "Upgrade to Pro"}
      </button>
      {error && (
        <p className="text-[11px] text-red-400/80 text-center leading-relaxed">{error}</p>
      )}
    </div>
  )
}