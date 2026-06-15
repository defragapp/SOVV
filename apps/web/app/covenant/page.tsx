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
    title: "Grounded discernment, not certainty.",
    body: "Covenant gives faith-context reflection a structured place in the work. It translates the moment into reflection, repair, and a grounded next step — without preaching or spiritual shortcuts.",
  },
  {
    title: "Faith and repair, connected.",
    body: "For users who want faith connected to repair, Covenant helps turn the moment toward reflection and responsibility. It keeps faith and relationships connected without becoming vague or performative.",
  },
  {
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
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  );
}

export default function CovenantPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[60svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <MetaLabel>Covenant space</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Faith, reflection, responsibility,
            <br />
            and grounded discernment.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[560px] text-balance leading-relaxed mb-10">
            Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://app.defrag.app/apps/covenant" className="btn-primary">
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
          <div className="space-y-12">
            {POINTS.map((pt, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 items-start border-t border-white/[0.06] pt-10">
                <div className="w-full md:w-1/3">
                  <h3 className="text-[#f4efe9] font-medium text-base leading-snug">{pt.title}</h3>
                </div>
                <div className="w-full md:w-2/3">
                  <p className="text-[#a8a29a] text-[15px] leading-relaxed">{pt.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* When to use */}
      <Section className="w-full py-24 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-4xl">
          <div className="text-center mb-14">
            <MetaLabel>When to use Covenant</MetaLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4">
              A space to pause before you react.
            </h2>
            <p className="text-[#a8a29a] text-base max-w-md mx-auto leading-relaxed">
              Covenant is for the user who wants faith to stay connected to the work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHEN_TO_USE.map((uc, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-[#a8a29a] text-[15px] leading-relaxed hover:border-[#e0743a]/20 hover:bg-white/[0.04] transition-all duration-300"
              >
                {uc}
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
          <Link href="https://app.defrag.app/apps/covenant" className="btn-primary">
            Enter the Covenant space
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}