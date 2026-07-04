import { redirect } from "next/navigation"

// /hub/dashboard — legacy route from feat/host-routing branch
// Redirects to canonical Defrag space entry.
export default function HubDashboardPage() {
  redirect("/apps/defrag")
}