import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { Card } from "@/components/marketing/card";
import { lenses } from "@/data/marketing";
import Link from "next/link";

export default function ProductPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Product"
        title="Three lenses. One shift."
        body="DEFRAG gives you three ways to see what's actually happening — in yourself, in the moment, and between you and others."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {lenses.map((lens, i) => (
              <Card key={lens.title} glow={i === 1}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4">0{i + 1}</p>
                <h3 className="text-2xl font-light text-white mb-4">{lens.title}</h3>
                <p className="text-sm leading-7 text-white/45 mb-4">{lens.summary}</p>
                <p className="text-xs text-white/25 italic mb-8">{lens.useCase}</p>
                <Link
                  href="https://app.defrag.app/login"
                  className="font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
                >
                  {lens.cta} →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-light text-white mb-6">Built for real life.</h2>
          <p className="text-base leading-relaxed text-white/45 mb-10">
            DEFRAG is not a journaling app. It is not a mood tracker. It is not therapy.
            It is a clarity layer — designed to help you understand what is actually happening
            so you can respond with more precision and less regret.
          </p>
          <Link
            href="https://app.defrag.app/login"
            className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Enter Platform
          </Link>
        </div>
      </MotionSection>
    </SiteShell>
  );
}