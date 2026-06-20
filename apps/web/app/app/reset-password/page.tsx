"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Stage = "form" | "success" | "invalid"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [stage, setStage] = useState<Stage>("form")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token") || ""
    if (!t) setStage("invalid")
    else setToken(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? "Reset failed. The link may have expired.")
        return
      }
      setStage("success")
    } catch {
      setError("Connection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#08070a] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span className="font-mono text-xs tracking-[0.3em] text-[#f4efe9] uppercase font-medium">
              SOVEREIGN.OS
            </span>
          </Link>
        </div>

        <div className="border border-white/[0.08] bg-[#08070a]/80 backdrop-blur-xl p-8" style={{ borderRadius: 20 }}>

          {stage === "invalid" && (
            <div className="text-center">
              <p className="text-sm text-[#76716b] leading-relaxed mb-6">
                This reset link is invalid or has expired.
              </p>
              <Link
                href="/app/login"
                className="text-sm text-[#f4efe9] hover:opacity-70 transition-opacity"
              >
                ← Back to sign in
              </Link>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center">
              <p className="text-sm text-[#f4efe9] leading-relaxed mb-2">
                Password updated.
              </p>
              <p className="text-sm text-[#76716b] leading-relaxed mb-6">
                Your sessions have been cleared. Sign in with your new password.
              </p>
              <Link
                href="/app/login"
                className="inline-block border border-white/[0.15] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#f4efe9] hover:bg-white/[0.04] transition-colors"
                style={{ borderRadius: 10 }}
              >
                Sign In
              </Link>
            </div>
          )}

          {stage === "form" && (
            <>
              <h1 className="text-sm font-medium text-[#f4efe9] mb-1">Reset your password.</h1>
              <p className="text-sm text-[#76716b] leading-relaxed mb-8">
                Choose a new password for your Sovereign.os account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07]"
                    style={{ borderRadius: 12, fontSize: "16px" }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
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
                  disabled={loading || !password || !confirm}
                  className="mt-2 w-full h-12 bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-all duration-200 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderRadius: "var(--radius-button)" }}
                >
                  {loading ? "···" : "Update Password"}
                </button>
              </form>
            </>
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