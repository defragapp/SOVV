import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Defrag — Sovereign.os",
  description: "Defrag helps you understand what is active in the moment. Separate what happened from what repeated. Find the response that gives it a better chance.",
};

const WHAT_IT_SURFACES = [
  { label: "Active pattern", body: "What is currently active beneath the surface of the moment." },
  { label: "The Repeat", body: "The recurring loop that keeps showing up across different situations." },
  { label: "Old Role", body: "The pattern you learned to carry under pressure." },
  { label: "What You Learned to Carry", body: "The adaptive behavior that made sense then and costs you now." },
  { label: "Strain Pattern", body: "Where your strength bends under pressure." },
  { label: "Gift Under Strain", body: "The strength underneath the pattern." },
  { label: "Best Next Response", body: "The concrete next move — grounded in your Baseline Design." },
  { label: "Conversational Steering", body: "What to move toward and what to step away from." },
];

const SUPPORTS = [
  "Relational dynamics",
  "Family dynamics",
  "Boundaries",
  "Messages",
  "Grief",
  "Team dynamics",
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

export default function DefragProductPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[65svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[860px]">
          <MetaLabel>Defrag space</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Separate the moment from the pattern.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[600px] text-balance leading-relaxed mb-10">
            Defrag helps you understand what is active in the moment — the pattern, the loop, the response that gives it a better chance. Say it how it actually happened. Defrag does the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://app.defrag.app/app/login" className="btn-primary">
              Enter the Defrag space
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
        </Container>
      </Section>

      {/* What Defrag supports */}
      <Section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container>
          <div className="max-w-3xl">
            <MetaLabel>What Defrag supports</MetaLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-6 text-balance">
              A broad relational intelligence space.
            </h2>
            <p className="text-[#a8a29a] text-base leading-relaxed mb-12 max-w-xl">
              Defrag is not only for conflict. It is for any moment where the pattern is active and a grounded response matters.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUPPORTS.map((s) => (
                <div
                  key={s}
                  className="border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-sm text-[#f4efe9] font-medium rounded-2xl"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* What it surfaces */}
      <Section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-80 shrink-0 lg:sticky lg:top-32">
              <MetaLabel>What Defrag surfaces</MetaLabel>
              <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4">
                A structured Result, not a paragraph.
              </h2>
              <p className="text-[#76716b] text-sm leading-relaxed">
                Defrag does not output a wall of text. You receive a structured Result with named sections you can use, save, and return to.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-0 rounded-2xl border border-white/[0.06] overflow-hidden">
              {WHAT_IT_SURFACES.map((item, i) => (
                <div
                  key={item.label}
                  className={[
                    "flex items-start gap-5 p-6 md:p-8 bg-[#08070a] hover:bg-[#0c0a0d] transition-colors",
                    i < WHAT_IT_SURFACES.length - 1 ? "border-b border-white/[0.06]" : "",
                  ].join(" ")}
                >
                  <span className="font-mono text-[#e0743a]/50 text-xs mt-0.5 shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[#f4efe9] text-sm font-medium mb-1">{item.label}</h3>
                    <p className="text-[#a8a29a] text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Baseline Design context */}
      <Section className="w-full py-20 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>Grounded in your Baseline Design</MetaLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-6 text-balance">
            The system understands you before you type.
          </h2>
          <p className="text-[#a8a29a] text-base leading-relaxed mb-4">
            Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center. It is active beneath every Defrag thread and never exposed in outputs.
          </p>
          <p className="text-[#76716b] text-sm leading-relaxed">
            No frameworks to learn. No right way to phrase it. Say it how it actually happened.
          </p>
        </Container>
      </Section>

      {/* Save to Library */}
      <Section className="w-full py-20 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>Save to Sovereign</MetaLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-6 text-balance">
            Keep what helped before the moment disappears.
          </h2>
          <p className="text-[#a8a29a] text-base leading-relaxed mb-8">
            Save a Result to your Sovereign.os Library. Return to it before the old pattern takes over again. The Repeat ends here.
          </p>
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter the Defrag space
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}