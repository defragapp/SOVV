"use client"

import { useEffect, useState } from "react"
import type { Tier } from "./types"
import LoginScreen from "./LoginScreen"
import BaselineEntry from "./BaselineEntry"

interface AuthState {
  loading: boolean
  authenticated: boolean
  user: { id: string; email: string } | null
  tier: Tier
  hasBaseline: boolean
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    tier: "free",
    hasBaseline: false,
  })

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false })
          return
        }

        const session = await res.json()

        if (!session.user) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false })
          return
        }

        const tierRes = await fetch("/api/auth/tier", {
          method: "GET",
          credentials: "include",
        })
        const tierData = tierRes.ok ? await tierRes.json() : { tier: "free" }

        const baselineRes = await fetch("/api/baseline", {
          method: "GET",
          credentials: "include",
        })
        const baselineData = baselineRes.ok ? await baselineRes.json() : { baseline: null }
        const hasBaseline = Boolean(baselineData?.baseline?.dob)

        setAuth({
          loading: false,
          authenticated: true,
          user: session.user,
          tier: tierData.tier,
          hasBaseline,
        })
      } catch {
        setAuth({ loading: false, authenticated: false, user: null, tier: "free", hasBaseline: false })
      }
    }

    checkSession()
  }, [])

  

  if (!auth.authenticated) {
    return <LoginScreen />
  }

  if (!auth.hasBaseline) {
    return (
      <BaselineEntry
        onComplete={() =>
          setAuth((prev) => ({ ...prev, hasBaseline: true }))
        }
      />
    )
  }

  return <>{children}</>
}