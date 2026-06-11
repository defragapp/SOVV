import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import { Badge } from "@/components/ui/badge";

const SECTIONS = [
  {
    title: "What this service is",
    body: "Sovereign.os is a Baseline Design-aware AI platform designed to help users understand patterns in personal and relational situations. It provides structured reflection and response guidance based on user-provided information and system-generated interpretations. The service is intended for informational and reflective use only.",
  },
  {
    title: "Not a professional service",
    body: "Sovereign.os does not provide therapy, medical advice, legal advice, or crisis support. The platform does not diagnose individuals or predict behavior. All outputs are generated based on available data and are intended to support user perspective, not replace professional judgment. If you are in crisis, please contact a qualified professional or emergency services.",
  },
  {
    title: "No guarantees",
    body: "Sovereign.os does not guarantee outcomes, accuracy, or the behavior of other individuals. Users are responsible for their own decisions, actions, and interpretations of the platform's output.",
  },
  {
    title: "User responsibility",
    body: "You are responsible for the information you provide, the conversations you engage in outside the platform, and how you interpret and use any outputs. You should not rely on Sovereign.os for urgent, high-risk, or safety-critical decisions.",
  },
  {
    title: "Relational data and other people",
    body: "When interacting with or referencing another individual within the platform, you must have the right to input that information and must not misuse the system to infer private thoughts or intentions. Sovereign.os does not claim to know another person's internal state. All relational outputs are pattern-based interpretations, not statements of fact.",
  },
  {
    title: "Intellectual property",
    body: "The underlying systems, Baseline Design computation methods, scoring logic, prompts, and data transformations used by Sovereign.os are proprietary. Users may not attempt to reverse engineer system outputs, scrape or automate extraction of responses, or replicate system behavior externally. The platform intentionally provides summarized outputs and does not expose internal computation details.",
  },
  {
    title: "Subscription and billing",
    body: "Pro subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.",
  },
  {
    title: "Limitation of liability",
    body: "Sovereign.os is provided as-is. We make no warranties about the accuracy or completeness of outputs. We are not liable for any decisions you make based on the platform's output.",
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-none border-white/[0.12] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit"
    >
      {children}
    </Badge>
  )
}

export default function TermsPage() {
  return (
    <SiteShell>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-24 overflow-hidden border-b border-white/[0.06] bg-[#050505]">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>TERMS OF SERVICE</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance mb-8">
            Terms of Service
          </h1>

          <p className="text-[#A1A1AA] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[560px] text-balance leading-[1.65]">
            By using Sovereign.os, you agree to these terms.
          </p>
        </Container>
      </Section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 bg-[#080808]">
        <Container className="max-w-3xl">
          <div className="space-y-0 border border-white/[0.07] bg-[#050505] divide-y divide-white/[0.07]">
            {SECTIONS.map((section, i) => (
              <div key={i} className="p-8 md:p-12 space-y-4">
                <h3 className="text-[#FAFAFA] text-xl font-medium tracking-tight">{section.title}</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-2xl">{section.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
