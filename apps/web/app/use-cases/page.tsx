import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import Link from "next/link";

const cases = [
  {
    title: "Before you send the message",
    body: "You have written it three times. Something still feels off. Defrag helps you understand what is active in the moment — and whether sending it will get you what you actually want.",
    tag: "Message",
  },
  {
    title: "When a conversation keeps repeating",
    body: "The same argument. The same dynamic. The same outcome. What happened matters. What repeats matters more. Defrag shows where the loop starts so you can see where a different response was possible.",
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
    title: "When you need to understand your part",
    body: "Not to blame yourself. To see clearly. Not every reaction is the truth. Defrag helps you understand what is active in you — and what that means for how the moment landed on the other person.",
    tag: "Self",
  },
  {
    title: "When you want to practice a response first",
    body: "Before the conversation happens. Your next response can change the pattern. Defrag helps you find the Best Next Response and practice it — so you are not improvising under pressure.",
    tag: "Preparation",
  },
  {
    title: "When you need to hold a boundary",
    body: "A boundary is not a punishment. It is a return to alignment. Defrag helps you understand what the boundary is protecting and how to hold it without losing the relationship.",
    tag: "Boundary",
  },
  {
    title: "When grief is changing how you show up",
    body: "Grief does not stay in one place. It moves into how you respond, what you protect, and what you pull away from. Defrag helps you see where grief is active in the moment.",
    tag: "Grief",
  },
  {
    title: "When both sides matter",
    body: "When both sides matter, invite privately. Defrag can work with your side of this. To compare both Baseline Designs, invite them privately — with consent, not assumption.",
    tag: "Invite Privately",
  },
];

const tagColors: Record<string, string> = {
  Message: "space-badge-amber",
  Relationship: "space-badge",
  Family: "space-badge",
  Self: "space-badge",
  Preparation: "space-badge-amber",
  Boundary: "space-badge-oxblood",
  Grief: "space-badge-oxblood",
  "Invite Privately": "space-badge",
};

export default function UseCasesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Use Cases"
        title="Built for the moments that matter."
        body="Not for abstract self-improvement. For the specific, real, sometimes difficult moments of actual life."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {cases.map((c, i) => (
              <div
                key={c.title}
                className={`border border-white/8 p-8 space-y-4 hover:border-white/16 transition-colors
                  ${i % 3 !== 0 ? "md:border-l-0" : ""}
                  ${i >= 3 ? "border-t-0" : ""}
                `}
              >
                <span className={tagColors[c.tag] || "space-badge"}>{c.tag}</span>
                <h3 className="text-sm font-light text-[#F6F5F3]/80 leading-snug mt-3">{c.title}</h3>
                <p className="text-caption text-xs leading-7">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <div className="space-y-6 max-w-xl mx-auto">
          <p className="text-headline">You do not need a verdict.<br />You need a way through.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="sovv-button-primary inline-flex py-4 px-10">
              Start Baseline Design
            </Link>
            <Link href="/how-it-works" className="sovv-button inline-flex py-4 px-10">
              See how it works
            </Link>
          </div>
        </div>
      </MotionSection>
    </SiteShell>
  );
}