import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";
import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Set your Baseline Design",
    body: "Enter your date, time, and place of birth. This becomes the private source — how you tend to process, respond, connect, protect, communicate, and return to center. The AI uses it to keep every thread grounded in who you actually are, not who the moment is making you.",
  },
  {
    num: "02",
    title: "Work through what is active",
    body: "Tell Defrag what is happening. A message you haven't sent. A conversation that keeps repeating. A family role that still runs. A boundary you can't hold. Defrag helps surface the pattern underneath — not a verdict, a way through.",
  },
  {
    num: "03",
    title: "Find the response that changes the pattern",
    body: "See the Best Next Response. Understand what is driving the dynamic. Practice the response before you use it. Some pain becomes a role. Some roles can be put down. Defrag shows you where.",
  },
  {
    num: "04",
    title: "Save what you learn",
    body: "Save the result, the response, or the reflection to your Sovereign.os Library before the pressure of the moment erases it. The AI uses your Library to keep future threads grounded — not starting over every time.",
  },
];

const truthLines = [
  "What happened matters. What repeats matters more.",
  "Not every reaction is the truth.",
  "The conversation is not just about the words.",
  "A boundary is not a punishment. It is a return to alignment.",
  "You do not need a verdict. You need a way through.",
  "Save what you learn before the moment disappears.",
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="How It Works"
        title="The pattern keeps moving until you see it."
        body="Defrag is designed to be used in the moment — not after the fact, not in a therapy session. Right now, when it matters."
      />

      {/* Steps */}
      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex gap-8 py-10 ${i < steps.length - 1 ? "border-b border-white/8" : ""}`}
              >
                <div className="shrink-0">
                  <span className="text-micro">{step.num}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-light text-[#F6F5F3]/85 leading-snug">{step.title}</h3>
                  <p className="text-caption text-sm leading-7">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Truth lines */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-3">
            <span className="meta-label">What Defrag is built on</span>
            <h2 className="text-headline">Sharp truths about how patterns work.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {truthLines.map((line, i) => (
              <div
                key={line}
                className={`py-6 px-4 border-b border-white/8 ${i % 2 === 1 ? "md:border-l md:border-l-white/8" : ""}`}
              >
                <p className="text-sm font-light text-[#F6F5F3]/65 leading-7 italic">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* CTA */}
      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <div className="space-y-6 max-w-xl mx-auto">
          <h2 className="text-headline">Start with your Baseline Design.</h2>
          <p className="text-body">
            You don't need to understand the whole system. You just need one moment you want to see more clearly.
          </p>
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