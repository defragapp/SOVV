import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About — Sovereign.os",
  description: "Sovereign.os is personal AI with your full context — Baseline Design, live timing, relationship dynamics, and saved history working together.",
}

const PRINCIPLES = [
  {
    num: "01",
    title: "Context over advice.",
    body: "Generic advice is easy to give and hard to use. Sovereign works from your Baseline Design, live timing, and relationship context — so the guidance fits the actual moment, not a version of it.",
  },
  {
    num: "02",
    title: "Private by design.",
    body: "Your Baseline Design is never exposed in outputs. Your sessions are yours. We do not sell data, train on your inputs, or expose your content to other users. Sessions are encrypted in transit and at rest.",
  },
  {
    num: "03",
    title: "Useful, not therapeutic.",
    body: "Sovereign.os is the space between sessions — not a replacement for professional support. We are a clarity tool. That distinction matters and we hold it.",
  },
  {
    num: "04",
    title: "No homework required.",
    body: "You do not need to understand astrology, Human Design, Gene Keys, or numerology. Sovereign translates the symbolic complexity into plain language you can use. The system works for you — not the other way around.",
  },
]

const PLATFORM = [
  {
    label: "Baseline Design",
    body: "Your personal context layer — built from birth data and a short calibration. Maps how you tend to process, respond, connect, protect, and return to center. Active beneath every session.",
  },
  {
    label: "Live Timing",
    body: "Current planetary positions read against your Baseline. Surfaces what may be more active, louder, softer, easier, or harder right now — without requiring you to interpret a chart.",
  },
  {
    label: "Relational Overlay",
    body: "The same situation can mean completely different things to different people. Sovereign accounts for both sides — helping explain how the moment may have landed for each person involved.",
  },
  {
    label: "Saved Context",
    body: "Your Library holds what helped — saved Defrags, relationship dynamics, decisions, reflections, and recurring patterns. The next hard moment benefits from what you already worked through.",
  },
]

export default function AboutPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-24 md:pt-48 md:pb-32 bg-[#08070a] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(224,116,58,0.07) 0%, transparent 65%)" }}
          aria-hidden
        />

        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">About</span>
          </div>

          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.0] tracking-[-0.03em] text-balance mb-8">
            Personal AI<br />
            <span className="text-[#a8a29a]">with your full context.</span>
          </h1>

          <p className="text-[#a8a29a] text-lg max-w-xl leading-relaxed">
            Sovereign.os combines your Baseline Design, live timing, relationship dynamics, and saved context to help you understand yourself, the people around you, and the next move that actually fits.
          </p>
        </Container>
      </section>

      {/* ── WHAT MAKES IT DIFFERENT ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-10">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">The platform</span>
          </div>

          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4 text-balance">
            Most AI only knows what you type.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-14 max-w-xl">
            Sovereign works from a deeper foundation. Four layers of context — active together, translated into plain language, so you can ask real human questions and get guidance that actually fits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM.map((item) => (
              <div
                key={item.label}
                className="border border-white/[0.07] bg-[#08070a] p-7 flex flex-col gap-3"
                style={{ borderRadius: "var(--radius-container)" }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">{item.label}</p>
                <p className="text-[14px] text-[#a8a29a] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className="w-full py-24 md:py-32 bg-[#08070a] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-10">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">What we believe</span>
          </div>

          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] leading-tight mb-14 text-balance">
            How we build.
          </h2>

          <div className="flex flex-col gap-0 border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.num}
                className={`flex gap-8 p-8 bg-[#0c0a0d] ${i < PRINCIPLES.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em] shrink-0 pt-1">{p.num}</span>
                <div>
                  <h3 className="font-serif text-[1.1rem] text-[#f4efe9] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#76716b] leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── WHAT IT IS NOT ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-10">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Clarity on scope</span>
          </div>

          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] leading-tight mb-6 text-balance">
            Not generic advice.<br />
            <span className="text-[#a8a29a]">Not a personality quiz.<br />Not a prediction engine.</span>
          </h2>

          <p className="text-[#76716b] text-base leading-relaxed max-w-xl mb-8">
            Sovereign.os is not a replacement for therapy, clinical care, or professional support. If you are in crisis or need clinical help, please reach out to a licensed therapist or crisis line.
          </p>
          <p className="text-[#76716b] text-base leading-relaxed max-w-xl">
            What Sovereign is: a clarity tool for the space between sessions. For the moments that are hard to read while you&rsquo;re inside them. For the next move that keeps you clear.
          </p>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-32 md:py-40 bg-[#08070a] border-t border-white/[0.04] text-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(224,116,58,0.05) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container className="relative z-10 max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#76716b] mb-6">Start here</p>
          <h2 className="font-serif text-[clamp(2rem,5vw,3.8rem)] text-[#f4efe9] tracking-[-0.025em] leading-tight mb-6 text-balance">
            Your Baseline is the starting point.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-10">
            Free to start. Private by design. No credit card required.
          </p>
          <Link href="/app/login" className="btn-primary">
            Build Your Baseline
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}