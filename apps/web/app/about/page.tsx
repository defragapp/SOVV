import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Sovereign.os",
  description: "Sovereign.os helps people understand relational dynamics, family patterns, communication, grief, boundaries, and the patterns underneath what is active in the moment.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title="Built for real moments."
        body="Sovereign.os helps people understand the pattern underneath what is active — without turning the product into therapy, diagnosis, or generic advice."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-10 text-body leading-8">
          <p>
            Sovereign.os is a private platform for relational intelligence. Defrag is the space inside it for working through what is active in the moment — the pattern, the loop, the response that gives the moment a better chance.
          </p>
          <p>
            Defrag helps you work through relational dynamics, family dynamics, boundaries, messages, grief, parenting, and team dynamics. Put the moment into context. See the pattern underneath. Find the next response that changes the pattern.
          </p>
          <p>
            Covenant is an optional faith-context reflection space inside Sovereign.os. It helps you bring faith, reflection, and grounded discernment into what you are walking through — without preaching, certainty, or performance.
          </p>
          <p>
            The product is designed to be private, direct, and useful. It is not a personality test, a mood tracker, or a substitute for professional support. It does not diagnose, predict, or guarantee outcomes.
          </p>
          <div className="border-t border-white/8 pt-8 space-y-4">
            <p className="text-caption">
              Your Baseline Design is the source. Sovereign.os is where the work becomes yours.
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