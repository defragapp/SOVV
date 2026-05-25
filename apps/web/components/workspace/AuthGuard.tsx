"use client"

import { useEffect, useState } from "react"
import type { Tier } from "./types"
import LoginScreen from "./LoginScreen"

interface AuthState {
  loading: boolean
  authenticated: boolean
  user: { id: string; email: string } | null
  tier: Tier
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    tier: "free",
  })

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free" })
          return
        }

        const session = await res.json()

        if (!session.user) {
          setAuth({ loading: false, authenticated: false, user: null, tier: "free" })
          return
        }

        const tierRes = await fetch("/api/auth/tier", {
          method: "GET",
          credentials: "include",
        })

        const tierData = tierRes.ok ? await tierRes.json() : { tier: "free" }

        setAuth({
          loading: false,
          authenticated: true,
          user: session.user,
          tier: tierData.tier,
        })
      } catch {
        setAuth({ loading: false, authenticated: false, user: null, tier: "free" })
      }
    }

    checkSession()
  }, [])

  if (auth.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <span className="font-mono text-xs uppercase tracking-widest text-white/30">
          Verifying
        </span>
      </div>
    )
  }

  if (!auth.authenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}
