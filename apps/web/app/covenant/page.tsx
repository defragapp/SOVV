import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "Optional faith-context reflection space inside Sovereign.os. User-initiated, plain-language, and private by design.",
};

const points = [
  {
    title: "Optional",
    body: "Covenant only appears when a user chooses that context. It is not the default voice of the platform.",
  },
  {
    title: "Plain language",
    body: "The goal is grounded reflection, not preaching, diagnosis, prophecy, or religious authority.",
  },
  {
    title: "Private by design",
    body: "Covenant uses the same private space model as Defrag and saves back into the user's Sovereign.os Library.",
  },
  {
    title: "User-led",
    body: "The user decides what to bring in, what to save, and what to ignore. The system should stay clear and restrained.",
  },
];

export default function CovenantPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Covenant"
        title="Optional faith-context reflection space."
        body="For users who want to explore a moment through a faith-based lens without turning the product into preaching or pressure."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {points.map((point) => (
            <div key={point.title} className="border border-white/8 p-6">
              <h2 className="text-base font-medium text-white mb-3">{point.title}</h2>
              <p className="text-sm leading-7 text-white/45">{point.body}</p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="border-t border-white/8 px-6 py-24 text-center">
        <p className="mx-auto max-w-2xl text-sm leading-7 text-white/45">
          Covenant belongs inside Sovereign.os alongside Defrag. It should feel like a private reflection space the user chooses, not a separate brand that talks over them.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="https://app.defrag.app/apps/covenant"
            className="inline-block border border-white/20 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Open Covenant space
          </Link>
          <Link
            href="/product"
            className="inline-block border border-white/10 px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          >
            View Product
          </Link>
        </div>
      </MotionSection>
    </SiteShell>
  );
}