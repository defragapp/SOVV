'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSession().then((session) => {
      if (!session?.authenticated) {
        router.push('/login')
      }
    })
  }, [router])

  async function startCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch("/api/billing/checkout", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_1' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Checkout failed')
        setLoading(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('No checkout URL returned')
        setLoading(false)
      }
    } catch (err) {
      setError('Network error')
      setLoading(false)
    }
  }

  async function openPortal() {
    setPortalLoading(true)
    setError('')
    try {
      const res = await fetch("/api/billing/portal", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('No portal URL returned')
        setPortalLoading(false)
      }
    } catch (err) {
      setError('Network error')
      setPortalLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface text-[#f4efe9] flex items-center justify-center p-6">
      <div className="w-full max-w-sm border border-border bg-surface p-8 flex flex-col gap-8">
        <div className="text-center">
          <p className="text-[10px] font-sans font-medium text-[#4f4b47] tracking-[0.3em] uppercase mb-4">Sovereign.os</p>
          <div className="h-px w-full bg-white/[0.06] mb-6" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#f4efe9]">Subscribe</h1>
        </div>

        {error && (
          <div className="border border-red-500/20 bg-red-500/5 p-3 text-center">
            <p className="text-[10px] font-sans font-medium tracking-wide text-red-400/80">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={startCheckout}
            disabled={loading}
            className="w-full border border-border bg-white text-black p-4 transition-colors hover:bg-white/90 disabled:opacity-20 text-left flex flex-col gap-1"
          >
            <div className="text-xs font-sans font-medium uppercase tracking-[0.1em] font-semibold">Sovereign.os Pro</div>
            <div className="text-[10px] font-sans font-medium text-[#52525B]">Full space access</div>
          </button>

          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="w-full border border-border bg-transparent text-[#76716b] p-3 transition-colors hover:text-white hover:border-border disabled:opacity-20 text-[10px] font-sans font-medium uppercase tracking-widest text-center"
          >
            {portalLoading ? '...' : 'Manage existing subscription'}
          </button>
        </div>
      </div>
    </main>
  )
}
