import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"

export const metadata: Metadata = {
  title: "Defrag — Sovereign.os",
  description: "Defrag helps you understand what is active in the moment. See the pattern beneath the argument, the silence, the message, or the grief.",
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

export default function DefragProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <MetaLabel>Defrag</MetaLabel>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            Separate the moment from the pattern.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            Something happened. You don't know if you overreacted, if they crossed a line, or if this is the same thing that always happens. Defrag shows you what is actually active — beneath the argument, the silence, the message, or the grief.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Defrag</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

      {/* ── WHAT IT SURFACES ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <MetaLabel>What Defrag surfaces</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            Seven structured outputs. One clear thread.
          </AnimatedHeading>

          <div className="max-w-3xl flex flex-col gap-0">
            {[
              { label: "Active pattern", body: "What is currently active beneath the surface of the moment — the pattern firing, not the symptom." },
              { label: "What keeps happening", body: "The recurring loop that shows up across different situations, relationships, and roles." },
              { label: "Default mode", body: "The pattern you learned to carry under pressure. The role you default into before you realize it." },
              { label: "What shaped this", body: "Where the pattern came from. Not as an excuse — as context for why it keeps showing up." },
              { label: "Under pressure", body: "How the pattern behaves when the stakes are high. What it costs you when it fires." },
              { label: "What's working", body: "The gift underneath the strain. What the pattern is actually trying to protect." },
              { label: "Suggested response", body: "The clearest next response — grounded in your Baseline Design, not in the heat of the moment." },
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

      {/* ── USE CASES ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <MetaLabel>Where it helps</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            The situations Defrag is built for.
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl">
            {[
              "Relational dynamics — what is actually happening between you",
              "Family roles — the patterns that activate when you go home",
              "Boundaries — what you are actually protecting and why",
              "Messages — the text you don't know how to respond to",
              "Grief — what the loss is asking of you",
              "Team pressure — the dynamic that keeps slowing things down",
              "Parenting — the moment you don't want to repeat",
              "The conversation you keep rehearsing but never have",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-5 border-b border-white/[0.06]">
                <span className="w-1 h-1 rounded-full bg-[#e0743a]/60 shrink-0 mt-2.5" />
                <p className="text-sm md:text-[15px] text-[#a8a29a] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-2xl">
          <MetaLabel>How it works</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight mb-14">
            Say it how it actually happened.
          </AnimatedHeading>

          <div className="flex flex-col gap-0">
            {[
              { num: "01", title: "Describe the situation", copy: "The argument, the silence, the message, the grief. No framework required. Say it plainly." },
              { num: "02", title: "Defrag reads your Baseline Design", copy: "Your birth data maps how you tend to process pressure, conflict, connection, and repair. It is active beneath every result." },
              { num: "03", title: "Receive a structured result", copy: "Seven outputs. The active pattern, the repeat, the default mode, what shaped it, how it behaves under pressure, what is working, and the clearest next response." },
              { num: "04", title: "Save to your Library", copy: "Save the result before the moment disappears. Return to it before the old pattern takes over again." },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-start gap-8 py-8 border-b border-white/[0.06] last:border-0">
                <span className="font-serif text-3xl text-[#e0743a]/50 shrink-0 w-10">{step.num}</span>
                <div>
                  <h3 className="text-[#f4efe9] font-medium text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-[#a8a29a] leading-relaxed">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-32 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <AnimatedHeading className="text-4xl md:text-6xl tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            See what is actually active.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
              Open Defrag and describe the moment. Your Baseline Design is already waiting.
            </p>
          </TextReveal>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Defrag</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
