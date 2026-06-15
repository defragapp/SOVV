import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Covenant is the faith-context reflection space inside Sovereign.os. Plain-language repair and grounded discernment for what you are walking through.",
};

const WHAT_IT_SURFACES = [
  { label: "Covenant Brief", body: "A structured reflection output grounded in your Baseline Design and the situation you described." },
  { label: "Grounded discernment", body: "Not certainty. Not performance. A grounded next step that is honest, not just emotional." },
  { label: "Plain-language repair", body: "Reflection translated into plain language — no jargon, no spiritual shortcuts." },
  { label: "Responsibility framing", body: "What is yours to carry. What belongs to the other side. What the next honest step looks like." },
];

const WHEN = [
  "A relationship you are trying to repair",
  "A grief you are carrying",
  "A decision that involves your values",
  "A pattern you keep returning to",
  "A boundary you are trying to hold with integrity",
  "A moment where faith and responsibility need to stay connected",
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

export default function CovenantProductPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[65svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[860px]">
          <MetaLabel>Covenant space</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Faith, reflection, and grounded discernment.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[600px] text-balance leading-relaxed mb-10">
            Covenant is for the user who wants faith to stay connected to the work. Not as certainty. Not as performance. As faith connected to repair and the next honest step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="https://app.defrag.app/apps/covenant" className="btn-primary">
              Enter the Covenant space
            </Link>
            <Link href="/pricing" className="btn-secondary">
              Pro required
            </Link>
          </div>
        </Container>
      </Section>

      {/* What it is */}
      <Section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <MetaLabel>What Covenant is</MetaLabel>
          <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-8 text-balance">
            Not as certainty. Not as performance.<br />Not as a spiritual shortcut.
          </h2>
          <div className="space-y-6 text-base text-[#a8a29a] leading-relaxed">
            <p>
              Covenant is an optional faith-context reflection space inside Sovereign.os. It is user-initiated, plain-language, and private by design.
            </p>
            <p>
              It helps you bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
            </p>
            <p>
              Covenant uses the same Baseline Design and Library as Defrag. Your Covenant Briefs save to your Sovereign.os Library — private, organized, and yours.
            </p>
          </div>
        </Container>
      </Section>

      {/* What it surfaces */}
      <Section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-80 shrink-0 lg:sticky lg:top-32">
              <MetaLabel>What Covenant surfaces</MetaLabel>
              <h2 className="font-serif text-3xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4">
                A Covenant Brief.
              </h2>
              <p className="text-[#76716b] text-sm leading-relaxed">
                Structured reflection output grounded in your Baseline Design and the situation you described.
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
            <MetaLabel>When to use Covenant</MetaLabel>
            <h2 className="font-serif text-3xl md:text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-10 text-balance">
              A space to pause before you react.
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
            Keep faith and repair connected.
          </h2>
          <p className="text-[#76716b] text-sm mb-8">Covenant is available on the Pro plan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://app.defrag.app/apps/covenant" className="btn-primary">
              Enter the Covenant space
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View pricing
            </Link>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}