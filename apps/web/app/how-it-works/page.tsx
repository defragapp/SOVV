import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import { SectionHeader } from "@/components/marketing/section-header";
import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Start Your Baseline",
    body: "Enter your date, time, and place of birth. This becomes the starting map — how you tend to process, respond, connect, protect, communicate, and return to center. The AI uses it to keep every thread grounded in who you actually are.",
  },
  {
    num: "02",
    title: "Check what is active now",
    body: "The sky over you shows what is louder right now. Your baseline shows how you are built. Together they show what got lit up — the part of you that is most active in this moment.",
  },
  {
    num: "03",
    title: "Ask or select people and layers",
    body: "Tell DEFRAG what is happening. Ask freely. Add another person, a family dynamic, a group, or a team when relevant. The thread stays grounded in your baseline and theirs when permitted.",
  },
  {
    num: "04",
    title: "Turn the answer into something you can use",
    body: "DEFRAG shows what got lit up, where the loop is forming, and the Best Next Response. You can save it, practice it, hear it as audio, watch it as a short scene, or return to it as part of Your Story.",
  },
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="How It Works"
        title="Four steps. One grounded thread."
        body="DEFRAG is designed to be used in the moment — not after the fact, not in a therapy session. Right now, when it matters."
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
          title="Start with your baseline."
          body="You don't need to understand the whole system. You just need one moment you want to see more clearly."
        />
        <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
          <Link
            href="https://app.defrag.app/login"
            className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Start Your Baseline
          </Link>
          <Link
            href="/workspace"
            className="inline-block border border-white/10 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          >
            Go to Workspace
          </Link>
        </div>
      </MotionSection>
    </SiteShell>
  );
}