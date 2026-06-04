'use client'

import { useState } from 'react'

export default function NatalInputPage() {
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('https://api.defrag.app/natal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    console.log(data)
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6 border-b border-white pb-2">NATAL INPUT</h1>
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
            required
          />
        </div>
        <button type="submit" className="w-full border border-white p-2 hover:bg-white hover:text-black">
          CALCULATE
        </button>
      </form>
    </main>
  )
}
