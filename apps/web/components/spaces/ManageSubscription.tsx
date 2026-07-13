"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type SubscriptionState = {
  tier?: "free" | "pro"
  subscription_status?: string
  has_active_subscription?: boolean
  is_in_grace_period?: boolean
  deny_reason?: string | null
}

function statusLabel(subscription: SubscriptionState | null): string {
  if (!subscription) return "Loading billing status"
  if (subscription.is_in_grace_period) return "Payment needs attention"
  if (subscription.subscription_status === "trialing") return "Pro trial"
  if (subscription.has_active_subscription || subscription.tier === "pro") return "Pro active"
  if (subscription.subscription_status === "canceled") return "Pro canceled"
  return "Free"
}

export default function ManageSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/auth/subscription", { credentials: "include", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => setSubscription(data))
      .catch(() => setSubscription({ tier: "free", subscription_status: "free" }))
  }, [])

  const handleOpen = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json() as { url?: string; error?: string }

      if (response.status === 404 && data.error === "no_billing_account") {
        setError("No Stripe billing account exists yet. Upgrade to Pro first.")
        return
      }
      if (!response.ok || !data.url) {
        setError("Billing management is temporarily unavailable.")
        return
      }
      window.location.assign(data.url)
    } catch {
      setError("Billing management is temporarily unavailable.")
    } finally {
      setLoading(false)
    }
  }

  const isPro = subscription?.tier === "pro" || subscription?.has_active_subscription

  return (
    <section className="rounded-[14px] border border-white/[0.08] bg-white/[0.02] p-6 md:p-8" aria-labelledby="billing-heading">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#76716b]">Billing</p>
          <h2 id="billing-heading" className="mt-2 font-serif text-2xl text-[#f4efe9]">{statusLabel(subscription)}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#76716b]">
            {isPro
              ? "Manage your payment method, billing interval, invoices, or cancellation through Stripe. Canceling keeps Pro active through the paid period."
              : "Defrag remains free. Upgrade when you need unlimited sessions, Covenant, Alignment, Library, Audio Overview, and private invites."}
          </p>
          {subscription?.subscription_status && (
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
              Stripe status · {subscription.subscription_status.replaceAll("_", " ")}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {isPro ? (
            <button
              type="button"
              onClick={handleOpen}
              disabled={loading}
              className="btn-secondary min-w-44 text-center disabled:opacity-40"
            >
              {loading ? "Opening Stripe…" : "Manage billing"}
            </button>
          ) : (
            <Link href="/pricing" className="btn-primary min-w-44 text-center">View Pro plans</Link>
          )}
          <span className="text-[11px] text-[#4f4b47]">Secure billing by Stripe</span>
        </div>
      </div>

      {subscription?.is_in_grace_period && (
        <div className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-sm text-amber-200/70">
          Your payment is overdue, but Pro access remains available during the 72-hour recovery period. Update your payment method in Stripe.
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400/70" role="alert">{error}</p>}
    </section>
  )
}
