import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { pricingTiers } from "@/data/marketing";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — DEFRAG",
  description: "Start free. See what got lit up. Upgrade to Pro to work the pattern over time, save what changes, and go deeper with another person.",
  openGraph: {
    title: "Pricing — DEFRAG",
    description: "Start free. See what got lit up. Upgrade to Pro to work the pattern over time.",
  },
};

const SUPPORT_URL = process.env.STRIPE_SUPPORT_LINK_URL;

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Pricing"
        title="Simple. No surprises."
        body="Start free. Upgrade when you're ready for more."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`p-10 flex flex-col ${
                  tier.highlight
                    ? "border border-white/25 shadow-[0_0_40px_rgba(255,255,255,0.04)]"
                    : "border border-white/8"
                } ${i === 1 ? "md:border-l-0" : ""}`}
              >
                {tier.highlight && (
                  <div className="mb-6 self-start font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2.5 py-1">
                    Recommended
                  </div>
                )}
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-6">{tier.name}</p>
                <div className="mb-2">
                  <span className="text-5xl font-light text-white">{tier.price}</span>
                  <span className="text-white/30 text-sm ml-2">{tier.period}</span>
                </div>
                <p className="text-sm text-white/35 mb-8">{tier.description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/55">
                      <span className="block h-px w-4 bg-white/20 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block px-6 py-3.5 text-center font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    tier.highlight
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/20 text-white hover:bg-white/5"
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
              className="font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white"
            >
              Support Defrag development
            </a>
          </div>
          )}
        </div>
      </MotionSection>
    </SiteShell>
  );
}