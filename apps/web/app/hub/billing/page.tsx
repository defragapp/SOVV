'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

const API_BASE = 'https://api.defrag.app'

export default function HubBillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSession().then((session) => {
      if (!session?.authenticated) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      setLoading(false)
    })
  }, [router])

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

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="font-mono">AUTHENTICATING...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header className="mb-8 border-b border-white pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">BILLING</h1>
        <a href="/dashboard" className="text-sm border border-white px-4 py-2 hover:bg-white hover:text-black">
          BACK
        </a>
      </header>

      <div className="max-w-2xl border border-white p-4">
        <div className="mb-4 border-b border-white pb-2">
          <div className="text-sm text-gray-400">ACCOUNT</div>
          <div className="font-bold">{user?.email}</div>
        </div>
        <div className="mb-4 border-b border-white pb-2">
          <div className="text-sm text-gray-400">STATUS</div>
          <div className="font-bold">ACTIVE</div>
        </div>
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="w-full border border-white p-2 hover:bg-white hover:text-black disabled:opacity-50"
        >
          {portalLoading ? '...' : 'MANAGE SUBSCRIPTION'}
        </button>
        {error && <div className="mt-2 text-sm text-gray-400">{error}</div>}
      </div>
    </main>
  )
}
