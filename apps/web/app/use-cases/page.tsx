import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Use Cases — Sovereign.os",
  description: "Defrag supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics.",
};

const USE_CASES = [
  {
    num: "01",
    title: "Relational Dynamics",
    body: "When a conversation keeps looping into the same argument. Use the Defrag space to see the Active pattern, identify your Old Role, and find the Conversational Steering needed to respond differently.",
  },
  {
    num: "02",
    title: "Family Dynamics",
    body: "When you are drawn back into a role you learned to carry under pressure. Understand the Strain Pattern and the Gift Under Strain, so you can engage without losing yourself.",
  },
  {
    num: "03",
    title: "Boundaries",
    body: "When you need to know what is yours to carry and what belongs to the other side. The Alignment space helps turn this insight into an actionable, concrete response.",
  },
  {
    num: "04",
    title: "High-Stakes Messages",
    body: "When a message activates your nervous system. Do not reply immediately. Use the Defrag space to separate the moment from the pattern, then find your Best Next Response.",
  },
  {
    num: "05",
    title: "Grief",
    body: "Grief has its own loops. Use Sovereign.os to map what is active, find grounded reflection through the Covenant space, and return to center without trying to fix what cannot be fixed.",
  },
  {
    num: "06",
    title: "Team Dynamics",
    body: "Professional spaces are filled with unstated active patterns. When both sides matter, use Invite Privately to understand the shared loop without keeping score.",
  },
];

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  );
}

export default function UseCasesPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[55svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <MetaLabel>Use cases</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            When to use Sovereign.os.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[600px] text-balance leading-relaxed">
            Defrag supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics. Use it when the moment requires a grounded response instead of a reactive loop.
          </p>
        </Container>
      </Section>

      {/* Use cases — structured list, no boxes */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-0">
            {USE_CASES.map((uc, idx) => (
              <div
                key={uc.num}
                className="flex items-start gap-8 py-10 border-b border-white/[0.06] last:border-0"
                style={{ animation: `slideUp 0.6s ease-out ${idx * 0.08}s both` }}
              >
                <span className="font-serif text-3xl text-[#e0743a]/40 shrink-0 w-10">{uc.num}</span>
                <div>
                  <h3 className="font-serif text-xl text-[#f4efe9] mb-3">{uc.title}</h3>
                  <p className="text-[15px] text-[#a8a29a] leading-relaxed">{uc.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="w-full py-24 bg-[#08070a] border-t border-white/5 text-center relative overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] mb-10 text-balance max-w-2xl mx-auto">
            Start with your Baseline Design.
          </h2>
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}