import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page not found — Sovereign.os",
  description: "This page doesn't exist. Return to Sovereign.os.",
}
import { SiteShell } from "@/components/marketing/site-shell"

export default function NotFound() {
  return (
    <SiteShell>
      <section className="relative w-full min-h-[70svh] flex flex-col items-center justify-center text-center px-6 pt-[68px] overflow-hidden">
        {/* Ambient */}
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-10" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.06]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(224,116,58,0.04) 0%, transparent 70%)" }}
          aria-hidden
        />
        <p className="relative font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-6">404</p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-[#f4efe9] leading-tight tracking-[-0.02em] mb-5 text-balance">
          <span className="text-glow">This page</span> doesn&apos;t exist.
        </h1>
        <p className="text-[#76716b] text-base leading-relaxed max-w-sm mb-10">
          The moment you were looking for isn&apos;t here. Return to the platform and start from what is actually happening.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/" className="btn-primary">
            Return to Sovereign.os
          </Link>
          <Link href="/apps/defrag" className="btn-secondary">
            Open Defrag
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}