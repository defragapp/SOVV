import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — Sovereign.os",
  description: "Sovereign.os guides you from the moment that won't leave you alone toward a clearer way through. Here is the product loop.",
};

const STEPS = [
  {
    num: "01",
    title: "Set your Baseline Design",
    body: "Before you bring any active situation, you define your Baseline Design. This is the starting map: how you tend to process, respond, connect, protect, communicate, and return to center. It is active beneath every thread. Private, never exposed in outputs.",
    note: "Your Baseline Design gives Sovereign.os context before you type. You do not have to explain who you are every time a moment happens.",
  },
  {
    num: "02",
    title: "Bring the moment",
    body: "You bring what feels active, unresolved, or repeating into the Defrag space — or the Covenant or Alignment spaces. Describe the pressure, the message, the dynamic, or the grief. Say it how it actually happened.",
    note: null,
  },
  {
    num: "03",
    title: "Receive a structured Result",
    body: "Sovereign.os does not output a paragraph blob. You receive a structured Result surfacing the Active pattern, the Old Role, the Strain Pattern, and a clear Best Next Response with Conversational Steering.",
    note: null,
  },
  {
    num: "04",
    title: "Save to Sovereign",
    body: "The platform succeeds when you can use the output in a real moment. Save the structured Result to your Sovereign.os Library so it is preserved before the moment disappears.",
    note: null,
  },
  {
    num: "05",
    title: "Return to your Library",
    body: "The next time the loop tries to form, you do not start from zero. Return to your Library, interrupt the Old Role, and respond differently. The Repeat ends here.",
    note: null,
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

export default function HowItWorksPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[60svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <MetaLabel>The process</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            How Sovereign.os works.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[600px] text-balance leading-relaxed">
            The system understands your Baseline Design before you type. Here is the product loop.
          </p>
        </Container>
      </Section>

      {/* Steps */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container>
          <div className="max-w-4xl mx-auto space-y-20">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col md:flex-row gap-10 items-start border-b border-white/[0.06] pb-20 last:border-0 last:pb-0">
                <div className="font-serif text-5xl text-[#e0743a]/50 shrink-0 w-16">{step.num}</div>
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl md:text-3xl text-[#f4efe9] leading-tight">{step.title}</h3>
                  <p className="text-base text-[#a8a29a] leading-relaxed max-w-2xl">{step.body}</p>
                  {step.note && (
                    <p className="text-sm text-[#76716b] leading-relaxed max-w-xl border-l-2 border-[#e0743a]/20 pl-4">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="w-full py-32 bg-[#08070a] border-t border-white/5 text-center relative overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] mb-10 text-balance max-w-2xl mx-auto">
            Ready to interrupt the loop?
          </h2>
          <Link
            href="https://app.defrag.app/app/login"
            className="btn-primary"
          >
            Enter Sovereign.os
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}