import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

export const metadata: Metadata = {
  title: "Contact — Sovereign.os",
  description: "Reach the Sovereign.os team. We respond to every message.",
}

function Arrow() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-[#4f4b47] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#e0743a]/60">
      <path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="relative w-full overflow-hidden bg-[#08070a] pb-20 pt-36 md:pb-24 md:pt-48">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.05) 0%, transparent 60%)" }}
          aria-hidden
        />
        <Container className="relative z-10 max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#76716b]">Contact</span>
          </div>
          <h1 className="mb-6 text-balance font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.97] tracking-[-0.03em] text-[#f4efe9]">
            We respond to<br />every message.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-[#76716b]">
            Questions, feedback, or something that didn&apos;t work the way you expected — reach us directly.
          </p>
        </Container>
      </section>

      <section className="w-full bg-[#08070a] py-16 md:py-20">
        <Container className="max-w-2xl">
          <div className="flex flex-col gap-px overflow-hidden border border-white/[0.06]" style={{ borderRadius: "var(--radius-container)" }}>
            <a href="mailto:info@defrag.app" className="group flex items-center justify-between border-b border-white/[0.04] bg-[#08070a] p-7 card-hover">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">General</p>
                <p className="text-base text-[#f4efe9]">info@defrag.app</p>
                <p className="mt-1 text-sm text-[#76716b]">Questions, feedback, anything</p>
              </div>
              <Arrow />
            </a>

            <a href="mailto:support@defrag.app" className="group flex items-center justify-between border-b border-white/[0.04] bg-[#08070a] p-7 card-hover">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Support</p>
                <p className="text-base text-[#f4efe9]">support@defrag.app</p>
                <p className="mt-1 text-sm text-[#76716b]">Account, billing, technical issues</p>
              </div>
              <Arrow />
            </a>

            <Link href="/baseline-guide" className="group flex items-center justify-between border-b border-white/[0.04] bg-[#0c0a0d] p-7 card-hover">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]">One-time · $10</p>
                <p className="text-base text-[#f4efe9]">Your Baseline Guide</p>
                <p className="mt-1 text-sm text-[#76716b]">A personal operating guide for you and your people</p>
              </div>
              <Arrow />
            </Link>

            <div className="flex items-center gap-4 bg-[#0c0a0d] p-7">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e0743a]/60 breathe" />
              <p className="text-sm leading-relaxed text-[#76716b]">
                We typically respond within 24 hours. For urgent issues, include &quot;urgent&quot; in your subject line.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
