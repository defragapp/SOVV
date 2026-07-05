import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Contact — Sovereign.os",
  description: "For product questions, support, or account help. Reach us at info@defrag.app.",
};

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

export default function ContactPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[45svh] pt-32 pb-20 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[700px]">
          <MetaLabel>Contact</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-6">
            <span className="text-glow">Get in touch.</span>
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            For product questions, support, or account help.
          </p>
        </Container>
      </Section>

      {/* Content */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div
            className="flex flex-col gap-0 border border-white/[0.06] overflow-hidden"
            style={{ borderRadius: "var(--radius-container)" }}
          >

            <div className="p-8 md:p-12 space-y-4 border-b border-white/[0.06] bg-[#08070a]">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Primary contact</p>
              <a
                href="mailto:info@defrag.app"
                className="block font-serif text-2xl text-[#f4efe9] hover:text-[#f0a06a] transition-colors"
              >
                info@defrag.app
              </a>
              <p className="text-[#a8a29a] text-sm leading-relaxed max-w-xl">
                For product questions, support, account help, privacy requests, and general inquiries.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4f4b47]">
                Response within 1–2 business days
              </p>
            </div>

            <div className="p-8 md:p-12 space-y-6 border-b border-white/[0.06] bg-[#08070a]">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">What to include</p>
              <ul className="space-y-3">
                {[
                  "Your account email",
                  "What you were trying to do",
                  "What happened instead",
                  "Any error message you saw",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-[#a8a29a] text-sm">
                    <span className="h-1 w-1 bg-[#e0743a]/40 rounded-[10px] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 md:p-12 space-y-4 bg-[#08070a]">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Privacy and data requests</p>
              <p className="text-[#a8a29a] text-sm leading-relaxed max-w-xl">
                To request deletion of your account and all associated data, email info@defrag.app. We process deletion requests within 30 days.
              </p>
            </div>

          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
