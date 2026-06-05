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
        body="DEFRAG helps people understand repeating patterns without turning the product into therapy, diagnosis, or generic advice."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-8 text-base leading-8 text-white/50">
          <p>
            DEFRAG is a personal and relational clarity platform. It helps you see the structure beneath a difficult moment so you can respond with more precision.
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
          Start Your Baseline
        </Link>
      </MotionSection>
    </SiteShell>
  );
}