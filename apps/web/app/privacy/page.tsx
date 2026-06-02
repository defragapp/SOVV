import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Privacy"
        title="Your data. Your clarity."
        body="We take privacy seriously. Here is what we collect, why, and how we protect it."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-10 text-sm leading-8 text-white/50">
          {[
            {
              title: "What we collect",
              body: "We collect the information you provide when you create an account (email and password) and the content of your sessions with DEFRAG. We do not collect data from your device beyond what is necessary to operate the service.",
            },
            {
              title: "How we use it",
              body: "Your session data is used to provide the DEFRAG service — to generate clarity, track patterns over time, and improve your experience. We do not sell your data to third parties.",
            },
            {
              title: "Pattern memory",
              body: "DEFRAG Pro includes pattern memory across sessions. This means DEFRAG learns your recurring dynamics over time. This data is stored securely and is only used to improve your personal experience.",
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
              body: "For privacy questions, contact us at privacy@defrag.app.",
            },
          ].map((section) => (
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