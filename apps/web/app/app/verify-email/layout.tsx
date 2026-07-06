import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Verify Email — Sovereign.os",
  description: "Verify your email address to activate your Sovereign.os space.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
