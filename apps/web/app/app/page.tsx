import { redirect } from "next/navigation"

// Legacy /app route — redirects to canonical Defrag space
// Middleware on app.defrag.app already rewrites / → /apps/defrag,
// but direct /app path requests are handled here.
export default function AppPage() {
  redirect("/apps/defrag")
}