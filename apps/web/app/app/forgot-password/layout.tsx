import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Reset Password — Sovereign.os",
  description: "Reset your Sovereign.os password.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
