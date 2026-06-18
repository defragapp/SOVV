import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Principles — Sovereign.os",
  description: "The core mechanics governing how Sovereign.os processes your inputs and protects your data.",
};

const PRINCIPLES = [
  {
    num: "01",
    title: "Radical Objectivity",
    body: "Sovereign.os cuts through the emotional noise. It isn’t designed to just validate how you feel; it’s engineered to give you the exact facts of a dynamic so you can navigate it cleanly.",
  },
  {
    num: "02",
    title: "Data over narrative",
    body: "You don’t need to rehash the entire story. We map the underlying structure of the conflict—identifying the active pattern, the exact trigger, and the smartest way forward.",
  },
  {
    num: "03",
    title: "Mapping, not labeling",
    body: "We don’t pathologize. The system maps your cognitive and relational baseline to show you exactly how you operate under pressure, completely free from clinical labels.",
  },
  {
    num: "04",
    title: "Immediate Utility",
    body: "Theoretical advice doesn’t survive friction. Every output is designed to be instantly recognizable, deeply accurate, and ready to act on right now.",
  },
  {
    num: "05",
    title: "Built for the friction point",
    body: "This isn’t a passive journal. It’s a precision tool built for the exact moment before you hit send, repeat a cycle, or walk into a difficult room.",
  },
  {
    num: "06",
    title: "Zero Jargon",
    body: "Complex relational dynamics, translated into plain English. You don’t need to learn a new psychological framework—you just get the answer.",
  },
  {
    num: "07",
    title: "Edge-Private Security",
    body: "Your Baseline Design and session inputs are processed securely on Cloudflare edge infrastructure. Your personal data trains nothing. What happens in the workspace stays there.",
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
            The architecture of clarity.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            The core mechanics governing how Sovereign.os processes your inputs and protects your data.
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
