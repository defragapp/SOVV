'use client'

import Link from "next/link"
import Image from "next/image"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container, Section } from "@/components/ui/layout-primitives"
import { ScanLine, HeartHandshake, Compass, MessageSquareText, ShieldCheck, Sparkles, ArrowRight } from "lucide-react"
import { AnimatedCounter, AnimatedHeading, StickyScrollSection, TextReveal } from "@/components/marketing/animated-elements"

const APP_URL = "https://app.defrag.app/app/login"

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  )
}

export default function Home() {
  return (
    <SiteShell>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative -mt-16 min-h-[100svh] w-full flex items-end justify-center overflow-hidden bg-[#08070a]">
        <Image
          src="/hero-hand.png"
          alt="An open hand with palm facing upward into a beam of warm light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#08070a]/60 via-transparent to-[#08070a]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-[#08070a]/20 to-transparent" />

        <Container className="relative z-10 flex flex-col items-center text-center pb-16 md:pb-24">
          <h1 className="font-serif text-[#f4efe9] text-balance text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.25rem] tracking-[-0.02em] max-w-4xl animate-fade-up">
            The moment that won&apos;t leave you alone
            <br />
            deserves more than a reaction.
          </h1>

          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed text-balance animate-fade-up delay-100">
            Sovereign.os helps you understand what is active in the moment —
            the pattern, the loop, the response that gives it a better chance.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 animate-fade-up delay-200">
            <Link
              href={APP_URL}
              className="inline-flex items-center justify-center rounded-full bg-[#f4efe9] text-[#08070a] h-12 px-8 text-sm font-medium tracking-tight transition-transform hover:scale-[1.03]"
            >
              Enter Sovereign.os
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/10 text-[#a8a29a] h-12 px-8 text-sm font-medium tracking-tight transition-all hover:border-white/20 hover:text-[#f4efe9]"
            >
              See how it works
            </Link>
          </div>
        </Container>
      </section>

      {/* ── TAGLINE + STATS ──────────────────────────────────────────── */}
      <Section className="w-full py-20 md:py-28 bg-[#08070a]">
        <Container className="flex flex-col items-center text-center">
          <p className="font-serif text-2xl md:text-3xl text-[#f4efe9] leading-snug max-w-lg text-balance">
            Step into the work.
            <br />
            <span className="text-[#a8a29a]">The way through is already here.</span>
          </p>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 w-full max-w-4xl">
            <AnimatedCounter value="3" label="Spaces inside the platform" delay={100} />
            <AnimatedCounter value="100%" label="Private by design" delay={200} />
            <AnimatedCounter value="24/7" label="There when it lands" delay={300} />
            <AnimatedCounter value="1" label="Baseline Design, all yours" delay={400} />
          </div>
        </Container>
      </Section>

      {/* ── THREE SPACES ─────────────────────────────────────────────── */}
      <section className="relative w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5 overflow-hidden">
        <div className="light-beam opacity-70" aria-hidden />
        <Container className="relative z-10">
          <MetaLabel>What Sovereign.os does</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight">
            One platform. Three spaces.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-4 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
              Defrag, Covenant, and Alignment share your Baseline Design and Library.
              Each space is built for a different kind of work.
            </p>
          </TextReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                icon: ScanLine,
                name: "Defrag",
                copy: "Separate the moment from the pattern. See what is active beneath the argument, the silence, the message, or the grief.",
                href: "/product/defrag",
                delay: 0,
              },
              {
                icon: HeartHandshake,
                name: "Covenant",
                copy: "Faith-context reflection anchored in responsibility — plain-language repair and grounded discernment for what you are walking through.",
                href: "/product/covenant",
                delay: 100,
              },
              {
                icon: Compass,
                name: "Alignment",
                copy: "Turn insight into a usable response. See what is yours to carry and what belongs to the other side.",
                href: "/product",
                delay: 200,
              },
            ].map((c, idx) => (
              <Link
                key={c.name}
                href={c.href}
                className="group relative flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-8 transition-all duration-500 hover:border-[#e0743a]/30 hover:bg-white/[0.04] hover:shadow-lg hover:-translate-y-1"
                style={{ animation: `slideUp 0.6s ease-out ${idx * 0.15}s both` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#e0743a]/10 text-[#f0a06a] group-hover:scale-110 transition-transform duration-300">
                  <c.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-[#f4efe9] group-hover:text-[#f0a06a] transition-colors duration-300">
                  {c.name}
                </h3>
                <p className="mt-3 text-sm md:text-[15px] text-[#a8a29a] leading-relaxed flex-1">
                  {c.copy}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#76716b] group-hover:text-[#f0a06a] transition-all duration-300">
                  <span>Explore</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── BASELINE DESIGN + INTELLIGENCE ───────────────────────────── */}
      <StickyScrollSection background="bg-[#08070a]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-last lg:order-first">
            <div className="relative aspect-square w-full max-w-md mx-auto rounded-3xl border border-white/[0.08] bg-[#0c0a0d] overflow-hidden flex items-center justify-center transform transition-transform duration-1000 hover:scale-105">
              <div className="warm-glow w-72 h-72 animate-pulse" aria-hidden />
              <div className="relative flex flex-col items-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-[#e0743a]/30 bg-[#e0743a]/10 text-[#f0a06a] animate-spin"
                  style={{ animationDuration: '8s' }}
                >
                  <Sparkles size={28} strokeWidth={1.5} />
                </div>
                <span className="mt-4 font-serif text-xl text-[#f4efe9]">Sovereign.os</span>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">
                  Core Context Engine
                </span>
              </div>
            </div>
          </div>

          <div>
            <MetaLabel>Guided, not judged</MetaLabel>
            <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight max-w-lg">
              The longer you stay, the clearer it gets.
            </AnimatedHeading>

            <div className="mt-10 flex flex-col gap-8 max-w-md">
              {[
                {
                  icon: MessageSquareText,
                  title: "Understands plain language",
                  copy: "Say it how it actually happened. No frameworks to learn, no right way to phrase it.",
                  delay: 200,
                },
                {
                  icon: ShieldCheck,
                  title: "Your Baseline Design stays private",
                  copy: "Your Baseline Design is active beneath every thread — and is never exposed in outputs.",
                  delay: 300,
                },
                {
                  icon: Sparkles,
                  title: "Saves what you learn",
                  copy: "Save to Sovereign before the moment disappears. Your Library holds what helped.",
                  delay: 400,
                },
              ].map((f) => (
                <TextReveal key={f.title} delay={f.delay}>
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/10 text-[#f0a06a]">
                      <f.icon size={17} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[#f4efe9] font-medium text-[15px]">{f.title}</h3>
                      <p className="mt-1 text-sm text-[#a8a29a] leading-relaxed">{f.copy}</p>
                    </div>
                  </div>
                </TextReveal>
              ))}
            </div>
          </div>
        </Container>
      </StickyScrollSection>

      {/* ── GETTING STARTED ──────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-14 md:mb-20">
            <MetaLabel>Getting started</MetaLabel>
            <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight max-w-xl text-balance">
              From stuck to seen. In minutes.
            </AnimatedHeading>
            <TextReveal delay={200}>
              <p className="mt-4 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
                No experience needed. Sovereign.os guides you through every step.
              </p>
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              { num: "01", title: "Create your space", copy: "Verify your email. Takes two minutes.", delay: 0 },
              { num: "02", title: "Set your Baseline Design", copy: "A few questions map how you tend to respond under pressure.", delay: 100 },
              { num: "03", title: "Bring the moment", copy: "The conversation, the silence, the message, the grief.", delay: 200 },
              { num: "04", title: "Find the way through", copy: "See the Active pattern. Find your Best Next Response.", delay: 300 },
            ].map((step, idx) => (
              <div
                key={step.num}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-8 transition-all duration-500 hover:border-[#e0743a]/30 hover:bg-white/[0.04] hover:shadow-lg hover:-translate-y-2"
                style={{ animation: `slideUp 0.6s var(--ease-apple) ${idx * 0.12}s both` }}
              >
                <div className="font-serif text-4xl text-[#e0743a]/70">{step.num}</div>
                <h3 className="mt-5 text-[#f4efe9] font-medium text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-[#a8a29a] leading-relaxed">{step.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── LIBRARY ──────────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="mb-14">
            <MetaLabel>The Library</MetaLabel>
            <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight max-w-xl">
              The private record of what helped.
            </AnimatedHeading>
            <TextReveal delay={150}>
              <p className="mt-4 max-w-md text-base text-[#a8a29a] leading-relaxed">
                Save to Sovereign before the moment disappears. Return before the old pattern takes over again.
              </p>
            </TextReveal>
          </div>

          <div className="w-full max-w-3xl flex flex-col border-t border-white/[0.08]">
            {[
              { space: "Defrag", title: "The boundary conversation" },
              { space: "Alignment", title: "What is mine vs what is theirs" },
              { space: "Covenant", title: "Responsibility in family conflict" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between py-7 border-b border-white/[0.08] group hover:bg-white/[0.02] transition-colors cursor-pointer px-4 -mx-4 rounded-xl"
              >
                <div className="flex items-center gap-10">
                  <span className="text-[11px] text-[#4f4b47] uppercase tracking-[0.2em] font-mono w-24 hidden sm:block">{item.space}</span>
                  <span className="text-lg tracking-tight text-[#f4efe9]/90">{item.title}</span>
                </div>
                <span className="text-sm text-[#4f4b47] group-hover:text-[#f0a06a] transition-colors">→</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <MetaLabel>Questions</MetaLabel>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight">
              Before you begin.
            </h2>
          </div>

          <div className="flex flex-col">
            {[
              {
                q: "Is this a replacement for therapy?",
                a: "No. Sovereign.os is complementary — it gives you a personal way to understand your patterns and respond differently, including between sessions. It does not diagnose, predict, or replace professional judgment.",
              },
              {
                q: "What is the Baseline Design?",
                a: "Your Baseline Design is the starting map. It shows how you tend to process, respond, connect, protect, communicate, and return to center. It is active beneath every thread and never exposed in outputs.",
              },
              {
                q: "Is my data private?",
                a: "Yes. Your Baseline Design and everything you share are held privately, encrypted, and never sold or exposed in outputs. Private by design.",
              },
              {
                q: "What is the Sovereign.os Library?",
                a: "The Library is the private record of what helped. Save a Result to Sovereign before the moment disappears. Return to it before the old pattern takes over again.",
              },
            ].map((item, i) => (
              <details key={i} className="group border-b border-white/[0.08] py-6 cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-[#f4efe9] text-base md:text-lg font-medium list-none">
                  {item.q}
                  <span className="flex-none text-xl text-[#e0743a] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm md:text-base text-[#a8a29a] leading-relaxed max-w-xl">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <AnimatedHeading className="text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl text-balance">
            Return before the pattern takes over.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-6 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
              Enter Sovereign.os and start understanding the patterns beneath the moments that matter most.
            </p>
          </TextReveal>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
            <Link href={APP_URL} className="btn-primary">
              Enter Sovereign.os
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}