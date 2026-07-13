"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"
import { FaqAccordion } from "@/components/marketing/faq-accordion"
import { Container } from "@/components/ui/layout-primitives"
import { FREE_FEATURES, LAUNCH_PRICING, PRO_FEATURES } from "./pricing-contract"

const PRICING_FAQ = [
  {
    q: "Is Defrag really free forever?",
    a: `Yes. Defrag is free with no time limit. You get ${LAUNCH_PRICING.freeDailySessions} sessions per day, Baseline Design, pattern recognition, and Best Next Response. No credit card is required.`,
  },
  {
    q: "Why is there no free trial?",
    a: "The free plan is the trial. You can use Defrag every day and upgrade only when you need Covenant, Alignment, unlimited sessions, saved Library depth, Audio Overview, or private invites.",
  },
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Yes. Manage your plan and payment method through billing settings. Stripe handles the subscription securely.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from billing settings at any time. You keep Pro access through the end of the paid billing period.",
  },
  {
    q: "What is Baseline Design?",
    a: "Baseline Design is the personal context layer beneath every session. It helps Sovereign.os interpret your patterns and translate complex symbolic inputs into direct, usable language.",
  },
  {
    q: "What is the difference between Defrag, Covenant, and Alignment?",
    a: "Defrag helps you understand tension and patterns. Covenant helps with meaning, values, faith-context reflection, grief, and larger decisions. Alignment helps turn insight into a clear next move. Covenant and Alignment are included in Pro.",
  },
  {
    q: "Is this a replacement for therapy?",
    a: "No. Sovereign.os is a reflective decision-support platform, not a replacement for licensed mental health care or emergency support.",
  },
]

const COMPARISON = [
  { feature: "Baseline Design", free: true, pro: true },
  { feature: "Defrag", free: true, pro: true },
  { feature: `${LAUNCH_PRICING.freeDailySessions} sessions / day`, free: true, pro: false },
  { feature: "Unlimited sessions", free: false, pro: true },
  { feature: "Covenant", free: false, pro: true },
  { feature: "Alignment", free: false, pro: true },
  { feature: "Library", free: false, pro: true },
  { feature: "Audio Overview", free: false, pro: true },
  { feature: "Private invites", free: false, pro: true },
] as const

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29a]">{children}</span>
    </div>
  )
}

function Check({ active }: { active: boolean }) {
  return <span className={active ? "text-[#e0743a]" : "text-[#4f4b47]"}>{active ? "✓" : "—"}</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)
  const annualMonthly = useMemo(() => Math.round(LAUNCH_PRICING.annualPriceUsd / 12), [])
  const savings = useMemo(
    () => Math.round(100 - (LAUNCH_PRICING.annualPriceUsd / (LAUNCH_PRICING.monthlyPriceUsd * 12)) * 100),
    [],
  )
  const plan = annual ? LAUNCH_PRICING.annualPlan : LAUNCH_PRICING.monthlyPlan

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[#08070a] pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <MetaLabel>Pricing</MetaLabel>
          <AnimatedHeading className="max-w-3xl text-balance text-4xl leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Start free. Upgrade when you need continuity.
          </AnimatedHeading>
          <TextReveal delay={180}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#a8a29a]">
              Use Defrag every day for free. Pro adds unlimited sessions, Covenant, Alignment, Library, Audio Overview, and private invites.
            </p>
          </TextReveal>

          <div className="mt-10 inline-flex items-center rounded-full border border-white/10 bg-[#0c0a0d] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition ${!annual ? "bg-white/10 text-[#f4efe9]" : "text-[#76716b]"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition ${annual ? "bg-[#e0743a]/15 text-[#f4efe9]" : "text-[#76716b]"}`}
            >
              Annual · Save {savings}%
            </button>
          </div>
        </Container>
      </section>

      <section className="bg-[#08070a] py-16 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <article className="flex flex-col rounded-3xl border border-white/[0.08] bg-[#0c0a0d] p-8">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">Free</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl text-[#f4efe9]">$0</span>
                <span className="text-sm text-[#76716b]">forever</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#a8a29a]">A real daily product, not a demo.</p>
              <div className="my-8 flex flex-1 flex-col gap-3">
                {FREE_FEATURES.map((feature) => (
                  <div key={feature} className="flex gap-3 text-sm text-[#a8a29a]">
                    <span className="text-[#e0743a]">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/app/login" className="btn-secondary w-full text-center">Start Free</Link>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-3xl border border-[#e0743a]/35 bg-[#0c0a0d] p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(224,116,58,0.08),transparent_70%)]" />
              <div className="relative flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">Pro</p>
                <span className="rounded-full border border-[#e0743a]/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#e0743a]">
                  {annual ? `Save ${savings}%` : "Monthly"}
                </span>
              </div>
              <div className="relative mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl text-[#f4efe9]">${annual ? annualMonthly : LAUNCH_PRICING.monthlyPriceUsd}</span>
                <span className="text-sm text-[#76716b]">/ month</span>
              </div>
              {annual && <p className="relative mt-1 text-xs text-[#76716b]">Billed ${LAUNCH_PRICING.annualPriceUsd} annually</p>}
              <p className="relative mt-3 text-sm leading-relaxed text-[#a8a29a]">The complete Sovereign.os experience.</p>
              <div className="relative my-8 flex flex-1 flex-col gap-3">
                {PRO_FEATURES.map((feature) => (
                  <div key={feature} className="flex gap-3 text-sm text-[#a8a29a]">
                    <span className="text-[#e0743a]">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href={`/app/login?checkout=1&plan=${plan}`} className="btn-primary relative w-full text-center">Upgrade to Pro</Link>
              <p className="relative mt-3 text-center text-[11px] text-[#76716b]">Cancel anytime · Secure checkout by Stripe</p>
            </article>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 bg-[#0c0a0d] py-16 md:py-20">
        <Container className="max-w-4xl">
          <MetaLabel>What’s included</MetaLabel>
          <AnimatedHeading className="mb-10 text-3xl tracking-[-0.02em] md:text-4xl">One clear free plan. One complete Pro plan.</AnimatedHeading>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="grid grid-cols-3 bg-white/[0.02] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#76716b]">
              <span>Feature</span><span className="text-center">Free</span><span className="text-center text-[#e0743a]">Pro</span>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.feature} className="grid grid-cols-3 border-t border-white/[0.05] px-4 py-3.5 text-sm text-[#a8a29a]">
                <span>{row.feature}</span><span className="text-center"><Check active={row.free} /></span><span className="text-center"><Check active={row.pro} /></span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#08070a] py-16 md:py-20">
        <Container className="max-w-3xl">
          <MetaLabel>Questions</MetaLabel>
          <AnimatedHeading className="mb-10 text-3xl tracking-[-0.02em] md:text-4xl">Everything before you upgrade.</AnimatedHeading>
          <FaqAccordion items={PRICING_FAQ} />
        </Container>
      </section>
    </SiteShell>
  )
}
