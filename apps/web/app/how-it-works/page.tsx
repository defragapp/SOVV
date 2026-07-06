import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How It Works — Sovereign.os",
  description: "How Sovereign.os works: Baseline Design → pattern recognition → Best Next Response.",
}

const STEPS = [
  {
    num: "01",
    label: "Foundation",
    title: "Set your Baseline Design.",
    body: "Your date, time, and place of birth. Maps how you tend to process, respond, connect, protect, communicate, and return to center. Active beneath every thread. Private — never exposed in outputs.",
    aside: "You don't have to explain who you are every time a moment happens.",
    accent: "rgba(224,116,58,0.12)",
  },
  {
    num: "02",
    label: "Input",
    title: "Bring the moment.",
    body: "Describe the pressure, the message, the dynamic, or the grief. Say it how it actually happened. No framework required. No performance.",
    aside: null,
    accent: "rgba(200,194,188,0.06)",
  },
  {
    num: "03",
    label: "Recognition",
    title: "Receive a structured result.",
    body: "What's active, what may be repeating, and your Best Next Response — grounded in your Baseline Design, not a generic read. Pattern-aware. Specific to you.",
    aside: null,
    accent: "rgba(224,116,58,0.08)",
  },
  {
    num: "04",
    label: "Memory",
    title: "Save to your Library.",
    body: "Save the result before the moment disappears. Your Library holds what helped — searchable, returnable, yours.",
    aside: null,
    accent: "rgba(200,194,188,0.04)",
  },
  {
    num: "05",
    label: "Return",
    title: "Come back before the pattern takes over.",
    body: "When the same moment comes back — and it will — your Library holds what you already worked through. Return before the old response takes over.",
    aside: "This is the whole point.",
    accent: "rgba(224,116,58,0.10)",
  },
]

export default function HowItWorksPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-24 md:pt-48 md:pb-32 bg-[#08070a] overflow-hidden">
        {/* Ambient depth layers */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(224,116,58,0.07) 0%, transparent 65%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(200,194,188,0.03) 0%, transparent 60%)" }}
          aria-hidden
        />

        {/* Decorative orbit rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <div className="alignment-ring orbit-slow" style={{ width: 600, height: 600, marginLeft: -300, marginTop: -300 }} />
          <div className="alignment-ring orbit-reverse" style={{ width: 900, height: 900, marginLeft: -450, marginTop: -450, opacity: 0.4 }} />
        </div>

        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8 fade-in-up fade-in-up-1">
            <span className="h-px w-8 bg-[#e0743a]/50 draw-line" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">The process</span>
          </div>

          <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-8 fade-in-up fade-in-up-2">
            Five steps.<br />
            <span className="text-[#a8a29a]">One thread.</span>
          </h1>

          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed fade-in-up fade-in-up-3">
            Sovereign.os uses your Baseline Design to read what's active, identify what may be repeating, and surface a Best Next Response — before pressure chooses for you.
          </p>
        </Container>
      </section>

      {/* ── STEPS ── */}
      <section className="w-full bg-[#08070a]">
        <Container className="max-w-3xl py-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute left-[19px] top-[72px] w-px"
                  style={{
                    height: "calc(100% - 40px)",
                    background: "linear-gradient(180deg, rgba(224,116,58,0.15) 0%, rgba(255,255,255,0.04) 100%)"
                  }}
                  aria-hidden
                />
              )}

              <div className={`flex gap-8 py-12 ${i < STEPS.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                {/* Step indicator */}
                <div className="shrink-0 flex flex-col items-center pt-1">
                  <div
                    className="w-10 h-10 flex items-center justify-center relative"
                    style={{
                      background: step.accent,
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "var(--radius-button)",
                    }}
                  >
                    <span className="font-mono text-[9px] text-[#76716b] tracking-[0.2em]">{step.num}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">{step.label}</span>
                  </div>
                  <h3 className="font-serif text-[1.4rem] md:text-[1.6rem] text-[#f4efe9] leading-snug tracking-[-0.01em] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[#a8a29a] text-[0.9375rem] leading-relaxed mb-4">
                    {step.body}
                  </p>
                  {step.aside && (
                    <div className="flex items-start gap-3">
                      <div className="w-px h-full min-h-[1.5rem] bg-[#e0743a]/20 shrink-0 mt-1" />
                      <p className="text-[0.875rem] text-[#76716b] leading-relaxed italic">
                        {step.aside}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ── SPACES OVERVIEW ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-10">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">The spaces</span>
          </div>

          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4 text-balance">
            Three spaces. One platform.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-14 max-w-xl">
            Each space is designed for a different kind of moment.
          </p>

          <div className="flex flex-col gap-px border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {[
              {
                name: "Defrag",
                tag: "Free",
                desc: "Pattern recognition for the moments that are hard to read while you're inside them. What's active, what may be repeating, what to do next.",
                available: "All users",
              },
              {
                name: "Covenant",
                tag: "Pro",
                desc: "Faith-context reflection. Translates the moment into repair, discernment, and a grounded next step — without preaching or spiritual shortcuts.",
                available: "Pro",
              },
              {
                name: "Alignment",
                tag: "Pro",
                desc: "Timing and readiness. Reads the current sky against your Baseline Design to surface what's active in the larger cycle.",
                available: "Pro",
              },
            ].map((space, i) => (
              <div
                key={space.name}
                className="flex items-start gap-6 p-6 bg-[#0c0a0d] border-b border-white/[0.04] last:border-0 card-hover"
              >
                <div className="shrink-0 pt-0.5">
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.18em] px-2 py-1 border"
                    style={{
                      borderRadius: "var(--radius-minimal)",
                      borderColor: space.tag === "Free" ? "rgba(255,255,255,0.08)" : "rgba(224,116,58,0.25)",
                      color: space.tag === "Free" ? "#76716b" : "#e0743a",
                      background: space.tag === "Free" ? "transparent" : "rgba(224,116,58,0.06)",
                    }}
                  >
                    {space.tag}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-serif text-[1.1rem] text-[#f4efe9] mb-2">{space.name}</p>
                  <p className="text-sm text-[#76716b] leading-relaxed">{space.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-32 md:py-40 bg-[#08070a] border-t border-white/[0.04] text-center overflow-hidden">
        {/* Concentric rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {[300, 500, 700, 900].map((size, i) => (
            <div
              key={size}
              className="alignment-ring absolute"
              style={{
                width: size,
                height: size,
                left: -size / 2,
                top: -size / 2,
                opacity: 0.06 - i * 0.01,
              }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(224,116,58,0.05) 0%, transparent 70%)" }}
          aria-hidden
        />

        <Container className="relative z-10 max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#76716b] mb-6">Begin</p>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,4rem)] text-[#f4efe9] tracking-[-0.025em] leading-tight mb-6 text-balance">
            Ready to interrupt the loop?
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
