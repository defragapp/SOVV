import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FadeUp } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through. Faith-context reflection inside Sovereign.os.",
};

const points = [
  {
    title: "Grounded discernment, not certainty.",
    body: "Covenant gives faith-context reflection a structured place in the work. It translates the moment into reflection, repair, and a grounded next step — without preaching or spiritual shortcuts.",
  },
  {
    title: "Faith and repair, connected.",
    body: "For users who want faith connected to repair, Covenant helps turn the moment toward reflection and responsibility. It keeps faith and relationships connected without becoming vague or performative.",
  },
  {
    title: "Private by design.",
    body: "Covenant uses the same private space model as Defrag. Covenant Briefs save to your Sovereign.os Library — private, organized, and yours.",
  },
];

const useCases = [
  "A relationship you are trying to repair",
  "A grief you are carrying",
  "A decision that involves your values",
  "A pattern you keep returning to",
  "A boundary you are trying to hold with integrity",
];

export default function CovenantPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Covenant Space"
        title="Faith, reflection, responsibility, and grounded discernment."
        body="Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through."
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="https://app.defrag.app/apps/covenant" className="btn-primary">
            Explore Covenant
          </Link>
          <Link href="/pricing" className="btn-ghost">
            View Pro Requirements
          </Link>
        </div>
      </PageHero>

      <MotionSection className="section-gap container-narrow">
        <FadeUp>
          <div className="text-center mb-16 space-y-6">
             <h2 className="text-headline">Not as certainty. Not as performance. Not as a spiritual shortcut.</h2>
             <p className="text-body text-foreground-muted">
                Covenant is for the user who wants faith to stay connected to the work. It helps bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
             </p>
          </div>
        </FadeUp>
        <div className="space-y-12">
          {points.map((pt, i) => (
            <FadeUp key={i} delay={0.1 * i}>
              <div className="flex flex-col md:flex-row gap-6 items-start border-t border-border pt-12">
                <div className="w-full md:w-1/3">
                  <h3 className="text-title">{pt.title}</h3>
                </div>
                <div className="w-full md:w-2/3">
                  <p className="text-body text-foreground-muted">{pt.body}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="section-gap border-y border-border bg-surface">
        <div className="container-platform max-w-4xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-headline mb-6">When to use Covenant</h2>
              <p className="text-body text-foreground-muted">
                Covenant is a space to pause and seek context before you react.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((uc, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <Card className="h-full">
                   <p className="text-body-sm text-foreground">{uc}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section-gap bg-hero-glow">
        <div className="container-platform text-center max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8">
              Keep faith and repair connected.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.defrag.app/apps/covenant" className="btn-primary">
                Enter Covenant
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>
    </SiteShell>
  );
}
