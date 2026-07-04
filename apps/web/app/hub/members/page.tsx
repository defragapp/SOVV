import { redirect } from 'next/navigation'

// Legacy /hub/members route — redirects to hub dashboard
// This page was part of the old feat/host-routing branch hub structure.
export default function HubMembersPage() {
  redirect('/hub/dashboard')
}