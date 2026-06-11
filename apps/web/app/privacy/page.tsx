import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import { Badge } from "@/components/ui/badge";

const SECTIONS = [
  {
    title: "Private by design",
    body: "Sovereign.os is designed to be private by design. We store only the information required to provide the service and avoid exposing sensitive internal data in outputs.",
  },
  {
    title: "What we collect",
    body: "We may collect account information (email, login), Baseline Design data (date, time, and place of birth), conversation inputs, saved notebook entries, and interaction metadata. We do not expose this data publicly.",
  },
  {
    title: "What we do not expose",
    body: "Sovereign.os does not expose raw Baseline Design computation outputs, underlying symbolic or mapping systems, system prompts or internal instructions, or private notes or unapproved relational data.",
  },
  {
    title: "How your data is used",
    body: "Your data is used to generate Baseline Design-aware responses, maintain continuity in your space, and improve pattern recognition over time. We do not sell personal data.",
  },
  {
    title: "Source transparency",
    body: "Defrag may show a summary of what influenced an answer — such as your Baseline Design, the sky over you, selected people, notebook context, or prior patterns. This summary does not expose raw system data or proprietary logic.",
  },
  {
    title: "Your control",
    body: "You can choose what to enter, decide which people to include, ignore any suggestion, and request account review or deletion at any time. Your judgment always comes first.",
  },
  {
    title: "Data security",
    body: "Your data is stored in Cloudflare's infrastructure with encryption at rest and in transit. Session tokens are HttpOnly, Secure, and SameSite=Lax.",
  },
  {
    title: "Your rights",
    body: "You can request deletion of your account and all associated data at any time by contacting us. We will process deletion requests within 30 days.",
  },
  {
    title: "Contact",
    body: "For privacy questions, contact us at info@defrag.app.",
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

export default function PrivacyPage() {
  return (
    <SiteShell>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-24 overflow-hidden border-b border-white/[0.06] bg-[#050505]">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>PRIVACY POLICY</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance mb-8">
            Your data. Your clarity.
          </h1>

          <p className="text-[#A1A1AA] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[560px] text-balance leading-[1.65]">
            Private by design. Here is what we collect, why, and how we protect it.
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
