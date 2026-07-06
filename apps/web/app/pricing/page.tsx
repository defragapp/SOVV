"use client"

import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { useState } from "react"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"
import { FaqAccordion } from "@/components/marketing/faq-accordion"

const PRICING_FAQ = [
  {
    q: "Is Defrag really free forever?",
    a: "Yes. Defrag — the core pattern recognition space — is free with no time limit. You get 5 sessions per day, full Baseline Design integration, and Best Next Response. No credit card required.",
  },
  {
    q: "What happens after the 7-day free trial?",
    a: "If you don't cancel before the trial ends, you'll be charged for your chosen plan (monthly or annual). You can cancel anytime from your account settings — no hoops, no retention flows.",
  },
  {
    q: "Can I switch between monthly and annual?",
    a: "Yes. You can switch plans at any time from your billing settings. If you switch to annual mid-cycle, we'll prorate the difference.",
  },
  {
    q: "What is Baseline Design and why does it matter?",
    a: "Baseline Design is your private pattern map — built from your birth data (date, time, place) and a short calibration conversation. It stays active beneath every session, so Sovereign.os reads your moment through your actual patterns, not a generic lens.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your Baseline Design, sessions, and Library are private to you. We do not sell data, train on your inputs, or expose your content to other users. Sessions are encrypted in transit and at rest.",
  },
  {
    q: "What's the difference between Defrag, Covenant, and Alignment?",
    a: "Defrag separates the moment from the pattern — for arguments, messages, family roles, grief, and boundaries. Covenant connects reflection to faith and values — for users who want that layer. Alignment turns recognition into practice — the space between insight and next move. Covenant and Alignment require Pro.",
  },
  {
    q: "Is this a replacement for therapy?",
    a: "No. Sovereign.os is the space between sessions — not a replacement for professional support. If you're in crisis or need clinical care, please reach out to a licensed therapist or crisis line.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time. You'll retain Pro access until the end of your current billing period.",
  },
]

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
  "Audio Overview",
  "Invite Privately",
  "Full Library depth",
]

const COMPARISON = [
  { feature: "Baseline Design", free: true, pro: true },
  { feature: "Defrag space", free: true, pro: true },
  { feature: "Pattern recognition", free: true, pro: true },
  { feature: "Best Next Response", free: true, pro: true },
  { feature: "5 sessions / day", free: true, pro: false },
  { feature: "Unlimited sessions", free: false, pro: true },
  { feature: "Covenant space", free: false, pro: true },
  { feature: "Alignment space", free: false, pro: true },
  { feature: "Library — save results", free: false, pro: true },
  { feature: "Audio Overview", free: false, pro: true },
  { feature: "Invite Privately", free: false, pro: true },
]

function CheckIcon({ active }: { active: boolean }) {
  if (!active) return <span className="text-[#4f4b47] text-sm">—</span>
  return <span className="text-[#e0743a]/70 text-sm">✓</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  const monthlyPrice = 20
  const annualPrice = 99
  const annualMonthly = Math.round(annualPrice / 12)
  const savings = Math.round(100 - (annualPrice / (monthlyPrice * 12)) * 100)

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

          {/* Billing toggle */}
          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={() => setAnnual(false)}
              className={`font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${!annual ? "text-[#f4efe9]" : "text-[#76716b]"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(v => !v)}
              className="relative w-10 h-5 rounded-full border border-white/10 bg-[#131015] flex items-center px-0.5 transition-colors"
              aria-label="Toggle annual billing"
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#e0743a] transition-transform duration-200 ${annual ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${annual ? "text-[#f4efe9]" : "text-[#76716b]"}`}
            >
              Annual
            </button>
            {annual && (
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/80 border border-[#e0743a]/30 px-2 py-0.5" style={{ borderRadius: "var(--radius-minimal)" }}>
                Save {savings}%
              </span>
            )}
          </div>
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
                    {annual ? `Save ${savings}%` : "Recommended"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-serif text-4xl text-[#f4efe9]">
                    ${annual ? annualMonthly : monthlyPrice}
                  </span>
                  <span className="text-sm text-[#76716b]">/ month</span>
                </div>
                {annual && (
                  <p className="text-xs text-[#76716b] mb-2">Billed ${annualPrice}/year</p>
                )}
                <p className="text-sm text-[#a8a29a] leading-relaxed">Defrag + Covenant + Alignment + Library.</p>
              </div>

              <div className="relative flex flex-col gap-3 flex-1 mb-8">
                {PRO_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-[#e0743a]/60 text-sm shrink-0 mt-0.5">✓</span>
                    <span className="text-sm text-[#a8a29a]">{f}</span>
                  </div>
                ))}
              </div>

              <div className="relative flex flex-col gap-3">
                <Link
                  href={`/app/login?checkout=1&plan=${annual ? "annual" : "monthly"}`}
                  className="btn-primary w-full text-center"
                >
                  Upgrade to Pro
                </Link>
                <p className="text-center text-[11px] text-[#76716b]">
                  7-day free trial · Cancel anytime
                </p>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="w-full py-16 md:py-20 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What's included</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-4xl tracking-[-0.02em] leading-tight mb-12">
            What each plan includes.
          </AnimatedHeading>

          {/* Header */}
          <div className="grid grid-cols-3 gap-4 mb-4 px-4">
            <span className="text-xs text-[#76716b] font-mono uppercase tracking-[0.15em]">Feature</span>
            <span className="text-xs text-[#76716b] font-mono uppercase tracking-[0.15em] text-center">Free</span>
            <span className="text-xs text-[#e0743a]/70 font-mono uppercase tracking-[0.15em] text-center">Pro</span>
          </div>

          <div className="flex flex-col gap-0 border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 gap-4 items-center px-4 py-3.5 ${i < COMPARISON.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                <span className="text-sm text-[#a8a29a]">{row.feature}</span>
                <span className="text-center"><CheckIcon active={row.free} /></span>
                <span className="text-center"><CheckIcon active={row.pro} /></span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="w-full py-20 bg-[#08070a] border-t border-white/5">
        <Container className="flex flex-col items-center text-center max-w-xl">
          <MetaLabel>Get started</MetaLabel>
          <h2 className="text-3xl md:text-4xl font-serif tracking-[-0.02em] text-[#f4efe9] mb-4">
            Try Pro free for 7 days.
          </h2>
          <p className="text-[#a8a29a] text-base leading-relaxed mb-8">
            No commitment. Cancel before the trial ends and you won't be charged.
          </p>
          <Link
            href={`/app/login?checkout=1&plan=${annual ? "annual" : "monthly"}&trial=1`}
            className="btn-primary px-8"
          >
            Start Free Trial
          </Link>
          <p className="mt-4 text-xs text-[#76716b]">Card required to start trial. Cancel anytime.</p>
        </Container>
      </section>

    </SiteShell>
  )
}
