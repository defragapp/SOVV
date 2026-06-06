'use client'

import { redirect } from 'next/navigation'

// Legacy /tool/natal route — redirects to Baseline Design settings
// This page was part of the old feat/host-routing branch natal input flow.
// The canonical Baseline Design entry is /settings.
export default function NatalInputPage() {
  redirect('/settings')
}