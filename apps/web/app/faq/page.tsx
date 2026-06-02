import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { faqItems } from "@/data/marketing";
import Link from "next/link";

export default function FaqPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="FAQ"
        title="Common questions."
        body="Everything you need to know about DEFRAG."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <FaqAccordion items={faqItems} />

          <div className="mt-16 border-t border-white/8 pt-16 text-center">
            <p className="text-sm text-white/35 mb-6">Still have questions?</p>
            <Link
              href="https://app.defrag.app/login"
              className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
            >
              Try It Free
            </Link>
          </div>
        </div>
      </MotionSection>
    </SiteShell>
  );
}