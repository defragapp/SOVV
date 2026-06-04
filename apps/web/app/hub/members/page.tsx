'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

const API_BASE = 'https://api.defrag.app'

export default function HubMembersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    getSession().then((session) => {
      if (!session?.authenticated) {
        router.push('/auth')
        return
      }
      fetchMembers()
    })
  }, [router])

  async function fetchMembers() {
    try {
      const res = await fetch(`${API_BASE}/api/hub/members`, { credentials: 'include' })
      const data = await res.json()
      setMembers(data.members || [])
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  async function invite() {
    if (!inviteEmail) return
    await fetch(`${API_BASE}/api/hub/members/invite`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    setInviteEmail('')
    fetchMembers()
  }

  if (loading) return <div className="p-8 bg-black text-white min-h-screen font-mono">LOADING...</div>

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header className="mb-8 border-b border-white pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MEMBERS</h1>
        <a href="/dashboard" className="text-sm border border-white px-4 py-2 hover:bg-white hover:text-black">
          BACK
        </a>
      </header>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">INVITE NEW</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="bg-black border border-white p-2 flex-grow outline-none"
            placeholder="email@example.com"
          />
          <button onClick={invite} className="border border-white px-6 py-2 hover:bg-white hover:text-black">
            INVITE
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">EXISTING</h2>
        <div className="border border-white divide-y divide-white">
          {members.map((m) => (
            <div key={m.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{m.email}</div>
                <div className="text-xs text-gray-400">{m.role}</div>
              </div>
              <button className="text-xs border border-white px-2 py-1 hover:bg-white hover:text-black">
                REVOKE
              </button>
            </div>
          ))}
          {members.length === 0 && <div className="p-4 text-gray-400">No members found.</div>}
        </div>
      </div>
    </main>
  )
}
