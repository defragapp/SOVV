import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About — Sovereign.os",
  description: "Sovereign.os is pattern-aware AI for the moments that are hard to read while you're inside them.",
}

const PRINCIPLES = [
  {
    num: "01",
    title: "Pattern over advice.",
    body: "Advice is generic. Pattern recognition is specific. We surface what's driving the moment — not what you should do about it.",
  },
  {
    num: "02",
    title: "Private by design.",
    body: "Your Baseline Design is never exposed in outputs. Your sessions are yours. We don't train on your data.",
  },
  {
    num: "03",
    title: "Honest, not therapeutic.",
    body: "We're not a therapy replacement. We're a clarity tool. The distinction matters — and we hold it.",
  },
  {
    num: "04",
    title: "Useful in the moment.",
    body: "The moments that matter most are the ones you're inside. We're built for those — not for reflection after the fact.",
  },
]

export default function AboutPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-24 md:pt-48 md:pb-32 bg-[#08070a] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 50% at 30% 0%, rgba(224,116,58,0.07) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 40% at 80% 100%, rgba(200,194,188,0.03) 0%, transparent 60%)" }}
          aria-hidden
        />

        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8 fade-in-up fade-in-up-1">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">About</span>
          </div>

          <h1 className="font-serif text-[clamp(2.8rem,7vw,5.5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-10 fade-in-up fade-in-up-2">
            Built for the moments<br />
            <span className="text-[#a8a29a]">that are hard to read.</span>
          </h1>

          <p className="text-[#a8a29a] text-lg max-w-xl leading-relaxed fade-in-up fade-in-up-3">
            Most of us can describe what happened. Fewer of us can see what keeps happening. Sovereign.os is built for that gap.
          </p>
        </Container>
      </section>

      {/* ── MISSION ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-3 mb-8">
                <span className="h-px w-8 bg-[#e0743a]/50" />
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Mission</span>
              </div>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-[#f4efe9] tracking-[-0.02em] leading-tight text-balance">
                Pattern awareness as a daily practice.
              </h2>
            </div>
            <div className="flex flex-col gap-6 pt-2 md:pt-16">
              <p className="text-[#a8a29a] text-base leading-relaxed">
                The moments that shape relationships, decisions, and grief are the ones hardest to see clearly while you're inside them. Pressure narrows perception. Old patterns activate. The response that made sense once keeps happening — even when it no longer serves.
              </p>
              <p className="text-[#76716b] text-base leading-relaxed">
                Sovereign.os is built to interrupt that. Not with advice. With pattern recognition — specific to you, grounded in your Baseline Design, available in the moment it matters.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className="w-full py-24 md:py-32 bg-[#08070a] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-12">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">How we build</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.num}
                className={`p-8 bg-[#08070a] card-hover ${
                  i % 2 === 0 ? "border-r border-white/[0.04]" : ""
                } ${i < 2 ? "border-b border-white/[0.04]" : ""}`}
              >
                <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em] block mb-4">{p.num}</span>
                <h3 className="font-serif text-[1.1rem] text-[#f4efe9] leading-snug mb-3">{p.title}</h3>
                <p className="text-sm text-[#76716b] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FOUNDER NOTE ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-10">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Origin</span>
          </div>

          <blockquote className="border-l border-[#e0743a]/20 pl-8">
            <p className="font-serif text-[1.3rem] md:text-[1.5rem] text-[#f4efe9] leading-relaxed tracking-[-0.01em] mb-6 text-balance">
              "I kept watching people — including myself — make the same moves under pressure. Not because they didn't know better. Because they couldn't see the pattern while they were inside it."
            </p>
            <p className="text-[#a8a29a] text-base leading-relaxed mb-6">
              Sovereign.os started as a personal tool. A way to bring structure to the moments that felt too close to read clearly. The Baseline Design came first — a map of how I tend to operate. Then the pattern recognition. Then the spaces.
            </p>
            <p className="text-[#76716b] text-base leading-relaxed">
              The goal was never to replace reflection or therapy or conversation. It was to make the moment legible — before the old response takes over.
            </p>
          </blockquote>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-32 md:py-40 bg-[#08070a] border-t border-white/[0.04] text-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {[300, 500, 700].map((size) => (
            <div
              key={size}
              className="alignment-ring absolute"
              style={{ width: size, height: size, left: -size / 2, top: -size / 2, opacity: 0.05 }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(224,116,58,0.04) 0%, transparent 70%)" }}
          aria-hidden
        />

        <Container className="relative z-10 max-w-xl">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-[#f4efe9] tracking-[-0.025em] leading-tight mb-6 text-balance">
            The way through is already here.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-10">
            Free to start. No credit card required.
          </p>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
