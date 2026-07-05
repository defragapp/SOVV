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
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">
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
            <span className="text-glow"><span className="text-glow">Terms of Service</span></span>
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            By using Sovereign.os, you agree to these terms.
          </p>
        </Container>
      </Section>

      {/* Content */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4f4b47] mb-12">
            Last updated: July 2026
          </p>
          <div className="flex flex-col gap-12">
            {SECTIONS.map((section, i) => (
              <div key={i} className="flex gap-8 md:gap-12">
                <div className="shrink-0 pt-1">
                  <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.1em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-3 pb-12 border-b border-white/[0.04] last:border-0 last:pb-0 flex-1">
                  <h3 className="text-[#f4efe9] text-[17px] font-medium tracking-[-0.01em]">{section.title}</h3>
                  <p className="text-[#76716b] text-[14px] leading-[1.8]">{section.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-white/[0.04]">
            <p className="text-[13px] text-[#4f4b47] leading-relaxed">
              Questions about these terms? Contact us at{" "}
              <a href="mailto:info@defrag.app" className="text-[#76716b] hover:text-[#a8a29a] transition-colors">
                info@defrag.app
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}