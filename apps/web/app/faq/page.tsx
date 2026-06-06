import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { faqItems } from "@/data/marketing";

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
        </div>
      </MotionSection>
    </SiteShell>
  );
}
