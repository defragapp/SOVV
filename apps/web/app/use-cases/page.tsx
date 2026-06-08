import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { FadeUp } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Use Cases — Sovereign.os",
  description: "Work through the message, the family role, the boundary, the grief, and the relationship dynamic you can feel but cannot fully name.",
};

const cases = [
  {
    title: "Before you send the message",
    body: "You have written it three times. Something still feels off. Defrag helps you understand what is active in the moment — and whether sending it will get you what you actually want.",
    tag: "Message",
  },
  {
    title: "When a conversation keeps repeating",
    body: "The same argument. The same dynamic. The same outcome. What happened matters. What repeats matters more. Defrag shows where the loop starts so you can choose a different response.",
    tag: "Relationship",
  },
  {
    title: "When someone pulls away",
    body: "They went quiet. You do not know why. Defrag helps you see what may be active in the dynamic — without assuming the worst or excusing the pattern.",
    tag: "Relationship",
  },
  {
    title: "When a family loop keeps running",
    body: "The same tension at every gathering. The same roles. The same pressure. Some pain becomes a role. Some roles can be put down. Defrag helps you see the structure beneath it.",
    tag: "Family",
  },
  {
    title: "When you need to hold a boundary",
    body: "A boundary is not a punishment. It is a return to alignment. Defrag helps you understand what the boundary is protecting and how to hold it without reacting.",
    tag: "Boundary",
  },
  {
    title: "When grief changes how everything lands",
    body: "Grief changes how everything lands. The same words hit differently. You are not overreacting, you are grieving. Sovereign.os helps you see where the pressure is coming from.",
    tag: "Grief",
  },
];

export default function UseCasesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Use Cases"
        title="Stop carrying what keeps repeating."
        body="Work through the message, the family role, the boundary, the grief, and the relationship dynamic you can feel but cannot fully name."
      />

      <MotionSection className="section-gap container-platform">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <FadeUp key={i} delay={i * 0.1} className="h-full">
               <Card className="h-full">
                 <span className="space-badge mb-4">{c.tag}</span>
                 <h3 className="text-title mb-4">{c.title}</h3>
                 <p className="text-body-sm text-foreground-muted">{c.body}</p>
               </Card>
            </FadeUp>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="section-gap border-t border-border bg-hero-glow">
        <div className="container-platform text-center max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8">
              Healing isn’t optional.<br/>Holding the pain is.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.defrag.app/app/login" className="btn-primary">
                Enter Sovereign.os
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>
    </SiteShell>
  );
}
