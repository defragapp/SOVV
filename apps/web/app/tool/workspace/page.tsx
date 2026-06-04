'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function WorkspacePage() {
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
      <header className="mb-8 border-b border-white pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">WORKSPACE</h1>
          {user && <p className="text-gray-400 text-sm mt-1">{user.email}</p>}
        </div>
        <a href="/" className="text-sm border border-white px-4 py-2 hover:bg-white hover:text-black">
          EXIT
        </a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white p-4">
          <h2 className="text-lg font-bold mb-2">NATAL INPUT</h2>
          <p className="text-gray-400 text-sm">Configure your baseline design.</p>
          <a href="/natal" className="mt-4 block w-full text-center border border-white p-2 hover:bg-white hover:text-black">
            EDIT
          </a>
        </div>
        <div className="border border-white p-4">
          <h2 className="text-lg font-bold mb-2">MEMBERS</h2>
          <p className="text-gray-400 text-sm">Manage invites and permissions.</p>
          <button className="mt-4 w-full border border-white p-2 hover:bg-white hover:text-black">
            MANAGE
          </button>
        </div>
        <div className="border border-white p-4">
          <h2 className="text-lg font-bold mb-2">BILLING</h2>
          <p className="text-gray-400 text-sm">Stripe subscription status.</p>
          <a href="/checkout" className="mt-4 block w-full text-center border border-white p-2 hover:bg-white hover:text-black">
            VIEW
          </a>
        </div>
      </div>
    </main>
  )
}
