import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { pricingTiers } from "@/data/marketing";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Sovereign.os",
  description: "Start free. One subscription covers both Defrag and Covenant spaces. Upgrade to Pro to work the pattern over time, save what changes, and go deeper with another person.",
  openGraph: {
    title: "Pricing — Sovereign.os",
    description: "Start free. One subscription. Both spaces. Upgrade to Pro to work the pattern over time.",
  },
};

const SUPPORT_URL = process.env.STRIPE_SUPPORT_LINK_URL;

const proReasons = [
  { label: "The pattern keeps repeating", body: "Pro keeps the thread going across sessions so the AI can see what keeps showing up — not just what happened today." },
  { label: "Both sides matter", body: "Compare With Someone lets you work with two Baseline Designs when both people consent. Pro unlocks this." },
  { label: "You need to practice first", body: "Try It Out lets you simulate how a response might land before you use it. Pro only." },
  { label: "You want to keep what you learn", body: "Your Story keeps your saved results, patterns, and Best Next Responses organized over time. Pro unlocks full history." },
  { label: "Faith is part of the work", body: "Covenant space is included in Pro. Faith-context reflection, Covenant Briefs, and Library integration." },
];

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Pricing"
        title="Save what you learn before the moment disappears."
        body="Start free. One subscription covers both Defrag and Covenant. Your Baseline Design and Library are shared across everything."
      />

      {/* Tiers */}
      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`p-10 flex flex-col ${
                  tier.highlight
                    ? "border border-white/22 "
                    : "border border-white/10"
                } ${i === 1 ? "md:border-l-0" : ""}`}
              >
                {tier.highlight && (
                  <div className="mb-6 self-start font-mono text-[9px] uppercase tracking-widest text-[#05070B] bg-[#F6F5F3] px-2.5 py-1">
                    Recommended
                  </div>
                )}
                <p className="text-micro mb-6">{tier.name}</p>
                <div className="mb-2">
                  <span className="text-5xl font-light tracking-tight text-[#F6F5F3]">{tier.price}</span>
                  <span className="text-[#F6F5F3]/30 text-sm ml-2">{tier.period}</span>
                </div>
                <p className="text-caption mb-8">{tier.description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-xs text-[#F6F5F3]/45">
                      <span className="block h-px w-4 bg-[#F6F5F3]/18 shrink-0 mt-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block px-6 py-3.5 text-center font-mono text-[9px] uppercase tracking-widest transition-colors ${
                    tier.highlight
                      ? "bg-[#F6F5F3] text-[#05070B] hover:bg-[#F6F5F3]/88"
                      : "border border-white/18 text-[#F6F5F3]/70 hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          {SUPPORT_URL && (
            <div className="mt-10 text-center">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-label hover:text-[#F6F5F3]/60 transition-colors"
              >
                Support Defrag development
              </a>
            </div>
          )}
        </div>
      </MotionSection>

      {/* Why Pro */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-3">
            <span className="meta-label">Why Pro</span>
            <h2 className="text-headline">When the pattern keeps repeating,<br />Free is not enough.</h2>
          </div>
          <div className="space-y-0">
            {proReasons.map((r, i) => (
              <div key={r.label} className={`py-8 flex gap-8 ${i < proReasons.length - 1 ? "border-b border-white/8" : ""}`}>
                <div className="shrink-0 pt-1">
                  <span className="space-badge-defrag">Pro</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-light text-[#F6F5F3]/80">{r.label}</h3>
                  <p className="text-caption text-xs leading-6">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <Link href="https://app.defrag.app/app/login" className="sovv-button-primary inline-flex py-4 px-10">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </MotionSection>

      {/* FAQ */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-8">
          <span className="meta-label">Common questions</span>
          {[
            { q: "Is this therapy?", a: "No. Defrag is not therapy, diagnosis, or clinical care. It is a private space for understanding patterns and practicing better responses." },
            { q: "Do both spaces use the same subscription?", a: "Yes. One subscription covers both Defrag and Covenant. Your Baseline Design and Library are shared across everything." },
            { q: "Can I cancel?", a: "Yes. Cancel any time. Your Baseline Design and saved history remain available on the free tier." },
            { q: "Is my data private?", a: "Yes. Your Baseline Design, thread content, and Library are private by design. We do not sell personal data." },
          ].map((item) => (
            <div key={item.q} className="border-b border-white/8 pb-8 space-y-3">
              <h3 className="text-sm font-light text-[#F6F5F3]/80">{item.q}</h3>
              <p className="text-caption text-xs leading-6">{item.a}</p>
            </div>
          ))}
        </div>
      </MotionSection>
    </SiteShell>
  );
}