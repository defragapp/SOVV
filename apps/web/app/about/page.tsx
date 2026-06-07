import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
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
        title="Built for the moments that will not leave you alone."
        body="Not for abstract self-improvement. For the specific, real, sometimes difficult moments of actual life."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-8 text-body leading-8">
          <p>
            Sovereign.os is a private place to work through the patterns that keep showing up in your life. The message that unsettled you. The family role you keep falling back into. The boundary you keep negotiating with yourself. The grief that changes the room. The relationship dynamic you can feel, but cannot fully name.
          </p>
          <p>
            It gives those moments structure — without turning them into a diagnosis, a score, or a verdict.
          </p>
          <p>
            Defrag is the space for working through what is active in the moment. Covenant is the space for users who want faith to stay connected to the work. Both spaces share your Baseline Design, Library, auth, and subscription.
          </p>
          <p>
            The product is designed to be private, direct, and useful. It is not a personality test, a mood tracker, or a substitute for professional support. It does not diagnose, predict, or guarantee outcomes.
          </p>
          <div className="border-t border-white/8 pt-8 space-y-3">
            <p className="text-caption italic">
              The wound is real. So is the choice after it.
            </p>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <div className="space-y-6">
          <Link href="https://app.defrag.app/app/login" className="sovv-button-primary inline-flex py-4 px-10">
            Start Baseline Design
          </Link>
          <p className="text-micro">Free tier · No credit card required</p>
        </div>
      </MotionSection>
    </SiteShell>
  );
}