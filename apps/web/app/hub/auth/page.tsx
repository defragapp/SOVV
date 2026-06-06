import { redirect } from 'next/navigation'

// Legacy /hub/auth route — redirects to canonical login
// This page was part of the old feat/host-routing branch hub structure.
export default function HubAuthPage() {
  redirect('/app/login')
}