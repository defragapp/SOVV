import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Covenant holds the faith-context layer — the commitments, values, and relational agreements that shape how you move through the world.",
}

const APP_URL = "https://app.defrag.app/app/login"

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

export default function CovenantProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <MetaLabel>Covenant</MetaLabel>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            Faith connected to repair.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            Not as certainty. Not as performance. Not as a shortcut around responsibility. Covenant holds the faith-context layer — the commitments, values, and relational agreements that shape how you move through the world — and connects them to the next honest step.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Covenant</Link>
            <Link href="/pricing" className="btn-secondary">Pro required</Link>
          </div>
        </Container>
      </section>

      {/* ── WHAT IT HOLDS ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <MetaLabel>What Covenant holds</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            The layer beneath the pattern.
          </AnimatedHeading>

          <div className="max-w-3xl flex flex-col gap-0">
            {[
              { label: "The covenant", body: "The commitment, value, or relational agreement you are examining — named plainly, without spiritual performance." },
              { label: "What it protects", body: "What the covenant is actually guarding. The thing underneath the thing you said you believe." },
              { label: "Where it is tested", body: "The specific situations, relationships, or pressures where the covenant is hardest to hold." },
              { label: "The invitation", body: "What the covenant is asking of you right now — not as obligation, but as the next honest step." },
            ].map((item, i) => (
              <TextReveal key={item.label} delay={i * 60}>
                <div className="flex items-start gap-8 py-7 border-b border-white/[0.06] last:border-0">
                  <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.2em] shrink-0 w-6 mt-1">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[#f4efe9] font-medium text-base mb-1">{item.label}</h3>
                    <p className="text-sm text-[#a8a29a] leading-relaxed max-w-lg">{item.body}</p>
                  </div>
                </div>
              </TextReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── WHAT IT IS NOT ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What Covenant is not</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight mb-14">
            Honest about what it does and doesn't do.
          </AnimatedHeading>

          <div className="flex flex-col gap-0">
            {[
              { not: "Not a replacement for spiritual direction", is: "A private space to examine what you actually believe and how it connects to what you are walking through." },
              { not: "Not a shortcut around responsibility", is: "A way to see where faith and accountability meet — and what the next honest step looks like." },
              { not: "Not a judgment on your tradition", is: "Covenant works with your values as you hold them, not as someone else defines them." },
              { not: "Not therapy", is: "Complementary to professional support — a personal space for the work between sessions." },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-7 border-b border-white/[0.06] last:border-0">
                <div className="flex items-start gap-3">
                  <span className="text-[#4f4b47] text-sm shrink-0 mt-0.5">✕</span>
                  <p className="text-sm text-[#76716b] leading-relaxed">{item.not}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#e0743a]/60 text-sm shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-[#a8a29a] leading-relaxed">{item.is}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── PRO NOTE ── */}
      <section className="w-full py-16 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-2xl">
          <div className="border border-white/[0.08] p-8" style={{ borderRadius: 16 }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-4">Pro space</p>
            <h3 className="font-serif text-2xl text-[#f4efe9] mb-3">Covenant requires Pro.</h3>
            <p className="text-sm text-[#a8a29a] leading-relaxed mb-6">
              Covenant is available on the Pro plan alongside Alignment, unlimited sessions, full Library depth, and Audio Overview.
            </p>
            <Link href="/pricing" className="btn-primary inline-flex">See Pro plan</Link>
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-32 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <AnimatedHeading className="text-4xl md:text-6xl tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            The next honest step.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
              Open Covenant and describe the commitment or value you want to examine. Your Baseline Design is already waiting.
            </p>
          </TextReveal>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Covenant</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
