import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product — Sovereign.os",
  description: "Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries. Your Baseline Design is the source.",
  openGraph: {
    title: "Product — Sovereign.os",
    description: "Sovereign.os helps you work through the patterns that keep showing up. Your Baseline Design is the source.",
  },
};

const SURFACES = [
  {
    tag: "01",
    title: "Baseline Design",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. Every thread is grounded here. Private, never exposed in outputs, always active before you type.",
  },
  {
    tag: "02",
    title: "Defrag",
    body: "For the moment that will not leave you alone. Defrag helps you slow the moment down, separate what happened from what repeated, and find the Best Next Response that does not keep feeding the same loop. Defrag supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics.",
  },
  {
    tag: "03",
    title: "Covenant",
    body: "For the user who wants faith to stay connected to the work. Covenant brings plain-language reflection, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.",
  },
  {
    tag: "04",
    title: "Alignment",
    body: "Response integration and action choice. Alignment helps turn insights into actionable responses, showing you what is yours to carry and what belongs to the other side.",
  },
  {
    tag: "05",
    title: "Sovereign.os Library",
    body: "The private record of what helped. Save to Sovereign before the moment disappears. Return to your Library before the old pattern takes over again. The Repeat ends here.",
  },
  {
    tag: "06",
    title: "Invite Privately",
    body: "Two people can live through the same conversation and leave with completely different truths. When both sides matter, invite privately to understand the shared loop without keeping score.",
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

export default function ProductPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[70svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(to right, #f4efe9 1px, transparent 1px), linear-gradient(to bottom, #f4efe9 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[900px]">
          <MetaLabel>The system</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,7vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Turn charged moments into something you can work with.
          </h1>
          <p className="text-[#a8a29a] text-base md:text-lg max-w-[640px] mb-12 text-balance leading-relaxed">
            Sovereign.os helps you work through the moments that keep replaying — the message, the conflict, the family role, the grief, the boundary — and save what you learn before the pattern takes over again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <Link href="https://app.defrag.app/app/login" className="btn-primary">
              Enter Sovereign.os
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
        </Container>
      </Section>

      {/* Architecture */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-b border-white/5">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">

            <div className="lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-32">
              <MetaLabel>The architecture</MetaLabel>
              <h2 className="font-serif text-[clamp(1.6rem,4vw,2.25rem)] text-[#f4efe9] leading-tight">
                You do not need a verdict.
                <br />
                <span className="text-[#a8a29a]">You need a way through.</span>
              </h2>
              <p className="text-[#76716b] text-sm leading-relaxed">
                The conversation ended. Your body did not. Some moments do not need a reply yet — they need context. Sovereign.os gives those moments structure without turning them into a diagnosis, a score, or a verdict.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-0 border border-white/[0.06] rounded-2xl overflow-hidden">
              {SURFACES.map((s, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-start gap-6 p-7 md:p-10 bg-[#08070a] hover:bg-[#0c0a0d] transition-colors",
                    i < SURFACES.length - 1 ? "border-b border-white/[0.06]" : "",
                  ].join(" ")}
                >
                  <span className="font-mono text-[#4f4b47] text-xs mt-1 shrink-0 w-6">{s.tag}</span>
                  <div className="space-y-2">
                    <h3 className="text-[#f4efe9] text-[17px] font-medium tracking-tight">{s.title}</h3>
                    <p className="text-[#a8a29a] text-[15px] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="w-full py-32 md:py-48 bg-[#08070a] relative overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 text-center max-w-[780px]">
          <h2 className="font-serif text-[clamp(2.4rem,5vw,3.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-12">
            Your next response can change the pattern.
          </h2>
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}