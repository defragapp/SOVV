import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

export default function TermsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Terms"
        title="Terms of Service"
        body="By using DEFRAG, you agree to these terms."
      />

      <MotionSection className="px-6 py-24">
        <div className="mx-auto max-w-2xl space-y-10 text-sm leading-8 text-white/50">
          {[
            {
              title: "Use of service",
              body: "DEFRAG is provided for personal use. You may not use DEFRAG for any unlawful purpose or in any way that could harm others. You are responsible for maintaining the confidentiality of your account credentials.",
            },
            {
              title: "Not a medical service",
              body: "DEFRAG is not a medical, therapeutic, or diagnostic service. It is not a substitute for professional mental health care. If you are in crisis, please contact a qualified professional or emergency services.",
            },
            {
              title: "Intellectual property",
              body: "The DEFRAG platform, including its design, code, and content, is owned by DEFRAG and protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the platform without permission.",
            },
            {
              title: "Subscription and billing",
              body: "Pro subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.",
            },
            {
              title: "Limitation of liability",
              body: "DEFRAG is provided as-is. We make no warranties about the accuracy or completeness of the clarity provided. We are not liable for any decisions you make based on DEFRAG's output.",
            },
            {
              title: "Changes to terms",
              body: "We may update these terms from time to time. Continued use of DEFRAG after changes constitutes acceptance of the new terms.",
            },
            {
              title: "Contact",
              body: "For terms questions, contact us at legal@defrag.app.",
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