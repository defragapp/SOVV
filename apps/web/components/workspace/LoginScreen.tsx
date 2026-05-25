"use client"

import { useState } from "react"

type LoginMode = "login" | "register"

export default function LoginScreen() {
  const [mode, setMode] = useState<LoginMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Authentication failed")
        return
      }

      window.location.href = "/app"
    } catch {
      setError("Connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-[#F6F5F3]">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 flex border-b border-[#F6F5F3]/10">
          <button
            type="button"
            onClick={() => { setMode("login"); setError("") }}
            className={`flex-1 border-b pb-3 font-mono text-xs uppercase tracking-widest ${
              mode === "login"
                ? "border-[#F6F5F3] text-[#F6F5F3]"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError("") }}
            className={`flex-1 border-b pb-3 font-mono text-xs uppercase tracking-widest ${
              mode === "register"
                ? "border-[#F6F5F3] text-[#F6F5F3]"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-white/30">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#F6F5F3]/10 bg-transparent px-3 py-2 text-sm font-light text-[#F6F5F3] focus:outline-none focus:border-[#F6F5F3]/30"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-white/30">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-[#F6F5F3]/10 bg-transparent px-3 py-2 text-sm font-light text-[#F6F5F3] focus:outline-none focus:border-[#F6F5F3]/30"
            />
          </div>

          {error && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-400/70">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-2 border border-[#F6F5F3]/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#F6F5F3] transition-colors hover:bg-[#F6F5F3]/5 disabled:opacity-30"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-white/20">
          {mode === "register"
            ? "Free tier: 5 threads/day, self only"
            : "Pro unlocks people, groups, unlimited threads"}
        </p>
      </div>
    </div>
  )
}
