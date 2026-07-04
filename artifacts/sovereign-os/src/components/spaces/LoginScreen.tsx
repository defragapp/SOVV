import { Link } from "wouter"
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
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ""
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

      // Check for baseline → route accordingly
      fetch("/api/baseline", { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then((d: { defaultRetreat?: string } | null) => {
          if (d?.defaultRetreat) {
            window.location.href = "/apps/defrag"
          } else {
            window.location.href = "/settings?onboard=1"
          }
        })
        .catch(() => { window.location.href = "/apps/defrag" })
    } catch {
      setError("Connection failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#08070a]">

      {/* Cinematic background */}
      <img
        src="/hero-light.png"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 pointer-events-none select-none"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#08070a] via-[#08070a]/85 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-transparent to-[#08070a]/50" />

      {/* Centered form */}
      <div
        className="relative z-10 flex w-full items-center justify-center px-6 py-12"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 48px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >

          {/* Wordmark above card */}
          <div className="mb-8 text-center">
            <Link href="/">
              <span className="font-mono text-[10px] tracking-[0.28em] text-[#f4efe9]/70 uppercase hover:text-[#f4efe9] transition-colors duration-200">
                SOVEREIGN.OS
              </span>
            </Link>
          </div>

          {/* iOS glass card */}
          <div
            className="rounded-3xl ring-1 ring-inset ring-white/[0.05] overflow-hidden select-none"
            style={{ background: '#1C1C1E' }}
          >
            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/[0.05]">
              <h1 className="font-serif text-2xl text-[#f4efe9] tracking-[-0.01em] mb-1">
                {mode === 'login' ? 'Enter your domain.' : 'Claim your space.'}
              </h1>
              <p className="text-[14px] text-[#4f4b47] font-sans">
                {mode === 'login'
                  ? 'Your Baseline Design and Library are waiting.'
                  : 'Free to start · 5 sessions per day.'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex border-b border-white/[0.05]">
              {(['login', 'register'] as LoginMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); setTurnstileToken('') }}
                  className={`flex-1 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-150 ${
                    mode === m
                      ? 'text-[#f4efe9] bg-white/[0.04]'
                      : 'text-[#4f4b47] hover:text-[#76716b]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex flex-col">

              {/* Email field */}
              <div className="border-b border-white/[0.05]">
                <label className="block px-6 pt-4 pb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-6 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none"
                  style={{ fontFamily: 'var(--app-font-sans)' }}
                />
              </div>

              {/* Password field */}
              <div className="border-b border-white/[0.05]">
                <label className="block px-6 pt-4 pb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className="w-full px-6 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none"
                  style={{ fontFamily: 'var(--app-font-sans)' }}
                />
              </div>

              {/* Turnstile — register only */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-white/[0.05] overflow-hidden"
                  >
                    <div className="px-6 py-4">
                      <label className="block mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                        Verification
                      </label>
                      {turnstileSiteKey ? (
                        <div ref={turnstileRef} className="min-h-[65px]" />
                      ) : (
                        <p className="text-[13px] text-[#4f4b47] font-sans">Bot verification not configured.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-b border-white/[0.05]"
                  >
                    <p className="px-6 py-3 font-mono text-[10px] tracking-[0.12em] text-red-400/70">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="p-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || !email || !password || (mode === 'register' && !!turnstileSiteKey && !turnstileToken)}
                  className="w-full py-3.5 rounded-full bg-[#f4efe9] text-[#08070a] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? '···' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {mode === 'login' && (
                  <Link
                    href="/app/forgot-password"
                    className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link href="/" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
              ← Back to Sovereign.os
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
