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

const FREE_FEATURES = [
  "Baseline Design setup",
  "Defrag space access",
  "Active pattern + Best Next Response",
  "Basic Sovereign.os Library",
  "5 sessions per day",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited sessions",
  "Covenant space — faith-context reflection",
  "Alignment space — response integration",
  "Full Sovereign.os Library depth",
  "Invite Privately — when both sides matter",
  "Audio Overview of your Result",
];

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

      {/* Plans — structured comparison, no card boxes */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-4xl">

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-8 mb-8 pb-6 border-b border-white/[0.06]">
            <div />
            <div className="text-center">
              <p className="font-serif text-2xl text-[#f4efe9] mb-1">Free</p>
              <p className="font-serif text-3xl text-[#f4efe9]">$0</p>
              <p className="text-sm text-[#76716b] mt-1">forever</p>
            </div>
            <div className="text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#e0743a] text-[#08070a] text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full">Recommended</span>
              </div>
              <p className="font-serif text-2xl text-[#f4efe9] mb-1 mt-4">Pro</p>
              <p className="font-serif text-3xl text-[#f4efe9]">$20</p>
              <p className="text-sm text-[#76716b] mt-1">per month</p>
            </div>
          </div>

          {/* Feature rows */}
          {[
            { label: "Baseline Design", free: true, pro: true },
            { label: "Defrag space", free: true, pro: true },
            { label: "Active pattern + Best Next Response", free: true, pro: true },
            { label: "Sovereign.os Library", free: "Basic", pro: "Full depth" },
            { label: "Daily sessions", free: "5/day", pro: "Unlimited" },
            { label: "Covenant space", free: false, pro: true },
            { label: "Alignment space", free: false, pro: true },
            { label: "Invite Privately", free: false, pro: true },
            { label: "Audio Overview", free: false, pro: true },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-8 py-5 border-b border-white/[0.04] items-center">
              <p className="text-sm text-[#a8a29a]">{row.label}</p>
              <div className="text-center">
                {row.free === true ? (
                  <span className="text-[#e0743a]/60 text-base">✓</span>
                ) : row.free === false ? (
                  <span className="text-[#4f4b47] text-base">—</span>
                ) : (
                  <span className="text-sm text-[#76716b]">{row.free}</span>
                )}
              </div>
              <div className="text-center">
                {row.pro === true ? (
                  <span className="text-[#e0743a] text-base">✓</span>
                ) : row.pro === false ? (
                  <span className="text-[#4f4b47] text-base">—</span>
                ) : (
                  <span className="text-sm text-[#f4efe9]">{row.pro}</span>
                )}
              </div>
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div />
            <div className="flex justify-center">
              <Link href="https://app.defrag.app/app/login" className="btn-secondary text-sm px-6 h-11">
                Start for Free
              </Link>
            </div>
            <div className="flex justify-center">
              <Link href="https://app.defrag.app/app/login" className="btn-primary text-sm px-6 h-11">
                Upgrade to Pro
              </Link>
            </div>
          </div>

        </Container>
      </Section>

      {/* Note */}
      <Section className="w-full py-16 bg-[#08070a] border-t border-white/5 text-center">
        <Container className="max-w-2xl">
          <p className="text-[#76716b] text-sm leading-relaxed">
            Upgrades happen through secure payment gateways. Your Pro status unlocks backend continuity and priority access across all spaces. Cancel any time — your Library stays yours.
          </p>
        </Container>
      </Section>
    </SiteShell>
  );
}