import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Find the story in Scripture that fits your moment. Covenant holds what matters without forcing an answer.",
  robots: { index: false, follow: false },
}

export default function CovenantLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
