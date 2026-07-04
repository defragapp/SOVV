import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Defrag — Sovereign.os",
  description: "See the pattern beneath the moment. Defrag shows what is actually active in your relationships, family, and decisions.",
  robots: { index: false, follow: false },
}

export default function DefragLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
