import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FadeUp } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works — Sovereign.os",
  description: "Set your Baseline Design. Work through what is active. Find the response that changes the pattern. Save what you learn.",
};

const steps = [
  {
    num: "01",
    title: "Set your Baseline Design",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. It gives the system context so the work does not begin with “what is wrong with me?” It begins with “what pattern is active?”",
  },
  {
    num: "02",
    title: "Work through what is active",
    body: "Enter the Defrag space. Tell it what is happening. A message you haven't sent. A conversation that keeps repeating. A family role that still runs. Defrag helps slow the moment down, separating what happened from what repeated.",
  },
  {
    num: "03",
    title: "Find the response that changes the pattern",
    body: "Understand what is driving the dynamic before it takes over. See the Best Next Response. You are not overreacting, you may be repeating. See where the pattern twists, and how to bring it back.",
  },
  {
    num: "04",
    title: "Save what you learn",
    body: "Save the result or the reflection to your Sovereign.os Library before the pressure of the moment erases it. Build continuity instead of starting over every time something hurts.",
  },
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="How it works"
        title="Start with what is happening now."
        body="Put the moment into context. Understand the pattern underneath it. Find the next response that changes it."
      />

      <MotionSection className="section-gap container-narrow">
        <div className="space-y-16">
          {steps.map((step, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div className="flex flex-col md:flex-row gap-8 items-start border-t border-border pt-12">
                <div className="w-full md:w-1/4">
                  <span className="text-display text-foreground-disabled opacity-30">{step.num}</span>
                </div>
                <div className="w-full md:w-3/4">
                  <h3 className="text-headline mb-4">{step.title}</h3>
                  <p className="text-body text-foreground-muted">{step.body}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="section-gap border-t border-border bg-hero-glow">
        <div className="container-platform text-center max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8">
              The wound is real. So is the choice after it.
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
