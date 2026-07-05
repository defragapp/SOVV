import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { PricingUpgradeButton } from "@/components/marketing/PricingUpgradeButton"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"

export const metadata: Metadata = {
  title: "Pricing — Sovereign.os",
  description: "Start free. Upgrade when you need continuity.",
}

const APP_URL = "/app/login"

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

const FREE_FEATURES = [
  "Baseline Design",
  "Defrag space — full access",
  "5 sessions per day",
  "Pattern recognition output",
  "Best Next Response",
]

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited sessions",
  "Covenant space",
  "Alignment space",
  "Save results to your Library",
  "Return to your Library",
  "Audio Overview",
  "Invite Privately",
  "Full Library depth",
]

export default function PricingPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-20 bg-[#08070a] overflow-hidden">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <MetaLabel>Pricing</MetaLabel>
          <AnimatedHeading className="text-4xl md:text-6xl tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            Start free. Upgrade when you need continuity.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-5 max-w-md text-base text-[#a8a29a] leading-relaxed">
              Defrag is free. Covenant, Alignment, and your Library require Pro.
            </p>
          </TextReveal>
        </Container>
      </section>

      {/* ── PLANS ── */}
      <section className="w-full py-16 md:py-20 bg-[#08070a]">
        <Container>
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Monthly</span>
            <div className="relative">
              <input type="checkbox" id="billing-toggle" className="sr-only peer" />
              <label
                htmlFor="billing-toggle"
                className="flex w-12 h-6 bg-white/[0.08] border border-white/[0.1] cursor-pointer peer-checked:bg-[#e0743a]/30 peer-checked:border-[#e0743a]/40 transition-all"
                style={{ borderRadius: 12 }}
              >
                <span className="w-4 h-4 m-1 bg-[#76716b] peer-checked:bg-[#e0743a] peer-checked:translate-x-6 transition-all" style={{ borderRadius: "50%" }} />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Annual</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#e0743a]/70 border border-[#e0743a]/30 px-1.5 py-0.5" style={{ borderRadius: 3 }}>Save 31%</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">

            {/* Free */}
            <div className="border border-white/[0.08] bg-[#0c0a0d] p-8 flex flex-col" style={{ borderRadius: "var(--radius-container)" }}>
              <div className="mb-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-3">Free</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-serif text-4xl text-[#f4efe9]">$0</span>
                  <span className="text-sm text-[#76716b]">forever</span>
                </div>
                <p className="text-sm text-[#a8a29a] leading-relaxed">Start with Defrag — free forever.</p>
              </div>

              <div className="flex flex-col gap-3 flex-1 mb-8">
                {FREE_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-[#e0743a]/60 text-sm shrink-0 mt-0.5">✓</span>
                    <span className="text-sm text-[#a8a29a]">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={APP_URL} className="btn-secondary w-full text-center">
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-[#e0743a]/30 bg-[#0c0a0d] p-8 flex flex-col relative overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(224,116,58,0.06) 0%, transparent 70%)" }}
                aria-hidden
              />
              <div className="relative mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">Pro</p>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#e0743a]/80 border border-[#e0743a]/30 px-2 py-0.5"
                    style={{ borderRadius: "var(--radius-minimal)" }}
                  >
                    Recommended
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-serif text-4xl text-[#f4efe9]">$12</span>
                  <span className="text-sm text-[#76716b]">/ month</span>
                </div>
                <p className="text-[11px] text-[#4f4b47] mb-3">or $99/year (save $45)</p>
                <p className="text-sm text-[#a8a29a] leading-relaxed">Defrag + Covenant + Alignment + Library.</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/60 mt-2">7-day free trial included</p>
              </div>

              <div className="relative flex flex-col gap-3 flex-1 mb-8">
                {PRO_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-[#e0743a]/60 text-sm shrink-0 mt-0.5">✓</span>
                    <span className="text-sm text-[#a8a29a]">{f}</span>
                  </div>
                ))}
              </div>

              <PricingUpgradeButton />
            </div>

          </div>
        </Container>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="w-full py-16 md:py-20 bg-[#08070a] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">What people say</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "I used it before a hard conversation with my dad. It named the loop I'd been in for years. I didn't say everything I planned to — but what I said landed.",
                name: "Early user",
                context: "Defrag",
              },
              {
                quote: "The Baseline Design is the part that surprised me. It's not a personality test. It's more like — it knows how I move before I explain it.",
                name: "Pro subscriber",
                context: "Baseline Design",
              },
              {
                quote: "I've tried journaling, therapy, and a lot of apps. This is the first thing that gives me a specific next move instead of just reflecting back what I said.",
                name: "Pro subscriber",
                context: "Alignment",
              },
            ].map((t, i) => (
              <div key={i} className="border border-white/[0.06] bg-[#0c0a0d] p-6 flex flex-col gap-4" style={{ borderRadius: "var(--radius-container)" }}>
                <p className="text-[13px] text-[#a8a29a] leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] border border-white/[0.07] px-2 py-0.5" style={{ borderRadius: 3 }}>{t.context}</span>
                  <span className="text-[11px] text-[#4f4b47]">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── COMPARISON ── */}
      <section className="w-full py-16 md:py-20 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What's included</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-4xl tracking-[-0.02em] leading-tight mb-12">
            What each plan includes.
          </AnimatedHeading>

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-0 mb-2">
            <div className="col-span-1" />
            <div className="text-center">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">Free</span>
            </div>
            <div className="text-center">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70">Pro</span>
            </div>
          </div>

          <div className="flex flex-col gap-0 border border-white/[0.05] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {[
              { label: "Baseline Design", free: true, pro: true },
              { label: "Defrag space — full access", free: true, pro: true },
              { label: "5 sessions per day", free: true, pro: false },
              { label: "Pattern recognition output", free: true, pro: true },
              { label: "Best Next Response", free: true, pro: true },
              { label: "Unlimited sessions", free: false, pro: true },
              { label: "Covenant space", free: false, pro: true },
              { label: "Alignment space", free: false, pro: true },
              { label: "Save results to Library", free: false, pro: true },
              { label: "Return to your Library", free: false, pro: true },
              { label: "Audio Overview", free: false, pro: true },
              { label: "Invite Privately", free: false, pro: true },
              { label: "Full Library depth", free: false, pro: true },
            ].map((row, i) => (
              <div key={row.label} className="grid grid-cols-3 gap-0 py-3.5 px-5 border-b border-white/[0.04] last:border-0 bg-[#0c0a0d] hover:bg-white/[0.01] transition-colors">
                <span className="text-[13px] text-[#a8a29a] col-span-1">{row.label}</span>
                <div className="flex items-center justify-center">
                  {row.free
                    ? <span className="text-[#76716b] text-sm">✓</span>
                    : <span className="text-[#2a2828] text-sm">—</span>
                  }
                </div>
                <div className="flex items-center justify-center">
                  {row.pro
                    ? <span className="text-[#e0743a]/70 text-sm">✓</span>
                    : <span className="text-[#2a2828] text-sm">—</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
