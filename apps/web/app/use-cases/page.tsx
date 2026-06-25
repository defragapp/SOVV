import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Use Cases — Sovereign.os",
  description: "When to use Sovereign.os. Defrag supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
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
    trigger: "A message activated your nervous system. You don't know how to respond.",
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

      {/* Hero */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>Use cases</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            When to use Sovereign.os.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed">
            Use it when the moment requires a grounded response instead of a reactive loop.
          </p>
        </Container>
      </section>

      {/* Use cases — trigger → space → outcome */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-0">
            {USE_CASES.map((uc, idx) => (
              <div
                key={uc.num}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 py-10 border-b border-white/[0.06] last:border-0 items-start"
              >
                {/* Left: trigger */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em]">{uc.num}</span>
                    <h3 className="font-serif text-lg text-[#f4efe9]">{uc.title}</h3>
                  </div>
                  <p className="text-sm text-[#76716b] leading-relaxed italic">"{uc.trigger}"</p>
                </div>

                {/* Center: space badge */}
                <div className="flex md:flex-col items-center justify-center gap-2 py-2">
                  <div className="w-px h-full min-h-[20px] bg-white/[0.06] hidden md:block" />
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#e0743a]/70 border border-[#e0743a]/20 px-2 py-1 whitespace-nowrap"
                    style={{ borderRadius: 4 }}
                  >
                    {uc.space}
                  </span>
                  <div className="w-px h-full min-h-[20px] bg-white/[0.06] hidden md:block" />
                </div>

                {/* Right: outcome */}
                <div className="flex items-start gap-3">
                  <span className="text-[#e0743a]/40 text-sm shrink-0 mt-0.5">→</span>
                  <p className="text-sm text-[#a8a29a] leading-relaxed">{uc.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative w-full py-24 bg-[#08070a] border-t border-white/5 text-center overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] mb-8 text-balance max-w-2xl mx-auto">
            Start with your Baseline Design.
          </h2>
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
