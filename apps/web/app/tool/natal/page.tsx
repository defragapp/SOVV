'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = 'https://api.defrag.app'

export default function NatalInputPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/natal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Sends __sov_session cookie
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired. Please authenticate.')
          setTimeout(() => router.push('/auth'), 1500)
        } else {
          setError(data.error || 'Failed to save')
        }
        setLoading(false)
        return
      }

      // Success — redirect to workspace
      router.push('/workspace')
    } catch (err) {
      setError('Network error. Try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6 border-b border-white pb-2">NATAL INPUT</h1>
      
      {error && (
        <div className="mb-4 border border-white p-2 text-sm bg-white text-black max-w-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm mb-1">NAME</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-black border border-white p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">BIRTH DATE</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className="w-full bg-black border border-white p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">BIRTH TIME</label>
          <input
            type="time"
            value={form.birthTime}
            onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
            className="w-full bg-black border border-white p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">BIRTH LOCATION</label>
          <input
            type="text"
            value={form.birthLocation}
            onChange={(e) => setForm({ ...form, birthLocation: e.target.value })}
            className="w-full bg-black border border-white p-2"
            placeholder="City, Country"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full border border-white p-2 hover:bg-white hover:text-black disabled:opacity-50"
        >
          {loading ? '...' : 'CALCULATE'}
        </button>
      </form>
    </main>
  )
}
