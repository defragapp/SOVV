"use client"

import { useState } from "react"

const PRESETS = [5, 10, 25, 50]

export function SupportCheckout({ status }: { status?: string }) {
  const [amount, setAmount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function checkout() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/commerce/support/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount }),
    })
    const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string }

    if (!res.ok || !data.url) {
      setLoading(false)
      setError(data.message ?? "Secure checkout is temporarily unavailable.")
      return
    }

    window.location.href = data.url
  }

  return (
    <div className="rounded-3xl border border-[#e0743a]/30 bg-[#0c0a0d] p-7">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]">Support the work</p>
      <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#f4efe9]">Help Sovereign.os keep developing.</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#a8a29a]">
        Make a one-time contribution at any amount from $5 to $500. This does not create a subscription or change your account plan.
      </p>

      {status === "success" ? (
        <p className="mt-5 rounded-2xl border border-[#e0743a]/25 bg-[#e0743a]/10 p-4 text-sm text-[#f4efe9]">
          Thank you. Your support was received through Stripe.
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-4 gap-2">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${amount === value ? "border-[#e0743a]/50 bg-[#e0743a]/12 text-[#f4efe9]" : "border-white/[0.08] text-[#76716b] hover:text-[#f4efe9]"}`}
          >
            ${value}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#76716b]">Custom amount</span>
        <div className="mt-2 flex items-center rounded-xl border border-white/[0.08] bg-[#08070a] px-4">
          <span className="text-[#76716b]">$</span>
          <input
            type="number"
            min={5}
            max={500}
            step={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full bg-transparent px-2 py-3 text-[#f4efe9] outline-none"
          />
        </div>
      </label>

      <button type="button" onClick={checkout} disabled={loading} className="btn-primary mt-5 w-full disabled:opacity-60">
        {loading ? "Preparing secure checkout…" : `Contribute $${Number.isFinite(amount) ? amount : 0}`}
      </button>

      {error ? <p className="mt-3 text-sm text-[#d48b73]">{error}</p> : null}
      <p className="mt-3 text-center text-[11px] text-[#76716b]">One-time payment · Secure checkout by Stripe</p>
    </div>
  )
}
