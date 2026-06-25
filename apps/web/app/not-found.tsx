import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"

export default function NotFound() {
  return (
    <SiteShell>
      <section className="w-full min-h-[70svh] flex flex-col items-center justify-center text-center px-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-6">404</p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-[#f4efe9] leading-tight tracking-[-0.02em] mb-5 text-balance">
          This page doesn&apos;t exist.
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