import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

const principles = [
  {
    num: "01",
    title: "Clarity over comfort",
    body: "Defrag is not designed to make you feel better. It is designed to help you see more clearly. Sometimes those are the same thing. Often they are not.",
  },
  {
    num: "02",
    title: "Structure over story",
    body: "Most confusion comes from being inside the story. Defrag helps you see the structure beneath it — the pattern, the dynamic, the moment where something different was possible.",
  },
  {
    num: "03",
    title: "No diagnosis, no labels",
    body: "Defrag does not tell you what is wrong with you. It helps you understand how you work — and what tends to happen when you are under pressure.",
  },
  {
    num: "04",
    title: "Insight that lands",
    body: "Clarity that only lives in the mind is not clarity. Defrag is designed to produce insight that lands — the kind you recognize as true, not just understand.",
  },
  {
    num: "05",
    title: "Built for real life",
    body: "Not for therapy sessions. Not for journaling. For the moment before you send the message. For the conversation that keeps repeating. For right now.",
  },
  {
    num: "06",
    title: "No jargon",
    body: "Defrag translates complex patterns into plain language. You do not need to understand the systems underneath it. You just need to understand yourself.",
  },
];

export default function PrinciplesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Principles"
        title="What we believe."
        body="The values that shape how Sovereign.os and Defrag are built and how they work."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl divide-y divide-white/8">
          {principles.map((p) => (
            <div key={p.num} className="flex gap-8 py-10">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/20 shrink-0 mt-1">
                {p.num}
              </span>
              <div>
                <h3 className="text-lg font-light text-white mb-3">{p.title}</h3>
                <p className="text-sm leading-7 text-white/45">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </MotionSection>
    </SiteShell>
  );
}