import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { SectionHeader } from "@/components/marketing/section-header";
import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Set your Baseline",
    body: "Tell DEFRAG how you naturally work. Your patterns, your pressure points, what helps you return to clarity. This becomes the foundation everything else is read against.",
  },
  {
    num: "02",
    title: "Describe the moment",
    body: "Tell DEFRAG what's happening — a conversation, a decision, a dynamic that keeps repeating. No jargon required. Plain language is enough.",
  },
  {
    num: "03",
    title: "Receive the map",
    body: "DEFRAG shows you the structure beneath the surface. What triggered it. What escalated it. What each person may have been defending.",
  },
  {
    num: "04",
    title: "Find the shift",
    body: "See the exact moment where a different response was possible — and what that response could have looked like.",
  },
  {
    num: "05",
    title: "Make your move",
    body: "Take a clean step forward. Concrete. Specific. Grounded in what's actually happening rather than what you feared was happening.",
  },
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="How It Works"
        title="Five steps to clarity."
        body="DEFRAG is designed to be used in the moment — not after the fact, not in a therapy session, not in a journal. Right now, when it matters."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex gap-8 py-10 ${i < steps.length - 1 ? "border-b border-white/8" : ""}`}
              >
                <div className="shrink-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/20">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-xl font-light text-white mb-3">{step.title}</h3>
                  <p className="text-sm leading-7 text-white/45">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <SectionHeader
          eyebrow="Ready?"
          title="Start with one moment."
          body="You don't need to understand the whole system. You just need one moment you want to see more clearly."
        />
        <div className="mt-10">
          <Link
            href="https://app.defrag.app/login"
            className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </MotionSection>
    </SiteShell>
  );
}