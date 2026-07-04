import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Covenant is the faith-context reflection space inside Sovereign.os. Plain-language repair and grounded discernment for what you are walking through.",
};

const POINTS = [
  {
    num: "01",
    title: "Grounded discernment, not certainty.",
    body: "Covenant gives faith-context reflection a structured place in the work. It translates the moment into reflection, repair, and a grounded next step — without preaching or spiritual shortcuts.",
  },
  {
    num: "02",
    title: "Faith and repair, connected.",
    body: "For users who want faith connected to repair, Covenant helps turn the moment toward reflection and responsibility. It keeps faith and relationships connected without becoming vague or performative.",
  },
  {
    num: "03",
    title: "Private by design.",
    body: "Covenant uses the same private space model as Defrag. Covenant Briefs save to your Sovereign.os Library — private, organized, and yours.",
  },
];

const WHEN_TO_USE = [
  "A relationship you are trying to repair",
  "A grief you are carrying",
  "A decision that involves your values",
  "A pattern you keep returning to",
  "A boundary you are trying to hold with integrity",
];

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  );
}

export default function CovenantPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[60svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/[0.04] pattern-field">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <MetaLabel>Covenant space</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            <span className="text-glow">Faith, reflection, responsibility,</span>
            <br />
            and grounded discernment.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[560px] text-balance leading-relaxed mb-10">
            Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/apps/covenant" className="btn-primary">
              Enter the Covenant space
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View Pro requirements
            </Link>
          </div>
        </Container>
      </Section>

      {/* What it is */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <MetaLabel>What Covenant does</MetaLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-12 text-balance">
            Not as certainty. Not as performance.
            <br />
            Not as a spiritual shortcut.
          </h2>
          <div className="flex flex-col gap-0">
            {POINTS.map((pt) => (
              <div key={pt.num} className="flex items-start gap-8 py-10 border-b border-white/[0.06] last:border-0">
                <span className="font-serif text-3xl text-[#e0743a]/40 shrink-0 w-10">{pt.num}</span>
                <div>
                  <h3 className="font-serif text-[1rem] text-[#f4efe9] mb-3">{pt.title}</h3>
                  <p className="text-[15px] text-[#a8a29a] leading-relaxed">{pt.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* When to use — structured list */}
      <Section className="w-full py-20 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>When to use Covenant</MetaLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-10 text-balance">
            A space to pause before you react.
          </h2>
          <div className="flex flex-col gap-0">
            {WHEN_TO_USE.map((w, i) => (
              <div key={i} className="flex items-center gap-6 py-5 border-b border-white/[0.06] last:border-0">
                <span className="h-px w-4 bg-[#e0743a]/30 shrink-0" />
                <p className="text-[15px] text-[#a8a29a] leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="w-full py-24 bg-[#0c0a0d] border-t border-white/5 relative overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-8 text-balance">
            Keep faith and repair connected.
          </h2>
          <Link href="/apps/covenant" className="btn-primary">
            Enter the Covenant space
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}