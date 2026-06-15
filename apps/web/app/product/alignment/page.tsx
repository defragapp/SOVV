import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alignment — Sovereign.os",
  description: "Alignment is the response integration and action choice space inside Sovereign.os. Turn insight into a usable response.",
};

const WHAT_IT_SURFACES = [
  { label: "Alignment Result", body: "A structured output showing what is yours to carry and what belongs to the other side." },
  { label: "Response integration", body: "Turn the insight from Defrag into a concrete, actionable response." },
  { label: "Action choice", body: "See the impact of each path forward before you choose." },
  { label: "What is yours", body: "Clear framing of your responsibility — without taking on what is not yours." },
  { label: "What is not yours", body: "What belongs to the other side. What you do not need to carry." },
];

const WHEN = [
  "After a Defrag session — turning insight into action",
  "When you need to decide how to respond",
  "When you are unsure what is yours to carry",
  "When a boundary needs to be grounded in clarity",
  "When the next step needs to be concrete, not just emotional",
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

export default function AlignmentProductPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[65svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[860px]">
          <MetaLabel>Alignment space</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Turn insight into a usable response.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[600px] text-balance leading-relaxed mb-10">
            Alignment is the response integration and action choice space inside Sovereign.os. It helps you see what is yours to carry, what belongs to the other side, and what the next concrete step looks like.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://app.defrag.app/apps/alignment" className="btn-primary">
              Enter the Alignment space
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
        </Container>
      </Section>

      {/* What it is */}
      <Section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <MetaLabel>What Alignment does</MetaLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-8 text-balance">
            The step after the insight.
          </h2>
          <div className="space-y-6 text-base text-[#a8a29a] leading-relaxed">
            <p>
              Defrag helps you see the Active pattern. Alignment helps you do something with it.
            </p>
            <p>
              Alignment is the response integration and action choice space. It takes the insight from your Defrag session and turns it into a concrete, actionable response — showing you what is yours to carry and what belongs to the other side.
            </p>
            <p>
              Your Baseline Design is active beneath every Alignment thread. The output is grounded in how you actually tend to respond, not a generic framework.
            </p>
          </div>
        </Container>
      </Section>

      {/* What it surfaces */}
      <Section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-80 shrink-0 lg:sticky lg:top-32">
              <MetaLabel>What Alignment surfaces</MetaLabel>
              <h2 className="font-serif text-3xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4">
                An Alignment Result.
              </h2>
              <p className="text-[#76716b] text-sm leading-relaxed">
                Structured output showing what is yours, what is not, and what the next step looks like.
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

      {/* When to use */}
      <Section className="w-full py-20 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <div className="max-w-3xl">
            <MetaLabel>When to use Alignment</MetaLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-10 text-balance">
              When the insight needs to become a response.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WHEN.map((w) => (
                <div
                  key={w}
                  className="border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-sm text-[#a8a29a] leading-relaxed rounded-2xl"
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="w-full py-24 bg-[#08070a] border-t border-white/5 relative overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-8 text-balance">
            Your next response can change the pattern.
          </h2>
          <Link href="https://app.defrag.app/apps/alignment" className="btn-primary">
            Enter the Alignment space
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}