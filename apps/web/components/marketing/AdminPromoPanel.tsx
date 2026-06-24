"use client"

import { useState } from "react"

export default function AdminPromoPanel() {
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setCode(null)

    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json() as { code?: string; error?: string }

      if (!res.ok || !data.code) {
        setError(data.error || "Unable to generate promo code")
        return
      }

      setCode(data.code)
    } catch {
      setError("Unable to generate promo code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center justify-center bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.2em] text-black transition hover:opacity-90 disabled:opacity-50"
        style={{ borderRadius: "var(--radius-button)" }}
      >
        {loading ? "Generating…" : "Generate promo code"}
      </button>

      {code ? (
        <div className="rounded-[14px] bg-slate-950/60 p-4 text-sm text-white">
          <p className="font-mono text-xs uppercase text-white/50">Promo code</p>
          <p className="mt-2 font-mono text-[14px] tracking-[0.14em]">{code}</p>
          <p className="mt-2 text-xs text-white/60">
            Share this code with an ambassador. It can be redeemed once.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm font-mono uppercase tracking-[0.14em] text-rose-300">{error}</p>
      ) : null}
    </div>
  )
}
