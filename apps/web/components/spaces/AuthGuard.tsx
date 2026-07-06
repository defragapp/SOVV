"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
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

// Routes that require Pro subscription
const PRO_ROUTES = ["/apps/covenant", "/apps/alignment"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
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
    // Refresh session token on mount (extends session by 7 days)
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

        // Use tier from session (entitlement-resolved) + fetch baseline
        // This eliminates a separate /api/auth/tier call on every page load
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

  // Loading
  if (auth.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#08070a]">
        <span className="w-5 h-5 border border-white/20 border-t-[#f4efe9]/60 rounded-full animate-spin" />
      </div>
    )
  }

  // Not authenticated → login
  if (!auth.authenticated) {
    return <LoginScreen />
  }

  // No Baseline Design → collect it first (all users)
  if (!auth.hasBaseline) {
    return (
      <BaselineEntry
        onComplete={() => setAuth((prev) => ({ ...prev, hasBaseline: true }))}
      />
    )
  }

  // Pro-only routes → show upgrade if free
  const requiresPro = PRO_ROUTES.some(route => pathname?.startsWith(route))
  if (requiresPro && auth.tier !== "pro" && auth.subscriptionChecked) {
    return <UpgradeBanner />
  }

  // Authenticated + Baseline Design set → enter workspace
  return (
    <>
      {children}
      <OnboardingModal hasBaseline={auth.hasBaseline} onDismiss={() => setShowOnboarding(false)} />
      {/* First-session hint — shown briefly after Baseline Design is set */}
      {justSetBaseline && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 border border-white/[0.10] bg-[#0c0a0d]/95 backdrop-blur-md shadow-2xl"
          style={{ borderRadius: "var(--radius-container)", maxWidth: 360 }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70 mb-1">
            Baseline Design active
          </p>
          <p className="text-[13px] text-[#f4efe9] leading-snug mb-1">
            Your space is ready.
          </p>
          <p className="text-[11px] text-[#76716b] leading-relaxed">
            Describe what is happening — Defrag will show you what is active beneath it.
          </p>
        </div>
      )}
    </>
  )
}