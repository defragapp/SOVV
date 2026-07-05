"use client"

import Link from "next/link"
import Image from "next/image"
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
      if (window.turnstile) renderWidget()
      else existing.addEventListener("load", renderWidget, { once: true })
      return () => {
        if (turnstileWidgetId.current && window.turnstile?.reset)
          window.turnstile.reset(turnstileWidgetId.current)
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
      if (turnstileWidgetId.current && window.turnstile?.reset)
        window.turnstile.reset(turnstileWidgetId.current)
      turnstileWidgetId.current = null
    }
  }, [mode, turnstileSiteKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "register" && turnstileSiteKey !== "" && !turnstileToken) {
        setError("Complete the verification below to continue.")
        return
      }
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const payload = mode === "register"
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
      // Check if user has baseline, redirect to settings if not
      // Preserve return URL from ?return= or ?next= query param
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get("return") || urlParams.get("next") || ""
      const safeReturn = returnUrl.startsWith("/") ? returnUrl : ""

      fetch("/api/baseline", { credentials: "include" })
        .then(r => r.ok ? r.json() : { baseline: null })
        .then((d: any) => {
          if (safeReturn) {
            window.location.href = safeReturn
          } else if (d.baseline?.dob) {
            window.location.href = "/apps/defrag"
          } else {
            // New user — go to settings to set up Baseline Design
            window.location.href = "/settings?onboard=1"
          }
        })
        .catch(() => { window.location.href = safeReturn || "/apps/defrag" })
    } catch {
      setError("Connection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#08070a]">

      {/* Full-screen background */}
      <Image
        src="/hero-light.png"
        alt="Warm light"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-60"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#08070a] via-[#08070a]/80 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-transparent to-[#08070a]/40" />

      {/* Form panel */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-12 safe-bottom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >

          {/* Wordmark */}
          <div className="mb-10 text-center">
            <Link href="/" className="inline-block">
              <span className="font-mono text-xs tracking-[0.28em] text-[#f4efe9] uppercase font-medium">
                SOVEREIGN.OS
              </span>
            </Link>
            <p className="mt-3 text-sm text-[#76716b] leading-relaxed">
              {mode === "login"
                ? "Sign in to your space."
                : "Create your space. Free to start."}
            </p>
          </div>

          {/* Glass panel */}
          <div className="border border-white/[0.08] bg-[#08070a]/80 backdrop-blur-xl p-8" style={{ borderRadius: "var(--radius-container)" }}>

            {/* Mode tabs */}
            <div className="mb-8 flex border-b border-white/[0.08]">
              {(["login", "register"] as LoginMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(""); setTurnstileToken("") }}
                  className={`flex-1 pb-4 text-sm font-medium tracking-[0.14em] transition-colors duration-200 border-b-2 ${
                    mode === m
                      ? "border-[#f4efe9] text-[#f4efe9]"
                      : "border-transparent text-[#76716b] hover:text-[#a8a29a]"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

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
                  style={{ borderRadius: "var(--radius-input)", fontSize: "16px" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#76716b]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07]"
                  style={{ borderRadius: "var(--radius-input)", fontSize: "16px" }}
                />
              </div>

              {/* Turnstile — only on register */}
              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#76716b]">Verification</label>
                  {turnstileSiteKey ? (
                    <div ref={turnstileRef} className="min-h-[65px]" />
                  ) : (
                    <p className="text-sm text-[#4f4b47] leading-relaxed">
                      Bot verification not configured.
                    </p>
                  )}
                </div>
              )}

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
                disabled={loading || !email || !password || (mode === "register" && turnstileSiteKey !== "" && !turnstileToken)}
                className="mt-2 w-full h-12 bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-all duration-200 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {loading ? "···" : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#76716b] leading-relaxed">
              {mode === "register"
                ? "Free tier · 5 sessions per day · Your Baseline Design stays private."
                : "Your Baseline Design and Library are waiting."}
            </p>

            {mode === "login" && (
              <p className="mt-3 text-center text-sm text-[#4f4b47]">
                Forgot your password?{" "}
                <Link
                  href="/app/forgot-password"
                  className="text-[#76716b] hover:text-[#a8a29a] transition-colors"
                >
                  Reset it
                </Link>
              </p>
            )}

          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200">
              ← Back to Sovereign.os
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
