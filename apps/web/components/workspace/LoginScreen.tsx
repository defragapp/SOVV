"use client"

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
      if (mode === "register" && (!turnstileSiteKey || !turnstileToken)) {
        setError(turnstileSiteKey ? "Complete bot verification to continue" : "Turnstile is not configured yet")
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
    <div
      className="flex min-h-[100dvh] w-full items-center justify-center bg-background text-foreground safe-bottom"
    >
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12 text-center"
        >
          <p className="text-label tracking-widest text-foreground-disabled mb-3">
            Sovereign.os
          </p>
          <div className="h-px w-full bg-border" />
        </motion.div>

        <div className="mb-8 flex border-b border-border">
          {(["login", "register"] as LoginMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); setTurnstileToken("") }}
              className={`flex-1 border-b pb-3 text-micro transition-colors duration-200 ${
                mode === m
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground-disabled hover:text-white"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-micro text-foreground-disabled">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="sovv-input w-full"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-micro text-foreground-disabled">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="sovv-input w-full"
              placeholder="••••••••"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <label className="block text-micro text-foreground-disabled">
                Bot verification
              </label>
              {turnstileSiteKey ? (
                <div ref={turnstileRef} className="min-h-[65px]" />
              ) : (
                <p className="text-caption text-foreground-disabled">
                  Turnstile is not configured yet. Add a public site key before opening registration.
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
                className="text-micro text-red-400/70 mt-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || !email || !password || (mode === "register" && (!turnstileSiteKey || !turnstileToken))}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 btn-primary w-full py-3.5 tracking-widest disabled:opacity-25 disabled:cursor-not-allowed"
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 text-center text-micro text-foreground-disabled opacity-40"
        >
          {mode === "register"
            ? "Free tier · 5 sessions/day · self only"
            : "Pro unlocks people, groups, unlimited sessions"}
        </motion.p>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-micro text-foreground-disabled hover:text-white transition-colors duration-200"
          >
            ← Back to Sovereign.os
          </a>
        </div>
      </motion.div>
    </div>
  )
}
