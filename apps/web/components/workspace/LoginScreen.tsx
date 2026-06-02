"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Authentication failed")
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
    <div
      className="flex min-h-screen w-full items-center justify-center bg-black text-[#F6F5F3] selection:bg-white/20"
      style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Subtle spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.0, 0.0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12 text-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/20 mb-3">
            Sovereign OS
          </p>
          <div className="h-px w-full bg-[#F6F5F3]/10" />
        </motion.div>

        {/* Mode toggle */}
        <div className="mb-8 flex border-b border-[#F6F5F3]/10">
          {(["login", "register"] as LoginMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError("") }}
              className={`flex-1 border-b pb-3 font-mono text-[10px] uppercase tracking-widest transition-colors duration-200 ${
                mode === m
                  ? "border-[#F6F5F3] text-[#F6F5F3]"
                  : "border-transparent text-white/25 hover:text-white/50"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-[#F6F5F3]/10 bg-transparent px-4 py-3 text-sm font-light text-[#F6F5F3] placeholder-white/15 focus:border-[#F6F5F3]/30 focus:outline-none transition-colors duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full border border-[#F6F5F3]/10 bg-transparent px-4 py-3 text-sm font-light text-[#F6F5F3] placeholder-white/15 focus:border-[#F6F5F3]/30 focus:outline-none transition-colors duration-200"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[9px] uppercase tracking-widest text-red-400/70"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !email || !password}
            whileHover={{ backgroundColor: "rgba(246,245,243,0.08)" }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 border border-[#F6F5F3]/20 px-4 py-3.5 font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3] transition-colors duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  ···
                </motion.span>
              </span>
            ) : mode === "login" ? "Sign In" : "Create Account"}
          </motion.button>
        </form>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 text-center font-mono text-[9px] uppercase tracking-widest text-white/15"
        >
          {mode === "register"
            ? "Free tier · 5 sessions/day · self only"
            : "Pro unlocks people, groups, unlimited sessions"}
        </motion.p>

        {/* Back to landing */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="font-mono text-[9px] uppercase tracking-widest text-white/15 hover:text-white/35 transition-colors duration-200"
          >
            ← Back to defrag.app
          </a>
        </div>
      </motion.div>
    </div>
  )
}