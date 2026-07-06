import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Studio — Sovereign.os",
  description: "Sovereign.os Studio — pattern-aware AI for the moments that matter.",
}

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#08070a] text-[#f4efe9] flex items-center justify-center px-6 text-center">
      <section className="max-w-2xl">
        <p className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/30 mb-6 text-[0.65rem]">
          Sovereign.os
        </p>
        <h1 className="font-serif text-balance leading-[1.02] tracking-[-0.035em] text-[clamp(2.5rem,6vw,5rem)]">
          Pattern-aware AI for the moments that matter.
        </h1>
        <p className="mt-7 max-w-xl mx-auto text-[#a8a29a] leading-relaxed text-base">
          Understand what's active, what may be repeating, and what next move gives the situation a better chance.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/app/login" className="btn-primary px-8">
            Enter your space
          </Link>
          <Link href="/pricing" className="btn-secondary px-8">
            See pricing
          </Link>
        </div>
      </section>
    </main>
  )
}
