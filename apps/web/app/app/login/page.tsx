import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Sign in — Sovereign.os",
  description: "Sign in to your Sovereign.os space.",
}

import LoginScreen from "@/components/spaces/LoginScreen"

export default function LoginPage() {
  return <LoginScreen />
}
