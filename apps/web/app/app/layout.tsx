import AuthGuard from "@/components/workspace/AuthGuard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
