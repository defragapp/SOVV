"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { Tier } from "./types"
import LoginScreen from "./LoginScreen"
import BaselineEntry from "./BaselineEntry"
import UpgradeBanner from "./UpgradeBanner"
import OnboardingModal from "./OnboardingModal"

interface AuthState {
  loading: boolean
  authenticated: boolean
  user: { id: string; email: string } | null
  tier: Tier
  hasBaseline: boolean
  subscriptionChecked: boolean
}

const PRO_ROUTES = ["/apps/covenant", "/apps/alignment"]
const FIRST_DEFRAG_PATH = "/apps/defrag"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    tier: "free",
    hasBaseline: false,
    subscriptionChecked: false,
  })
  const [justSetBaseline, setJustSetBaseline] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).catch(() => {})

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false, subscriptionChecked: false })
          return
        }

        const session = await res.json() as { user?: { id: string; email: string; tier?: string } }

        if (!session.user) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false, subscriptionChecked: false })
          return
        }

        const tierFromSession = (session.user.tier as Tier) || "free"
        const baselineRes = await fetch("/api/baseline", { method: "GET", credentials: "include" })

        let hasBaseline = false
        if (baselineRes.ok) {
          const baselineData = await baselineRes.json() as { baseline?: { dob?: string } | null }
          hasBaseline = Boolean(baselineData?.baseline?.dob)
        }

        setAuth({
          loading: false,
          authenticated: true,
          user: session.user,
          tier: tierFromSession,
          hasBaseline,
          subscriptionChecked: true,
        })
        if (hasBaseline) setShowOnboarding(true)
      } catch {
        setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false, subscriptionChecked: false })
      }
    }

    checkSession()
  }, [])

  useEffect(() => {
    if (!justSetBaseline) return

    const timer = window.setTimeout(() => setJustSetBaseline(false), 4200)
    return () => window.clearTimeout(timer)
  }, [justSetBaseline])

  function completeBaselineEntry() {
    setAuth((prev) => ({ ...prev, hasBaseline: true }))
    setJustSetBaseline(true)
    setShowOnboarding(true)

    if (!pathname?.startsWith(FIRST_DEFRAG_PATH)) {
      router.replace(`${FIRST_DEFRAG_PATH}?onboarding=baseline-complete`)
    }
  }

  if (auth.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#08070a]">
        <span className="w-5 h-5 border border-white/20 border-t-[#f4efe9]/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (!auth.authenticated) {
    return <LoginScreen />
  }

  if (!auth.hasBaseline) {
    return <BaselineEntry onComplete={completeBaselineEntry} />
  }

  const requiresPro = PRO_ROUTES.some(route => pathname?.startsWith(route))
  if (requiresPro && auth.tier !== "pro" && auth.subscriptionChecked) {
    return <UpgradeBanner />
  }

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingModal
          hasBaseline={auth.hasBaseline}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
      {justSetBaseline && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-white/[0.10] bg-[#0c0a0d]/95 px-5 py-3 shadow-2xl backdrop-blur-md"
          style={{ borderRadius: "var(--radius-container)", maxWidth: 360 }}
        >
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70">
            Baseline Design active
          </p>
          <p className="mb-1 text-[13px] leading-snug text-[#f4efe9]">
            Your first Defrag is ready.
          </p>
          <p className="text-[11px] leading-relaxed text-[#76716b]">
            Describe what is happening. Defrag will show you what is active beneath it.
          </p>
        </div>
      )}
    </>
  )
}
