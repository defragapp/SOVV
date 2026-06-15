import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Sovereign.os",
  description: "Sovereign.os offers a free tier to begin the work and a Pro tier for deeper continuity across all spaces.",
};

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

export default function PricingPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <MetaLabel>Pricing</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Choose your progression.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[600px] text-balance leading-relaxed">
            We do not sell AI features. We sell progression — the ability to return, remember, and interrupt the pattern.
          </p>
        </Container>
      </Section>

      {/* Plans */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

            {/* Free */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-10 md:p-12 flex flex-col">
              <div className="mb-8">
                <h3 className="font-serif text-3xl text-[#f4efe9] mb-2">Free</h3>
                <p className="text-[#a8a29a] text-base leading-relaxed">Begin the work. Understand a moment before it takes over.</p>
              </div>
              <div className="font-serif text-5xl text-[#f4efe9] mb-10">
                $0 <span className="text-xl text-[#76716b] font-sans font-normal">/ forever</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  "Baseline Design setup",
                  "Defrag space access",
                  "Active pattern + Best Next Response",
                  "Basic Sovereign.os Library",
                  "5 sessions per day",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#a8a29a]">
                    <span className="text-[#e0743a] mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="https://app.defrag.app/app/login"
                className="btn-secondary justify-center"
              >
                Start for Free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border border-[#e0743a]/20 bg-[#e0743a]/[0.03] p-10 md:p-12 flex flex-col relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#e0743a] text-[#08070a] text-[10px] uppercase tracking-widest px-3 py-1 font-medium rounded-full">
                Recommended
              </div>
              <div className="mb-8">
                <h3 className="font-serif text-3xl text-[#f4efe9] mb-2">Pro</h3>
                <p className="text-[#a8a29a] text-base leading-relaxed">Stay with it. Deep continuity across all spaces, no limits.</p>
              </div>
              <div className="font-serif text-5xl text-[#f4efe9] mb-10">
                $20 <span className="text-xl text-[#76716b] font-sans font-normal">/ month</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  "Everything in Free",
                  "Unlimited sessions",
                  "Covenant space — faith-context reflection",
                  "Alignment space — response integration",
                  "Full Sovereign.os Library depth",
                  "Invite Privately — when both sides matter",
                  "Audio Overview of your Result",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#a8a29a]">
                    <span className="text-[#e0743a] mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="https://app.defrag.app/app/login"
                className="btn-primary justify-center"
              >
                Upgrade to Pro
              </Link>
            </div>

          </div>
        </Container>
      </Section>

      {/* Note */}
      <Section className="w-full py-20 bg-[#08070a] border-t border-white/5 text-center">
        <Container className="max-w-2xl">
          <p className="text-[#76716b] text-sm leading-relaxed">
            Upgrades happen through secure payment gateways. Your Pro status unlocks backend continuity and priority access across all spaces. Cancel any time — your Library stays yours.
          </p>
        </Container>
      </Section>
    </SiteShell>
  );
}