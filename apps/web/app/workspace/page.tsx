import { redirect } from "next/navigation"

// Legacy /workspace route — redirects to Defrag space
export default function WorkspacePage() {
  redirect("/apps/defrag")
}