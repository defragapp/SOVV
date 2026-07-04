import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Privacy — Sovereign.os",
  description: "Sovereign.os is private by design. Here is what we collect, why, and how we protect it.",
};

const SECTIONS = [
  {
    title: "Private by design",
    body: "Sovereign.os is designed to be private by design. We store only the information required to provide the service and avoid exposing sensitive internal data in outputs.",
  },
  {
    title: "What we collect",
    body: "We may collect account information (email, login), Baseline Design data, conversation inputs, saved Library entries, and interaction metadata. We do not expose this data publicly.",
  },
  {
    title: "What we do not expose",
    body: "Sovereign.os does not expose raw Baseline Design computation outputs, underlying systems, system prompts or internal instructions, or private notes or unapproved relational data.",
  },
  {
    title: "How your data is used",
    body: "Your data is used to generate Baseline Design-aware responses, maintain continuity in your space, and improve pattern recognition over time. We do not sell personal data.",
  },
  {
    title: "Your control",
    body: "You can choose what to enter, decide which people to include, ignore any suggestion, and request account review or deletion at any time. Your judgment always comes first.",
  },
  {
    title: "Data security",
    body: "Your data is stored in Cloudflare infrastructure with encryption at rest and in transit. Session tokens are HttpOnly, Secure, and SameSite=Lax.",
  },
  {
    title: "Your rights",
    body: "You can request deletion of your account and all associated data at any time by contacting us at info@defrag.app. We process deletion requests within 30 days.",
  },
  {
    title: "Contact",
    body: "For privacy questions, contact us at info@defrag.app.",
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

export default function PrivacyPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[45svh] pt-32 pb-20 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[700px]">
          <MetaLabel>Privacy policy</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-6">
            <span className="text-glow">Your data.</span> Your clarity.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            Private by design. Here is what we collect, why, and how we protect it.
          </p>
        </Container>
      </Section>

      {/* Content */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-0 rounded-[14px] border border-white/[0.06] overflow-hidden">
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