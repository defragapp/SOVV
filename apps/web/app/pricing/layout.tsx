import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Pricing — Sovereign.os",
  description: "Start free. Upgrade when you need continuity.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
