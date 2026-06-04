'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = 'https://api.defrag.app'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Critical: sends/receives cookies
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        setLoading(false)
        return
      }

      // Success — cookie is automatically set by browser
      // Redirect based on host (hub vs tool)
      const host = window.location.host
      if (host.includes('sovereign.defrag.app')) {
        router.push('/dashboard')
      } else {
        router.push('/workspace')
      }
    } catch (err) {
      setError('Network error. Try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md border border-white p-8">
        <h1 className="text-2xl font-bold mb-6 border-b border-white pb-2">
          {mode === 'login' ? 'AUTHENTICATE' : 'INITIATE'}
        </h1>

        {error && (
          <div className="mb-4 border border-white p-2 text-sm bg-white text-black">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">PASSCODE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white p-2"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full border border-white p-2 hover:bg-white hover:text-black disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'ENTER' : 'CREATE'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            {mode === 'login' ? 'Need an account? Initiate' : 'Have an account? Authenticate'}
          </button>
        </div>
      </div>
    </main>
  )
}
