import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Principles — Sovereign.os",
  description: "The values that shape how Sovereign.os is built and how it works.",
};

const PRINCIPLES = [
  {
    num: "01",
    title: "Clarity over comfort",
    body: "Sovereign.os is not designed to make you feel better. It is designed to help you see more clearly. Sometimes those are the same thing. Often they are not.",
  },
  {
    num: "02",
    title: "Structure over story",
    body: "Most confusion comes from being inside the story. Sovereign.os helps you see the structure beneath it — the Active pattern, the dynamic, the moment where something different was possible.",
  },
  {
    num: "03",
    title: "No diagnosis, no labels",
    body: "Sovereign.os does not tell you what is wrong with you. It helps you understand how you work — and what tends to happen when you are under pressure.",
  },
  {
    num: "04",
    title: "Insight that lands",
    body: "Clarity that only lives in the mind is not clarity. Sovereign.os is designed to produce insight that lands — the kind you recognize as true, not just understand.",
  },
  {
    num: "05",
    title: "Built for real life",
    body: "Not for therapy sessions. Not for journaling. For the moment before you send the message. For the conversation that keeps repeating. For right now.",
  },
  {
    num: "06",
    title: "No jargon",
    body: "Sovereign.os translates complex patterns into plain language. You do not need to understand the systems underneath it. You just need to understand yourself.",
  },
  {
    num: "07",
    title: "Private by design",
    body: "Your Baseline Design and everything you share are held privately, encrypted, and never sold or exposed in outputs. What you bring stays yours.",
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

export default function PrinciplesPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-20 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[700px]">
          <MetaLabel>Principles</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-6">
            What we believe.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            The values that shape how Sovereign.os is built and how it works.
          </p>
        </Container>
      </Section>

      {/* Principles */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="divide-y divide-white/[0.06]">
            {PRINCIPLES.map((p) => (
              <div key={p.num} className="flex gap-8 py-10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#4f4b47] shrink-0 mt-1 w-6">
                  {p.num}
                </span>
                <div>
                  <h3 className="text-[#f4efe9] text-lg font-medium mb-3">{p.title}</h3>
                  <p className="text-sm leading-7 text-[#a8a29a]">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}