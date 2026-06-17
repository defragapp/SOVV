import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"

export const metadata: Metadata = {
  title: "Alignment — Sovereign.os",
  description: "Alignment turns insight into a usable response. See what is yours to carry and what belongs to the other side.",
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

export default function AlignmentProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <MetaLabel>Alignment</MetaLabel>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            Turn insight into a usable response.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            You understand what happened. Now you need to know what to do with it. Alignment shows you what is yours to carry, what belongs to the other side, and the clearest next step — grounded in your Baseline Design.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Alignment</Link>
            <Link href="/pricing" className="btn-secondary">Pro required</Link>
          </div>
        </Container>
      </section>

      {/* ── WHAT IT DOES ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <MetaLabel>What Alignment does</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            Response integration. Not just reflection.
          </AnimatedHeading>

          <div className="max-w-3xl flex flex-col gap-0">
            {[
              { label: "What is true", body: "The honest read on the situation — stripped of the story you've been telling yourself about it." },
              { label: "What is needed", body: "What the situation is actually asking of you. Not what you want to give, and not what you're afraid to give." },
              { label: "The shift", body: "The specific change in posture, timing, or language that would move things forward." },
              { label: "Next steps", body: "Concrete, sequenced actions grounded in your Baseline Design and the actual dynamic." },
              { label: "What to avoid", body: "The moves that feel right in the moment but tend to make things worse for someone with your pattern." },
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

      {/* ── WHEN TO USE ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <MetaLabel>When to use Alignment</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            After the insight. Before the next move.
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl">
            {[
              "After a Defrag session — when you know the pattern but not the next step",
              "Before a difficult conversation — when you need to know what is actually yours to say",
              "After a conflict — when you want to respond instead of react",
              "When you're carrying something that might not be yours to carry",
              "When you know what you should do but can't make yourself do it",
              "When the insight is clear but the action isn't",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-5 border-b border-white/[0.06]">
                <span className="w-1 h-1 rounded-full bg-[#e0743a]/60 shrink-0 mt-2.5" />
                <p className="text-sm md:text-[15px] text-[#a8a29a] leading-relaxed">{item}</p>
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
            <h3 className="font-serif text-2xl text-[#f4efe9] mb-3">Alignment requires Pro.</h3>
            <p className="text-sm text-[#a8a29a] leading-relaxed mb-6">
              Alignment is available on the Pro plan alongside Covenant, unlimited sessions, full Library depth, and Audio Overview.
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
            Know what to do next.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
              Open Alignment and describe what you're trying to move through. Your Baseline Design is already waiting.
            </p>
          </TextReveal>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Alignment</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
