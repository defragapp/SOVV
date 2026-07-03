import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Alignment — Sovereign.os",
  description: "Separate what belongs to you from what does not. Alignment finds the clearest way through.",
  robots: { index: false, follow: false },
}

export default function AlignmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
