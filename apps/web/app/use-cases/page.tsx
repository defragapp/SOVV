import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { Card } from "@/components/marketing/card";
import Link from "next/link";

const cases = [
  {
    title: "Before you send the message",
    body: "You have written it three times. Something still feels off. Defrag helps you see what got lit up — and whether sending it will get you what you actually want.",
  },
  {
    title: "When a conversation keeps repeating",
    body: "The same argument. The same dynamic. The same outcome. Defrag shows where the loop starts so you can see where a different response was possible.",
  },
  {
    title: "When someone pulls away",
    body: "They went quiet. You do not know why. Defrag helps you see what may be active in the dynamic — without assuming the worst or excusing the pattern.",
  },
  {
    title: "When a family loop keeps running",
    body: "The same tension at every gathering. The same roles. The same pressure. Defrag helps you see the structure beneath it so you can choose a different response.",
  },
  {
    title: "When you need to understand your part",
    body: "Not to blame yourself. To see clearly. Defrag shows what got lit up in you — and what that means for how the moment landed on the other person.",
  },
  {
    title: "When you want to practice a response first",
    body: "Before the conversation happens. Defrag helps you find the Best Next Response and practice it — so you are not improvising under pressure.",
  },
  {
    title: "When you need to see the other side without losing your own",
    body: "Conflict makes one explanation feel obvious. Defrag helps show what else may be true — without asking you to excuse anyone or abandon your own read.",
  },
];

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
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link
            href="https://app.defrag.app/login"
            className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Start Your Baseline Design
          </Link>
          <Link
            href="/how-it-works"
            className="inline-block border border-white/10 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </MotionSection>
    </SiteShell>
  );
}