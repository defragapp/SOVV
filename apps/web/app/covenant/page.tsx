import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through. Faith-context reflection inside Sovereign.os.",
};

const points = [
  {
    title: "Structured, not sentimental",
    body: "Covenant gives spiritual reflection a structured place inside Sovereign.os. It translates the moment into reflection, repair, and a grounded next step — without preaching, certainty, or performance.",
  },
  {
    title: "Faith and inner work, connected",
    body: "Covenant is built for people who want their inner work, relationships, and faith to stay connected. It helps you bring discernment into what you are walking through without turning the platform into a sermon.",
  },
  {
    title: "Private by design",
    body: "Covenant uses the same private space model as Defrag. Covenant Briefs save to your Sovereign.os Library — private, organized, and yours.",
  },
  {
    title: "User-initiated, not default",
    body: "Covenant only appears when you choose it. It is not the default voice of the platform. Defrag remains the primary relational intelligence space.",
  },
];

const useCases = [
  "A relationship you are trying to repair",
  "A grief you are carrying",
  "A decision that involves your values",
  "A pattern you keep returning to",
  "A moment where faith and relationships intersect",
  "A boundary you are trying to hold with integrity",
];

export default function CovenantPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Covenant space"
        title="Faith-context reflection for what you are walking through."
        body="Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through — without turning the platform into performance or certainty."
      />

      {/* What Covenant does */}
      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {points.map((point, i) => (
              <div
                key={point.title}
                className={`border border-white/8 p-8 space-y-3 ${
                  i % 2 === 1 ? "md:border-l-0" : ""
                } ${i >= 2 ? "border-t-0" : ""}`}
              >
                <h2 className="text-sm font-light text-[#F6F5F3]/80 leading-snug">{point.title}</h2>
                <p className="text-caption text-xs leading-7">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Use cases */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-3">
            <span className="meta-label">When to use Covenant</span>
            <h2 className="text-headline">For the moments where faith and life intersect.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {useCases.map((uc) => (
              <div key={uc} className="flex items-start gap-3 py-3 border-b border-white/6">
                <div className="mt-2 h-px w-4 bg-[#7A2020]/50 shrink-0" />
                <span className="text-caption text-sm">{uc}</span>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Relationship to Defrag */}
      <MotionSection className="border-t border-white/8 px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="meta-label">Inside Sovereign.os</span>
          <h2 className="text-headline">Covenant and Defrag share everything.</h2>
          <p className="text-body">
            Covenant and Defrag are spaces inside Sovereign.os. They share your Baseline Design, Library, auth, and subscription. A Covenant Brief and a Defrag result both save to the same Sovereign.os Library. You do not need a separate account, subscription, or Baseline Design for Covenant.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-8">
            {[
              { label: "Shared", items: ["Baseline Design", "Library", "Auth", "Subscription"] },
              { label: "Defrag saves", items: ["Relational results", "Best Next Responses", "Patterns", "Watch It"] },
              { label: "Covenant saves", items: ["Covenant Briefs", "Reflection prompts", "Story connections", "Grounded steps"] },
            ].map((col, i) => (
              <div key={col.label} className={`border border-white/8 p-6 space-y-3 ${i > 0 ? "border-l-0" : ""}`}>
                <p className="text-label">{col.label}</p>
                {col.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="h-px w-3 bg-[#F6F5F3]/15 shrink-0" />
                    <span className="text-caption text-xs">{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* CTA */}
      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <div className="mx-auto max-w-xl space-y-6">
          <span className="space-badge-oxblood mx-auto">Covenant space</span>
          <h2 className="text-headline mt-4">Available on Pro.</h2>
          <p className="text-body">
            Covenant is included in the Sovereign.os Pro plan alongside Defrag. One subscription. Both spaces. Your Baseline Design and Library shared across everything.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="https://app.defrag.app/apps/covenant" className="sovv-button py-4 px-8">
              Enter Covenant space
            </Link>
            <Link href="/pricing" className="sovv-button-ghost py-4">
              View pricing →
            </Link>
          </div>
        </div>
      </MotionSection>
    </SiteShell>
  );
}