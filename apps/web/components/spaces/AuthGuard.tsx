"use client"

import { useEffect, useState } from "react"
import type { Tier } from "./types"
import LoginScreen from "./LoginScreen"
import BaselineEntry from "./BaselineEntry"
import UpgradeBanner from "./UpgradeBanner"

interface AuthState {
  loading: boolean
  authenticated: boolean
  user: { id: string; email: string } | null
  tier: Tier
  hasBaseline: boolean
  // null = not yet checked, true/false = checked
  subscriptionChecked: boolean
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    tier: "free",
    hasBaseline: false,
    subscriptionChecked: false,
  })

  useEffect(() => {
    async function checkSession() {
      try {
        // Step 1: Verify session
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false, subscriptionChecked: false })
          return
        }

        const session = await res.json() as { user?: { id: string; email: string } }

        if (!session.user) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false, subscriptionChecked: false })
          return
        }

        // Step 2: Check tier (parallel with baseline — both are needed)
        const [tierRes, baselineRes] = await Promise.all([
          fetch("/api/auth/tier", { method: "GET", credentials: "include" }),
          // Baseline is now ungated — all authenticated users can fetch it
          fetch("/api/baseline", { method: "GET", credentials: "include" }),
        ])

        const tierData = tierRes.ok ? await tierRes.json() as { tier: Tier } : { tier: "free" as Tier }

        // Baseline returns 200 with { baseline: null } if not set, or 401 if not authed
        // It no longer returns 402 for free users
        let hasBaseline = false
        if (baselineRes.ok) {
          const baselineData = await baselineRes.json() as { baseline?: { dob?: string } | null }
          hasBaseline = Boolean(baselineData?.baseline?.dob)
        }

        setAuth({
          loading: false,
          authenticated: true,
          user: session.user,
          tier: tierData.tier,
          hasBaseline,
          subscriptionChecked: true,
        })
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

  // Not authenticated → show login
  if (!auth.authenticated) {
    return <LoginScreen />
  }

  // Authenticated but no Baseline Design → collect it first
  // This applies to ALL users (free and pro) — Baseline Design is required before workspace
  if (!auth.hasBaseline) {
    return (
      <BaselineEntry
        onComplete={() =>
          setAuth((prev) => ({ ...prev, hasBaseline: true }))
        }
      />
    )
  }

  // Has Baseline Design but no active subscription → show upgrade
  // Only gate workspace routes, not the baseline entry itself
  if (auth.tier !== "pro" && auth.subscriptionChecked) {
    return <UpgradeBanner />
  }

  // Authenticated + has Baseline Design + active subscription → enter workspace
  return <>{children}</>
}