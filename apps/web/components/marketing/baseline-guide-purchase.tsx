"use client"

import { useEffect, useState } from "react"

export function BaselineGuidePurchase({
  purchase,
  sessionId,
}: {
  purchase?: string
  sessionId?: string
}) {
  const [state, setState] = useState<"idle" | "loading" | "verified" | "error">(
    purchase === "success" ? "loading" : "idle",
  )
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (purchase !== "success" || !sessionId) return

    fetch(`/api/commerce/baseline-guide/verify?session_id=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("We could not verify this purchase yet.")
        setState("verified")
        setMessage("Purchase verified. Your branded Baseline Guide is ready to download.")
      })
      .catch((error: Error) => {
        setState("error")
        setMessage(error.message)
      })
  }, [purchase, sessionId])

  async function beginCheckout() {
    setState("loading")
    setMessage("")

    const res = await fetch("/api/commerce/baseline-guide/checkout", { method: "POST" })
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; message?: string }

    if (res.status === 401) {
      window.location.href = "/app/login?returnTo=/baseline-guide"
      return
    }

    if (!res.ok || !data.url) {
      setState("error")
      setMessage(data.message ?? "Checkout is temporarily unavailable.")
      return
    }

    window.location.href = data.url
  }

  return (
    <div className="rounded-3xl border border-[#e0743a]/30 bg-[#0c0a0d] p-7 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]">One-time purchase</p>
          <p className="mt-2 font-serif text-4xl text-[#f4efe9]">$10</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b]">
          No subscription required
        </span>
      </div>

      {state === "verified" ? (
        <a
          href="/api/commerce/baseline-guide/download"
          className="btn-primary mt-7 block w-full text-center"
        >
          Download my Baseline Guide
        </a>
      ) : (
        <button
          type="button"
          onClick={beginCheckout}
          disabled={state === "loading"}
          className="btn-primary mt-7 w-full disabled:cursor-wait disabled:opacity-60"
        >
          {state === "loading" ? "Preparing secure checkout…" : "Create my Baseline Guide"}
        </button>
      )}

      {message ? (
        <p className={`mt-4 text-sm leading-relaxed ${state === "verified" ? "text-[#d7c2b4]" : "text-[#d48b73]"}`}>
          {message}
        </p>
      ) : null}

      <p className="mt-4 text-center text-[11px] text-[#76716b]">
        Secure checkout by Stripe · Downloadable branded report
      </p>
    </div>
  )
}
