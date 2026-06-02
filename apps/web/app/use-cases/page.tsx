import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { Card } from "@/components/marketing/card";
import Link from "next/link";

const cases = [
  {
    title: "Before you send the message",
    body: "You've written it three times. Something still feels off. DEFRAG helps you see what's actually driving the impulse — and whether sending it will get you what you actually want.",
  },
  {
    title: "When something feels off",
    body: "You can't name it. The conversation seemed fine but you left feeling unsettled. DEFRAG helps you locate the source of the friction before it becomes a pattern.",
  },
  {
    title: "When a conversation keeps repeating",
    body: "The same argument. The same dynamic. The same outcome. DEFRAG maps the loop so you can see where a different move was possible.",
  },
  {
    title: "When timing matters as much as what you say",
    body: "Some moments are not about the words. DEFRAG helps you read what's most active right now — in you and in the other person — so you can choose the right moment.",
  },
  {
    title: "When you want to be heard",
    body: "You've said it clearly. They still don't get it. DEFRAG helps you understand what may be blocking reception — and how to reach through it.",
  },
  {
    title: "When you want to move with more self-possession",
    body: "Not reactive. Not shut down. Present, grounded, and clear. DEFRAG helps you find that state — and return to it when you drift.",
  },
];

export default function UseCasesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Use Cases"
        title="Built for the moments that matter."
        body="DEFRAG is not for abstract self-improvement. It is for the specific, real, sometimes difficult moments of actual life."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((c, i) => (
              <Card key={c.title} glow={i === 2}>
                <h3 className="text-base font-light text-white mb-4 leading-snug">{c.title}</h3>
                <p className="text-sm leading-7 text-white/40">{c.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-6">
          Any of these sound familiar?
        </p>
        <Link
          href="https://app.defrag.app/login"
          className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
        >
          Start Free
        </Link>
      </MotionSection>
    </SiteShell>
  );
}