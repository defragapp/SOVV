import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import Link from "next/link";

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title="Built for the moments that matter."
        body="DEFRAG exists because most tools built to help people understand themselves are either too abstract, too clinical, or too slow."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-10 text-base leading-8 text-white/50">
          <p>
            DEFRAG is a personal and relational clarity platform. It is built on the belief
            that most confusion — in relationships, in decisions, in difficult conversations —
            comes not from a lack of intelligence but from a lack of a clear map.
          </p>
          <p>
            Most people are smart enough to navigate their lives well. What they lack is
            a way to see the structure beneath the moment — the pattern that is shaping
            what is happening right now, before it becomes a regret.
          </p>
          <p>
            DEFRAG is that map. It is not therapy. It is not a personality test. It is not
            a mood tracker. It is a clarity layer — designed to help you understand what
            is actually happening so you can respond with more precision and less regret.
          </p>
          <blockquote className="border-l-2 border-white/15 pl-6 text-white/70 italic text-lg">
            &ldquo;The shift that makes your whole system go: Oh… damn. I didn&apos;t see it
            like that before. But I feel it. So I know it&apos;s true.&rdquo;
          </blockquote>
          <p>
            That is what DEFRAG is built to produce. Not insight for its own sake.
            Insight that lands — and changes what you do next.
          </p>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <Link
          href="https://app.defrag.app/login"
          className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
        >
          Enter Platform
        </Link>
      </MotionSection>
    </SiteShell>
  );
}