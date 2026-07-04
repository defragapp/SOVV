'use client'

import { redirect } from 'next/navigation'

// Legacy /tool/workspace route — redirects to Defrag space
// This page was part of the old feat/host-routing branch.
// The canonical authenticated entry is /apps/defrag.
export default function ToolWorkspacePage() {
  redirect('/apps/defrag')
}