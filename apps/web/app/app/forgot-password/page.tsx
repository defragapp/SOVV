"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok && !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setSent(true)
    } catch {
      setError("Connection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#08070a] px-6 py-12">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.06) 0%, transparent 65%)" }} aria-hidden />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 30% at 50% 100%, rgba(200,194,188,0.03) 0%, transparent 70%)" }} aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span className="font-mono text-xs tracking-[0.28em] text-[#f4efe9] uppercase font-medium">
              SOVEREIGN.OS
            </span>
          </Link>
          <p className="mt-3 text-sm text-[#76716b] leading-relaxed">
            {sent ? "Check your inbox." : "Reset your password."}
          </p>
        </div>

        <div className="border border-white/[0.08] bg-[#08070a]/80 backdrop-blur-xl p-8" style={{ borderRadius: "var(--radius-container)" }}>
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-[#f4efe9] leading-relaxed mb-2">
                If that email exists, a reset link has been sent.
              </p>
              <p className="text-sm text-[#76716b] leading-relaxed mb-6">
                Check your inbox and spam folder. The link expires in 1 hour.
              </p>
              <Link
                href="/app/login"
                className="inline-block border border-white/[0.15] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#f4efe9] hover:bg-white/[0.04] transition-colors"
                style={{ borderRadius: 10 }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#76716b]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07]"
                  style={{ borderRadius: 12, fontSize: "16px" }}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-400/80 leading-relaxed"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !email}
                className="mt-2 w-full h-12 bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-all duration-200 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {loading ? "···" : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link href="/app/login" className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200">
            ← Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}