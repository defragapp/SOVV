import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Get in touch."
        body="For product questions, support, or account help."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="space-y-4">
            <p className="text-base leading-8 text-white/50">
              Reach us at:
            </p>
            <a
              href="mailto:info@defrag.app"
              className="block font-mono text-sm uppercase tracking-widest text-white/80 hover:text-white transition-colors duration-200"
            >
              info@defrag.app
            </a>
          </div>

          <div className="border-t border-white/8 pt-10 space-y-3">
            <p className="text-sm leading-7 text-white/30">
              This is the public contact address for DEFRAG.
            </p>
            <p className="text-sm leading-7 text-white/30">
              Do not send sensitive personal details through email.
            </p>
          </div>
        </div>
      </MotionSection>
    </SiteShell>
  );
}