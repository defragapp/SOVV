'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function HubDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="font-mono">AUTHENTICATING...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header className="mb-8 border-b border-white pb-4">
        <h1 className="text-2xl font-bold">DASHBOARD</h1>
        {user && <p className="text-gray-400 text-sm mt-1">{user.email}</p>}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white p-4">
          <h2 className="text-lg font-bold mb-2">BASELINE DESIGN</h2>
          <p className="text-gray-400 text-sm">Your natal configuration.</p>
          <button className="mt-4 w-full border border-white p-2 hover:bg-white hover:text-black">
            VIEW
          </button>
        </div>
        <div className="border border-white p-4">
          <h2 className="text-lg font-bold mb-2">MEMBERS</h2>
          <p className="text-gray-400 text-sm">Invites and permissions.</p>
          <a href="/members" className="mt-4 block w-full text-center border border-white p-2 hover:bg-white hover:text-black">
            MANAGE
          </a>
        </div>
        <div className="border border-white p-4">
          <h2 className="text-lg font-bold mb-2">BILLING</h2>
          <p className="text-gray-400 text-sm">Subscription status.</p>
          <a href="/billing" className="mt-4 block w-full text-center border border-white p-2 hover:bg-white hover:text-black">
            VIEW
          </a>
        </div>
      </div>
    </main>
  )
}
