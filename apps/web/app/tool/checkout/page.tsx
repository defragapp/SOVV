'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

const API_BASE = 'https://api.defrag.app'

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSession().then((session) => {
      if (!session?.authenticated) {
        router.push('/auth')
      }
    })
  }, [router])

  async function startCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/billing/checkout`, {
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
      const res = await fetch(`${API_BASE}/api/billing/checkout?portal=true`, {
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
    <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md border border-white p-8">
        <h1 className="text-2xl font-bold mb-6 border-b border-white pb-2">SUBSCRIBE</h1>

        {error && (
          <div className="mb-4 border border-white p-2 text-sm bg-white text-black">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={startCheckout}
            disabled={loading}
            className="w-full border border-white p-4 hover:bg-white hover:text-black disabled:opacity-50 text-left"
          >
            <div className="font-bold">DEFRAG PRO</div>
            <div className="text-sm text-gray-400">Full workspace access</div>
          </button>

          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="w-full border border-white p-2 hover:bg-white hover:text-black disabled:opacity-50 text-sm"
          >
            {portalLoading ? '...' : 'MANAGE EXISTING SUBSCRIPTION'}
          </button>
        </div>
      </div>
    </main>
  )
}
