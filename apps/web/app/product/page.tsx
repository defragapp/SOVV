import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { SectionHeader } from "@/components/marketing/section-header";
import Link from "next/link";

const surfaces = [
  {
    label: "Your Baseline",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. Every thread is grounded here.",
  },
  {
    label: "The sky over you",
    body: "The current timing layer. It shows what is louder right now — and why the moment may feel bigger than it should.",
  },
  {
    label: "What got lit up",
    body: "The part of your baseline that is active in this moment. DEFRAG shows it clearly so you can see the pattern before it takes over.",
  },
  {
    label: "The Loop",
    body: "The repeating pattern that starts when pressure rises. DEFRAG shows where it begins so you can choose a different response.",
  },
  {
    label: "The Twist",
    body: "Where a real strength bends under pressure. DEFRAG shows where it twists and how to bring it back into its clean form.",
  },
  {
    label: "Your Strengths",
    body: "The clean version of what pressure distorts. DEFRAG helps you see the strength underneath the pattern.",
  },
  {
    label: "Best Next Response",
    body: "The thing you can say, do, wait on, or practice that gives the moment the best chance to stay clear.",
  },
  {
    label: "Your Story",
    body: "A saved record of what got lit up, what the loop was, and what response brought you back to center. The AI uses it to keep the thread grounded over time.",
  },
];

export default function ProductPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Product"
        title="A baseline-aware AI workspace with a living notebook."
        body="Sovereign.os keeps the thread grounded in your baseline, the sky over you, and the people you choose. DEFRAG shows what got lit up, where the loop is forming, and what brings you back to center."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-0">
            {surfaces.map((s, i) => (
              <div
                key={s.label}
                className={`flex gap-8 py-10 ${i < surfaces.length - 1 ? "border-b border-white/8" : ""}`}
              >
                <div className="shrink-0 w-6 mt-1">
                  <span className="block h-1.5 w-1.5 bg-white/30" />
                </div>
                <div>
                  <h3 className="text-base font-light text-white mb-2">{s.label}</h3>
                  <p className="text-sm leading-7 text-white/45">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="DEFRAG"
            title="The relational intelligence layer."
            body="DEFRAG shows what got lit up between people. It helps you see the loop, the twist, the strength underneath, and the response that brings the moment back to center."
          />
          <div className="mt-12 space-y-6 text-sm leading-7 text-white/45">
            <p>
              Conflict often makes one explanation feel obvious. They hate me. They do not care. They are avoiding me. They are trying to control me.
            </p>
            <p>
              DEFRAG helps show what else may be true. Maybe they shut down. Maybe they need more time. Maybe pushing makes them pull away. Maybe their loop is active too.
            </p>
            <p className="text-white/25">
              The goal is not to excuse anyone. The goal is to see the pattern clearly enough to choose a better response.
            </p>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-white/35 text-sm font-light mb-8">
            Not therapy. Not diagnosis. Not generic advice.
          </p>
          <Link
            href="https://app.defrag.app/login"
            className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Start Your Baseline
          </Link>
        </div>
      </MotionSection>
    </SiteShell>
  );
}