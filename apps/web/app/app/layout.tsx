import type { Metadata } from "next"
import AuthGuard from "@/components/spaces/AuthGuard"
import { ToastProvider } from "@/components/ui/toast-provider"

export const metadata: Metadata = {
  title: "Sovereign.os — Your Space",
  description: "Your private Sovereign.os space.",
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthGuard>{children}</AuthGuard>
    </ToastProvider>
  )
}
