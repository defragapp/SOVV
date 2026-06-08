import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FadeUp } from "@/components/ui/fade-up";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Sovereign.os",
  description: "Sovereign.os is a private place to work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title="Before you explain yourself again, return to yourself first."
        body="Not for abstract self-improvement. For the specific, real, sometimes difficult moments of actual life."
      />

      <MotionSection className="section-gap container-narrow">
        <FadeUp>
          <div className="space-y-8 text-body text-foreground-muted">
            <p>
              Sovereign.os is a private place to work through the patterns that keep showing up in your life. The message that unsettled you. The family role you keep falling back into. The boundary you keep negotiating with yourself. The grief that changes the room. The relationship dynamic you can feel, but cannot fully name.
            </p>
            <p>
              It gives those moments structure — without turning them into a diagnosis, a score, or a verdict.
            </p>
            <p>
              The product is designed to be private, direct, and useful. It does not diagnose, predict, or guarantee outcomes. Healing is not becoming untouched. It is becoming harder to move away from yourself.
            </p>
            <div className="border-t border-border pt-8 mt-12">
              <p className="text-body font-mono uppercase tracking-widest text-foreground-disabled">
                The wound is real. So is the choice after it.
              </p>
            </div>
          </div>
        </FadeUp>
      </MotionSection>
      
      <MotionSection className="section-gap border-t border-border bg-hero-glow">
        <div className="container-platform text-center max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8">
              Healing isn’t optional.<br/>Holding the pain is.
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
