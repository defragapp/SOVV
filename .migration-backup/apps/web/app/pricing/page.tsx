import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
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
  "15 sessions per day",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">

            {/* Free */}
            <div className="border border-white/[0.08] bg-[#0c0a0d] p-8 flex flex-col" style={{ borderRadius: "var(--radius-container)" }}>
              <div className="mb-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-3">Free</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-serif text-4xl text-[#f4efe9]">$0</span>
                  <span className="text-sm text-[#76716b]">forever</span>
                </div>
                <p className="text-sm text-[#a8a29a] leading-relaxed">Start understanding the pattern.</p>
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
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#e0743a]/80 border border-[#e0743a]/30 px-2 py-0.5" style={{ borderRadius: 4 }}>
                    Recommended
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-serif text-4xl text-[#f4efe9]">$12</span>
                  <span className="text-sm text-[#76716b]">/ month</span>
                </div>
                <p className="text-sm text-[#a8a29a] leading-relaxed">For patterns that need continuity.</p>
              </div>

              <div className="relative flex flex-col gap-3 flex-1 mb-8">
                {PRO_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-[#e0743a]/60 text-sm shrink-0 mt-0.5">✓</span>
                    <span className="text-sm text-[#a8a29a]">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={APP_URL} className="btn-primary w-full text-center relative">
                Upgrade to Pro
              </Link>
            </div>

          </div>
        </Container>
      </section>

      {/* ── COMPARISON ── */}
      <section className="w-full py-16 md:py-20 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What's included</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-4xl tracking-[-0.02em] leading-tight mb-12">
            Feature by feature.
          </AnimatedHeading>

          <div className="flex flex-col gap-0">
            {/* Header */}
            <div className="grid grid-cols-3 pb-4 border-b border-white/[0.08]">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Feature</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] text-center">Free</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] text-center">Pro</span>
            </div>
            {[
              { feature: "Baseline Design", free: true, pro: true },
              { feature: "Defrag space", free: true, pro: true },
              { feature: "Covenant space", free: false, pro: true },
              { feature: "Alignment space", free: false, pro: true },
              { feature: "Sessions per day", free: "5", pro: "Unlimited" },
              { feature: "Save to Library", free: false, pro: true },
              { feature: "Library history", free: false, pro: true },
              { feature: "Audio Overview", free: false, pro: true },
              { feature: "Invite Privately", free: false, pro: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 py-4 border-b border-white/[0.06] last:border-0 items-center">
                <span className="text-sm text-[#a8a29a]">{row.feature}</span>
                <span className="text-center">
                  {typeof row.free === "boolean"
                    ? row.free
                      ? <span className="text-[#e0743a]/60 text-sm">✓</span>
                      : <span className="text-[#4f4b47] text-sm">—</span>
                    : <span className="text-sm text-[#a8a29a]">{row.free}</span>
                  }
                </span>
                <span className="text-center">
                  {typeof row.pro === "boolean"
                    ? row.pro
                      ? <span className="text-[#e0743a]/60 text-sm">✓</span>
                      : <span className="text-[#4f4b47] text-sm">—</span>
                    : <span className="text-sm text-[#a8a29a]">{row.pro}</span>
                  }
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="w-full py-16 md:py-20 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-2xl">
          <MetaLabel>Questions</MetaLabel>
          <div className="flex flex-col">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings at any time. Your Pro access continues until the end of the billing period." },
              { q: "What happens to my Library if I downgrade?", a: "Your saved results are preserved. You won't be able to add new ones on the free plan, but everything you saved stays in your account." },
              { q: "Is there a free trial for Pro?", a: "Defrag is free with no time limit. If you want to try Covenant or Alignment, upgrade to Pro — you can cancel anytime." },
              { q: "Do you offer promo codes?", a: "Yes. Enter a promo code at checkout. If you have one, it will be applied before your first charge." },
            ].map((item, i) => (
              <details key={i} className="group border-b border-white/[0.08] py-6 cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-[#f4efe9] text-base font-normal list-none">
                  {item.q}
                  <span className="flex-none text-xl text-[#e0743a] transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#a8a29a] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
