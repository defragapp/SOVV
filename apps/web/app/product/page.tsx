import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product — Sovereign.os",
  description: "Defrag helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries. Your Baseline Design is the source.",
  openGraph: {
    title: "Product — Sovereign.os",
    description: "Defrag helps you work through the patterns that keep showing up. Your Baseline Design is the source.",
  },
};

const surfaces = [
  {
    label: "Your Baseline Design",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. Every thread is grounded here. Private, never exposed in outputs.",
    accent: "amber" as const,
  },
  {
    label: "The sky over you",
    body: "The current timing layer. It shows what is louder right now — and why the moment may feel bigger than it should.",
    accent: null,
  },
  {
    label: "Active pattern",
    body: "The part of your Baseline Design that is most active in this moment. Defrag helps you understand what is driving the dynamic before it takes over.",
    accent: "amber" as const,
  },
  {
    label: "The Loop",
    body: "The repeating pattern that starts when pressure rises. What happened matters. What repeats matters more. Defrag shows where it begins so you can choose a different response.",
    accent: null,
  },
  {
    label: "The Twist",
    body: "Where a real strength bends under pressure. Some pain becomes a role. Some roles can be put down. Defrag shows where it twists and how to bring it back.",
    accent: "oxblood" as const,
  },
  {
    label: "Best Next Response",
    body: "The thing you can say, do, wait on, or practice that gives the moment the best chance to stay clear. Your next response can change the pattern.",
    accent: "amber" as const,
  },
  {
    label: "Your Story",
    body: "A saved record of what was active, what the loop was, and what response brought you back to center. Save what you learn before the moment disappears.",
    accent: null,
  },
  {
    label: "Invite Privately",
    body: "When both sides matter, invite privately. Defrag can work with your side of this. To compare both Baseline Designs, invite them privately — with consent, not assumption.",
    accent: null,
  },
];

const accentClass = {
  amber: "border-l-2 border-[#C8922A] pl-4",
  oxblood: "border-l-2 border-[#7A2020] pl-4",
};

export default function ProductPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Product"
        title="What repeats matters more than what happened."
        body="Defrag helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries. Your Baseline Design is the source."
      />

      {/* Surfaces */}
      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-0">
            {surfaces.map((s, i) => (
              <div
                key={s.label}
                className={`flex gap-8 py-10 ${i < surfaces.length - 1 ? "border-b border-white/8" : ""}`}
              >
                <div className="shrink-0 w-6 mt-1">
                  <span className="block h-1.5 w-1.5 bg-[#F6F5F3]/25" />
                </div>
                <div className={s.accent ? accentClass[s.accent] : ""}>
                  <h3 className="text-sm font-light text-[#F6F5F3]/80 mb-2">{s.label}</h3>
                  <p className="text-caption text-xs leading-7">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Defrag section */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3">
            <span className="space-badge-amber">Defrag space</span>
            <h2 className="text-headline mt-3">The relational intelligence space.</h2>
            <p className="text-body">
              Defrag helps you work through the moment without losing the larger pattern. Use it for messages, conflict, grief, family roles, boundaries, parenting, and team dynamics.
            </p>
          </div>
          <div className="space-y-4 text-body text-sm">
            <p>
              Conflict often makes one explanation feel obvious. They hate me. They do not care. They are avoiding me. They are trying to control me.
            </p>
            <p>
              Defrag helps show what else may be true. Maybe they shut down. Maybe they need more time. Maybe pushing makes them pull away. Maybe their loop is active too.
            </p>
            <p className="text-[#F6F5F3]/30">
              The goal is not to excuse anyone. The goal is to see the pattern clearly enough to choose a better response.
            </p>
          </div>
        </div>
      </MotionSection>

      {/* Covenant section */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3">
            <span className="space-badge-oxblood">Covenant space</span>
            <h2 className="text-headline mt-3">Faith-context reflection.</h2>
            <p className="text-body">
              Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through. For users who want faith connected to repair — without becoming vague, performative, or certain where certainty does not belong.
            </p>
          </div>
        </div>
      </MotionSection>

      {/* CTA */}
      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-[#F6F5F3]/35 text-sm font-light">
            Not therapy. Not diagnosis. Not generic advice.
          </p>
          <h2 className="text-headline">Start with your Baseline Design.</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="sovv-button-primary inline-flex py-4 px-10">
              Start Baseline Design
            </Link>
            <Link href="https://app.defrag.app/apps/defrag" className="sovv-button inline-flex py-4 px-10">
              Enter Defrag space
            </Link>
          </div>
        </div>
      </MotionSection>
    </SiteShell>
  );
}