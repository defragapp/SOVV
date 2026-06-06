import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

const sections = [
  {
    title: "Private by design",
    body: "Sovereign.os is designed to be private by design. We store only the information required to provide the service and avoid exposing sensitive internal data in outputs.",
  },
  {
    title: "What we collect",
    body: "We may collect account information (email, login), Baseline Design data (date, time, and place of birth), conversation inputs, saved notebook entries, and interaction metadata. We do not expose this data publicly.",
  },
  {
    title: "What we do not expose",
    body: "Sovereign.os does not expose raw Baseline Design computation outputs, underlying symbolic or mapping systems, system prompts or internal instructions, or private notes or unapproved relational data.",
  },
  {
    title: "How your data is used",
    body: "Your data is used to generate Baseline Design-aware responses, maintain continuity in your space, and improve pattern recognition over time. We do not sell personal data.",
  },
  {
    title: "Source transparency",
    body: "Defrag may show a summary of what influenced an answer — such as your Baseline Design, the sky over you, selected people, notebook context, or prior patterns. This summary does not expose raw system data or proprietary logic.",
  },
  {
    title: "Your control",
    body: "You can choose what to enter, decide which people to include, ignore any suggestion, and request account review or deletion at any time. Your judgment always comes first.",
  },
  {
    title: "Data security",
    body: "Your data is stored in Cloudflare's infrastructure with encryption at rest and in transit. Session tokens are HttpOnly, Secure, and SameSite=Lax.",
  },
  {
    title: "Your rights",
    body: "You can request deletion of your account and all associated data at any time by contacting us. We will process deletion requests within 30 days.",
  },
  {
    title: "Contact",
    body: "For privacy questions, contact us at info@defrag.app.",
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Privacy"
        title="Your data. Your clarity."
        body="Private by design. Here is what we collect, why, and how we protect it."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-10 text-sm leading-8 text-white/50">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-light text-white mb-3">{section.title}</h3>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </MotionSection>
    </SiteShell>
  );
}