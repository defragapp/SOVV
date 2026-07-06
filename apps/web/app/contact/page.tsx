import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

export const metadata: Metadata = {
  title: "Contact — Sovereign.os",
  description: "Reach the Sovereign.os team. We respond to every message.",
}

export default function ContactPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-20 md:pt-48 md:pb-24 bg-[#08070a] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.05) 0%, transparent 60%)" }}
          aria-hidden
        />
        <Container className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Contact</span>
          </div>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-6">
            We respond to<br />every message.
          </h1>
          <p className="text-[#76716b] text-base leading-relaxed max-w-md">
            Questions, feedback, or something that didn't work the way you expected — reach us directly.
          </p>
        </Container>
      </section>

      {/* ── CONTACT OPTIONS ── */}
      <section className="w-full py-16 md:py-20 bg-[#08070a]">
        <Container className="max-w-2xl">
          <div className="flex flex-col gap-px border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>

            {/* Email */}
            <a
              href="mailto:info@defrag.app"
              className="group flex items-center justify-between p-7 bg-[#08070a] border-b border-white/[0.04] card-hover"
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">General</p>
                <p className="text-[#f4efe9] text-base">info@defrag.app</p>
                <p className="text-[#76716b] text-sm mt-1">Questions, feedback, anything</p>
              </div>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-[#4f4b47] group-hover:text-[#e0743a]/60 transition-colors translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                <path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            {/* Support */}
            <a
              href="mailto:support@defrag.app"
              className="group flex items-center justify-between p-7 bg-[#08070a] border-b border-white/[0.04] card-hover"
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Support</p>
                <p className="text-[#f4efe9] text-base">support@defrag.app</p>
                <p className="text-[#76716b] text-sm mt-1">Account, billing, technical issues</p>
              </div>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-[#4f4b47] group-hover:text-[#e0743a]/60 transition-colors translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                <path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            {/* Response time */}
            <div className="flex items-center gap-4 p-7 bg-[#0c0a0d]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/60 breathe shrink-0" />
              <p className="text-[#76716b] text-sm leading-relaxed">
                We typically respond within 24 hours. For urgent issues, include "urgent" in your subject line.
              </p>
            </div>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
