import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import Link from "next/link";

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title="Built for real moments."
        body="Defrag helps people understand repeating patterns without turning the product into therapy, diagnosis, or generic advice."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-8 text-base leading-8 text-white/50">
          <p>
            Sovereign.os is a private platform for relational intelligence. Defrag is the space inside it for working through what is active right now — the pattern, the loop, the response that gives the moment a better chance.
          </p>
          <p>
            Most people do not need more noise. They need a cleaner way to understand what is active, what is repeating, and what response is most likely to keep things grounded.
          </p>
          <p>
            The product is designed to be private, direct, and useful. It is not a personality test, a mood tracker, or a substitute for professional support.
          </p>
          <p>
            The goal is simple: show the pattern clearly enough that the next move is easier to make.
          </p>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <Link
          href="https://app.defrag.app/login"
          className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
        >
          Start Your Baseline Design
        </Link>
      </MotionSection>
    </SiteShell>
  );
}