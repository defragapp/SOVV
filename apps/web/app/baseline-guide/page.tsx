import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"
import { BaselineGuidePurchase } from "@/components/marketing/baseline-guide-purchase"
import { Container } from "@/components/ui/layout-primitives"

export const metadata: Metadata = {
  title: "Your Baseline Guide — Sovereign.os",
  description: "A clean, branded personal operating guide generated from your Baseline Design.",
}

const INCLUDED = [
  "Your recurring decision patterns in plain language",
  "How you process pressure, conflict, and uncertainty",
  "What helps you return to clarity",
  "A practical guide for the people closest to you",
  "A downloadable, branded personal reference",
]

export default async function BaselineGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string; session_id?: string }>
}) {
  const params = await searchParams

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[#08070a] pb-20 pt-32 md:pb-28 md:pt-44">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <div className="mb-7 inline-flex items-center gap-3">
                <span className="h-px w-8 bg-[#e0743a]/50" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#76716b]">
                  Baseline Design · Personal edition
                </span>
              </div>

              <AnimatedHeading className="max-w-3xl text-balance text-5xl leading-[0.98] tracking-[-0.035em] md:text-7xl">
                The user manual nobody gave you.
              </AnimatedHeading>

              <TextReveal delay={160}>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#a8a29a]">
                  A clear, professional guide to how you make decisions, process pressure, relate to people, and return to yourself—generated from your saved Baseline Design.
                </p>
              </TextReveal>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-relaxed text-[#a8a29a]">
                    <span className="mr-2 text-[#e0743a]">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              <BaselineGuidePurchase purchase={params.purchase} sessionId={params.session_id} />
              <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#76716b]">Built from your data</p>
                <p className="mt-2 text-sm leading-relaxed text-[#a8a29a]">
                  Your birth details and saved Baseline Design shape the report. Nothing generic, no forced subscription, and no public sharing of your personal inputs.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.05] bg-[#0c0a0d] py-20">
        <Container className="max-w-4xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#76716b]">Made to be useful</p>
          <h2 className="mt-5 font-serif text-4xl tracking-[-0.025em] text-[#f4efe9] md:text-5xl">
            Keep it for yourself. Share it with your people.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#a8a29a]">
            Use it as a personal reference, a relationship bridge, an onboarding document for a coach or therapist, or a way to explain your operating style without starting from zero.
          </p>
        </Container>
      </section>
    </SiteShell>
  )
}
