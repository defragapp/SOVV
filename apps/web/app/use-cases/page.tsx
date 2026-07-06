import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Use Cases — Sovereign.os",
  description: "When to use Sovereign.os. Pattern recognition for relational dynamics, family roles, boundaries, grief, and high-stakes decisions.",
}

const USE_CASES = [
  {
    num: "01",
    title: "Relational dynamics",
    trigger: "The conversation that keeps looping into the same argument.",
    space: "Defrag",
    outcome: "See the active pattern. Find the response that doesn't feed the same loop.",
  },
  {
    num: "02",
    title: "Family roles",
    trigger: "You're drawn back into a role you learned to carry under pressure.",
    space: "Defrag",
    outcome: "Understand the strain pattern and the gift under strain. Engage without losing yourself.",
  },
  {
    num: "03",
    title: "Boundaries",
    trigger: "You need to know what is yours to carry and what belongs to the other side.",
    space: "Alignment",
    outcome: "Turn the insight into a concrete, actionable response.",
  },
  {
    num: "04",
    title: "High-stakes messages",
    trigger: "A message landed harder than expected. You don't know how to respond.",
    space: "Defrag",
    outcome: "Separate the moment from the pattern. Find your best next response before you reply.",
  },
  {
    num: "05",
    title: "Grief",
    trigger: "Grief has its own loops. You need to map what is active.",
    space: "Defrag + Covenant",
    outcome: "Find grounded reflection. Return to center without trying to fix what cannot be fixed.",
  },
  {
    num: "06",
    title: "Team dynamics",
    trigger: "A professional dynamic keeps slowing things down. Both sides matter.",
    space: "Defrag",
    outcome: "Understand the shared loop without keeping score.",
  },
]

export default function UseCasesPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-20 md:pt-48 md:pb-24 bg-[#08070a] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 50% at 40% 0%, rgba(224,116,58,0.06) 0%, transparent 60%)" }}
          aria-hidden
        />
        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Use cases</span>
          </div>
          <h1 className="font-serif text-[clamp(2.8rem,7vw,5.5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-8">
            When the moment<br />
            <span className="text-[#a8a29a]">is hard to read.</span>
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed">
            Use it when pressure is about to choose for you — and you need to see what's actually active before you respond.
          </p>
        </Container>
      </section>

      {/* ── USE CASES ── */}
      <section className="w-full bg-[#08070a]">
        <Container className="max-w-3xl">
          {USE_CASES.map((uc, i) => (
            <div
              key={uc.num}
              className={`py-10 ${i < USE_CASES.length - 1 ? "border-b border-white/[0.05]" : ""}`}
            >
              <div className="flex items-start gap-6 md:gap-10">
                {/* Number */}
                <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em] shrink-0 pt-1.5">{uc.num}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="font-serif text-[1.2rem] text-[#f4efe9] leading-snug">{uc.title}</h3>
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.16em] px-2 py-1 border"
                      style={{
                        borderRadius: "var(--radius-minimal)",
                        borderColor: uc.space.includes("+") ? "rgba(224,116,58,0.2)" : "rgba(255,255,255,0.06)",
                        color: uc.space.includes("+") ? "rgba(224,116,58,0.7)" : "#4f4b47",
                        background: uc.space.includes("+") ? "rgba(224,116,58,0.04)" : "transparent",
                      }}
                    >
                      {uc.space}
                    </span>
                  </div>

                  <p className="text-[#76716b] text-sm leading-relaxed italic mb-4">
                    "{uc.trigger}"
                  </p>

                  <div className="flex items-start gap-3">
                    <span className="text-[#e0743a]/40 text-sm shrink-0 mt-0.5">→</span>
                    <p className="text-[#a8a29a] text-sm leading-relaxed">{uc.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-32 md:py-40 bg-[#0c0a0d] border-t border-white/[0.04] text-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {[300, 500, 700].map((size) => (
            <div key={size} className="alignment-ring absolute" style={{ width: size, height: size, left: -size/2, top: -size/2, opacity: 0.05 }} />
          ))}
        </div>
        <Container className="relative z-10 max-w-xl">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-[#f4efe9] tracking-[-0.025em] leading-tight mb-6 text-balance">
            Start with your Baseline Design.
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
