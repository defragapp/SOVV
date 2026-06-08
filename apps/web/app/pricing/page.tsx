import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FadeUp } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";
import { pricingTiers } from "@/data/marketing";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Sovereign.os",
  description: "Free is for beginning the work. Pro is for the patterns that need more than one pass.",
};

const proReasons = [
  { title: "The pattern keeps repeating", body: "Pro keeps the thread going across sessions so the AI can see what keeps showing up — not just what happened today." },
  { title: "Both sides matter", body: "Compare With Someone lets you work with two Baseline Designs when both people consent. Pro unlocks this." },
  { title: "You need to practice first", body: "Try It Out lets you simulate how a response might land before you use it. Pro only." },
  { title: "You want to keep what you learn", body: "Your Library keeps your saved results, patterns, and responses organized over time. Pro unlocks full continuity." },
  { title: "Faith is part of the work", body: "Covenant space is included in Pro. Faith, reflection, and grounded discernment." },
];

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Pricing"
        title="For the work that needs continuity."
        body="Free is for beginning the work. Pro is for the patterns that need more than one pass. Build continuity instead of starting over every time something hurts."
      />

      {/* Tiers */}
      <MotionSection className="section-gap container-narrow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricingTiers.map((tier, i) => (
              <FadeUp key={tier.name} delay={i * 0.1}>
                <Card className={`h-full flex flex-col ${tier.popular ? 'border-focus glow-sm bg-elevated' : 'bg-surface'}`}>
                  {tier.popular && (
                    <span className="badge-pro self-start mb-6">Pro</span>
                  )}
                  {!tier.popular && (
                    <span className="space-badge self-start mb-6">Free</span>
                  )}
                  <h3 className="text-title mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-headline">{tier.price}</span>
                    <span className="text-body-sm text-foreground-muted">{tier.interval}</span>
                  </div>
                  <p className="text-body-sm text-foreground-muted mb-8">{tier.description}</p>
                  
                  <div className="mt-auto mb-8">
                    <ul className="space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-body-sm text-foreground-muted">
                          <span className="text-foreground-disabled">/</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={tier.href}
                    className={`w-full text-center ${tier.popular ? "btn-primary" : "btn-secondary"}`}
                  >
                    {tier.cta}
                  </Link>
                </Card>
              </FadeUp>
            ))}
        </div>
      </MotionSection>

      <MotionSection className="section-gap border-y border-border bg-surface">
        <div className="container-platform max-w-4xl mx-auto">
          <FadeUp>
             <div className="text-center mb-12">
               <h2 className="text-headline mb-6">Why upgrade?</h2>
               <p className="text-body text-foreground-muted">Some patterns can't be resolved in a single moment.</p>
             </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proReasons.map((r, i) => (
              <FadeUp key={i} delay={0.05 * i}>
                 <Card className="h-full">
                    <h4 className="text-title mb-2">{r.title}</h4>
                    <p className="text-body-sm text-foreground-muted">{r.body}</p>
                 </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </MotionSection>
      
      <MotionSection className="section-gap bg-hero-glow">
        <div className="container-platform text-center max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8">
              Save what you learn before the moment disappears.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.defrag.app/app/login" className="btn-primary">
                Enter Sovereign.os
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>
    </SiteShell>
  );
}
