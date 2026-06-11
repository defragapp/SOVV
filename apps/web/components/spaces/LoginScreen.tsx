"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset?: (widgetId: string) => void
    }
  }
}

type LoginMode = "login" | "register"

export default function LoginScreen() {
  const [mode, setMode] = useState<LoginMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
  const turnstileRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetId = useRef<string | null>(null)

  useEffect(() => {
    setTurnstileToken("")
    setError("")

    if (mode !== "register" || !turnstileSiteKey) return
    const scriptId = "cf-turnstile-script"

    const renderWidget = () => {
      if (!turnstileRef.current || !window.turnstile || turnstileWidgetId.current) return
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      })
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null
    if (existing) {
      if (window.turnstile) {
        renderWidget()
      } else {
        existing.addEventListener("load", renderWidget, { once: true })
      }
      return () => {
        if (turnstileWidgetId.current && window.turnstile?.reset) {
          window.turnstile.reset(turnstileWidgetId.current)
        }
        turnstileWidgetId.current = null
      }
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = renderWidget
    document.head.appendChild(script)

    return () => {
      if (turnstileWidgetId.current && window.turnstile?.reset) {
        window.turnstile.reset(turnstileWidgetId.current)
      }
      turnstileWidgetId.current = null
    }
  }, [mode, turnstileSiteKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "register" && turnstileSiteKey !== "" && !turnstileToken) {
        setError("Complete bot verification to continue")
        return
      }

      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const payload =
        mode === "register"
          ? { email, password, turnstileToken }
          : { email, password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Authentication failed")
        return
      }

      window.location.href = "/apps/defrag"
    } catch {
      setError("Connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#050505] text-[#FAFAFA] safe-bottom">

      {/* Subtle center glow — no bright gradients */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(255,255,255,0.025) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.0, 0.0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#3F3F46] uppercase mb-4">
            Sovereign.os
          </p>
          <div className="h-px w-full bg-white/[0.06]" />
        </motion.div>

        {/* Mode tabs */}
        <div className="mb-8 flex border-b border-white/[0.08]">
          {(["login", "register"] as LoginMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); setTurnstileToken("") }}
              className={`flex-1 pb-3 text-[10px] font-mono tracking-[0.15em] uppercase transition-colors duration-200 border-b ${
                mode === m
                  ? "border-[#FAFAFA] text-[#FAFAFA]"
                  : "border-transparent text-[#3F3F46] hover:text-[#71717A]"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#3F3F46]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="sovv-input w-full bg-[#080808] border border-white/[0.08] text-[#FAFAFA] placeholder:text-[#3F3F46] text-sm font-mono px-4 py-3 outline-none focus:border-white/20 transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#3F3F46]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              className="sovv-input w-full bg-[#080808] border border-white/[0.08] text-[#FAFAFA] placeholder:text-[#3F3F46] text-sm font-mono px-4 py-3 outline-none focus:border-white/20 transition-colors duration-200"
            />
          </div>

          {/* Turnstile */}
          {mode === "register" && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#3F3F46]">
                Bot verification
              </label>
              {turnstileSiteKey ? (
                <div ref={turnstileRef} className="min-h-[65px]" />
              ) : (
                <p className="text-[10px] font-mono text-[#3F3F46] leading-relaxed">
                  Turnstile is not configured yet. Add a public site key before opening registration.
                </p>
              )}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-mono text-red-400/60 tracking-wide"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={
              loading ||
              !email ||
              !password ||
              (mode === "register" && turnstileSiteKey !== "" && !turnstileToken)
            }
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary mt-3 w-full h-12 border border-white/[0.15] bg-white text-black font-mono text-[10px] tracking-[0.2em] uppercase transition-colors hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="font-mono"
                >
                  ···
                </motion.span>
              </span>
            ) : mode === "login" ? "Sign In" : "Create Account"}
          </motion.button>
        </form>

        {/* Tier note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-10 text-center text-[10px] font-mono text-[#3F3F46] tracking-wide"
        >
          {mode === "register"
            ? "Protects your Baseline Design and Library. Free tier · 5 sessions/day"
            : "Protects your Baseline Design and Library. Pro unlocks continuity and deep context"}
        </motion.p>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-[10px] font-mono text-[#3F3F46] hover:text-[#71717A] tracking-wide transition-colors duration-200"
          >
            ← Back to Sovereign.os
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
