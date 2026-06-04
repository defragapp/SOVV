'use client'

import { useState } from 'react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('https://api.defrag.app/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mode }),
    })
    const data = await res.json()
    console.log(data)
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md border border-white p-8">
        <h1 className="text-2xl font-bold mb-6 border-b border-white pb-2">
          {mode === 'login' ? 'AUTHENTICATE' : 'INITIATE'}
        </h1>

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
          <button type="submit" className="w-full border border-white p-2 hover:bg-white hover:text-black">
            {mode === 'login' ? 'ENTER' : 'CREATE'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            {mode === 'login' ? 'Need an account? Initiate' : 'Have an account? Authenticate'}
          </button>
        </div>
      </div>
    </main>
  )
}
