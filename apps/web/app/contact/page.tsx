import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact — Sovereign.os",
  description: "For product questions, support, or account help. Reach us at info@defrag.app.",
};

const SUPPORT_URL = process.env.STRIPE_SUPPORT_LINK_URL || "mailto:info@defrag.app";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-none border-border bg-transparent text-[#76716b] font-sans font-medium text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit"
    >
      {children}
    </Badge>
  )
}

export default function ContactPage() {
  return (
    <SiteShell>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-24 overflow-hidden border-b border-border bg-surface">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>CONTACT</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#f4efe9] leading-[1.04] text-balance mb-8">
            Get in touch.
          </h1>

          <p className="text-[#a8a29a] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[560px] text-balance leading-[1.65]">
            For product questions, support, or account help.
          </p>
        </Container>
      </Section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 bg-surface">
        <Container className="max-w-3xl">
          <div className="space-y-0 border border-border bg-surface divide-y divide-border">
            
            {/* Primary contact */}
            <div className="p-8 md:p-12 space-y-4">
              <span className="text-[#76716b] font-sans font-medium text-[10px] tracking-[0.15em] uppercase">Primary contact</span>
              <a
                href="mailto:info@defrag.app"
                className="block text-2xl font-medium text-[#f4efe9] hover:text-[#a8a29a] transition-colors"
              >
                info@defrag.app
              </a>
              <p className="text-[#a8a29a] text-sm leading-relaxed max-w-xl">
                This is the public contact address for Sovereign.os. For product questions, support, account help, privacy requests, and general inquiries.
              </p>
            </div>

            {/* What to include */}
            <div className="p-8 md:p-12 space-y-6">
              <span className="text-[#76716b] font-sans font-medium text-[10px] tracking-[0.15em] uppercase">What to include</span>
              <ul className="space-y-3">
                {[
                  "Your account email",
                  "What you were trying to do",
                  "What happened instead",
                  "Any error message you saw",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-[#a8a29a] text-sm">
                    <div className="w-1 h-1 bg-white/30 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy */}
            <div className="p-8 md:p-12 space-y-4">
              <span className="text-[#76716b] font-sans font-medium text-[10px] tracking-[0.15em] uppercase">Privacy and data requests</span>
              <p className="text-[#a8a29a] text-sm leading-relaxed max-w-xl">
                To request deletion of your account and all associated data, email info@defrag.app. We process deletion requests within 30 days.
              </p>
            </div>

            {/* Support link */}
            {SUPPORT_URL && (
              <div className="p-8 md:p-12">
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[#f4efe9] text-sm font-sans font-medium tracking-[0.1em] uppercase hover:text-[#a8a29a] transition-colors"
                >
                  Support Defrag development <span className="text-[#76716b]">→</span>
                </a>
              </div>
            )}

          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
