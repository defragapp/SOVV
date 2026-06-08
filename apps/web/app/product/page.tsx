import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FadeUp } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product — Sovereign.os",
  description: "Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries. Your Baseline Design is the source.",
  openGraph: {
    title: "Product — Sovereign.os",
    description: "Sovereign.os helps you work through the patterns that keep showing up. Your Baseline Design is the source.",
  },
};

const surfaces = [
  {
    title: "Your Baseline Design",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. Every thread is grounded here. Private, never exposed in outputs.",
    accent: true,
  },
  {
    title: "Defrag",
    body: "For the moment that will not leave you alone. Defrag helps you slow the moment down, separate what happened from what repeated, and find the next response that does not keep feeding the same pattern.",
    accent: false,
  },
  {
    title: "Covenant",
    body: "For the user who wants faith to stay connected to the work. Covenant helps bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.",
    accent: false,
  },
  {
    title: "The Library",
    body: "Your Library keeps what the moment taught you. The response you found. The pattern you finally saw. The boundary that became clear. Save to Sovereign before the moment disappears.",
    accent: true,
  },
  {
    title: "Invite Privately",
    body: "Two people can live through the same conversation and leave with completely different truths. The other side is not always the enemy. Sometimes it is another nervous system, another history, another map. When both sides matter, invite privately.",
    accent: false,
  },
];

export default function ProductPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="The System"
        title="Turn charged conversations into something you can actually work with."
        body="Sovereign.os helps you work through the moments that keep replaying — the message, the conflict, the family role, the grief, the boundary — and save what you learn before the pattern takes over again."
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </div>
      </PageHero>

      <MotionSection className="section-gap container-platform">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <FadeUp>
             <h2 className="text-headline mb-6">You do not need a verdict.<br/>You need a way through.</h2>
             <p className="text-body text-foreground-muted">
                The conversation ended. Your body did not. Some messages do not need a reply yet. They need context. 
                Sovereign.os gives those moments structure — without turning them into a diagnosis, a score, or a verdict.
             </p>
          </FadeUp>
          <div className="space-y-6">
            {surfaces.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                 <Card glow={s.accent} className="h-full">
                    <h3 className="text-title mb-4">{s.title}</h3>
                    <p className="text-body-sm text-foreground-muted">{s.body}</p>
                 </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section-gap border-t border-border bg-hero-glow">
        <div className="container-platform text-center max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8">
              Your next response can change the pattern.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.defrag.app/settings" className="btn-primary">
                Start your Baseline Design
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>
    </SiteShell>
  );
}
