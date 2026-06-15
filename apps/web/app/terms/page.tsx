import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Terms of Service — Sovereign.os",
  description: "By using Sovereign.os, you agree to these terms.",
};

const SECTIONS = [
  {
    title: "What this service is",
    body: "Sovereign.os is a Baseline Design-aware platform designed to help users understand patterns in personal and relational situations. It provides structured reflection and response guidance based on user-provided information. The service is intended for informational and reflective use only.",
  },
  {
    title: "Not a professional service",
    body: "Sovereign.os does not provide therapy, medical advice, legal advice, or crisis support. The platform does not diagnose individuals or predict behavior. All outputs are generated based on available data and are intended to support user perspective, not replace professional judgment. If you are in crisis, please contact a qualified professional or emergency services.",
  },
  {
    title: "No guarantees",
    body: "Sovereign.os does not guarantee outcomes, accuracy, or the behavior of other individuals. Users are responsible for their own decisions, actions, and interpretations of the platform output.",
  },
  {
    title: "User responsibility",
    body: "You are responsible for the information you provide, the conversations you engage in outside the platform, and how you interpret and use any outputs. You should not rely on Sovereign.os for urgent, high-risk, or safety-critical decisions.",
  },
  {
    title: "Relational data and other people",
    body: "When referencing another individual within the platform, you must have the right to input that information and must not misuse the system to infer private thoughts or intentions. Sovereign.os does not claim to know another person's internal state. All relational outputs are pattern-based interpretations, not statements of fact.",
  },
  {
    title: "Intellectual property",
    body: "The underlying systems, Baseline Design computation methods, and data transformations used by Sovereign.os are proprietary. Users may not attempt to reverse engineer system outputs, scrape or automate extraction of responses, or replicate system behavior externally.",
  },
  {
    title: "Subscription and billing",
    body: "Pro subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.",
  },
  {
    title: "Limitation of liability",
    body: "Sovereign.os is provided as-is. We make no warranties about the accuracy or completeness of outputs. We are not liable for any decisions you make based on the platform output.",
  },
  {
    title: "Changes to terms",
    body: "We may update these terms from time to time. Continued use of Sovereign.os after changes constitutes acceptance of the updated terms.",
  },
  {
    title: "Contact",
    body: "For terms questions, contact us at info@defrag.app.",
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

export default function TermsPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[45svh] pt-32 pb-20 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[700px]">
          <MetaLabel>Terms of service</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-6">
            Terms of Service
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            By using Sovereign.os, you agree to these terms.
          </p>
        </Container>
      </Section>

      {/* Content */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-0 rounded-2xl border border-white/[0.06] overflow-hidden">
            {SECTIONS.map((section, i) => (
              <div
                key={i}
                className={[
                  "p-8 md:p-12 space-y-3 bg-[#08070a]",
                  i < SECTIONS.length - 1 ? "border-b border-white/[0.06]" : "",
                ].join(" ")}
              >
                <h3 className="text-[#f4efe9] text-lg font-medium tracking-tight">{section.title}</h3>
                <p className="text-[#a8a29a] text-sm leading-relaxed max-w-2xl">{section.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}