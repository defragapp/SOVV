import AuthGuard from "@/components/spaces/AuthGuard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
