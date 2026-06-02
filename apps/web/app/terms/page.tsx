import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

const sections = [
  {
    title: "What this service is",
    body: "Sovereign.os / DEFRAG is a baseline-aware AI workspace designed to help users understand patterns in personal and relational situations. It provides structured reflection and response guidance based on user-provided information and system-generated interpretations. The service is intended for informational and reflective use only.",
  },
  {
    title: "Not a professional service",
    body: "DEFRAG does not provide therapy, medical advice, legal advice, or crisis support. The platform does not diagnose individuals or predict behavior. All outputs are generated based on available data and are intended to support user perspective, not replace professional judgment. If you are in crisis, please contact a qualified professional or emergency services.",
  },
  {
    title: "No guarantees",
    body: "DEFRAG does not guarantee outcomes, accuracy, or the behavior of other individuals. Users are responsible for their own decisions, actions, and interpretations of the platform's output.",
  },
  {
    title: "User responsibility",
    body: "You are responsible for the information you provide, the conversations you engage in outside the platform, and how you interpret and use any outputs. You should not rely on DEFRAG for urgent, high-risk, or safety-critical decisions.",
  },
  {
    title: "Relational data and other people",
    body: "When interacting with or referencing another individual within the platform, you must have the right to input that information and must not misuse the system to infer private thoughts or intentions. DEFRAG does not claim to know another person's internal state. All relational outputs are pattern-based interpretations, not statements of fact.",
  },
  {
    title: "Intellectual property",
    body: "The underlying systems, baseline computation methods, scoring logic, prompts, and data transformations used by DEFRAG are proprietary. Users may not attempt to reverse engineer system outputs, scrape or automate extraction of responses, or replicate system behavior externally. The platform intentionally provides summarized outputs and does not expose internal computation details.",
  },
  {
    title: "Subscription and billing",
    body: "Pro subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.",
  },
  {
    title: "Limitation of liability",
    body: "DEFRAG is provided as-is. We make no warranties about the accuracy or completeness of outputs. We are not liable for any decisions you make based on the platform's output.",
  },
  {
    title: "Changes to terms",
    body: "We may update these terms from time to time. Continued use of DEFRAG after changes constitutes acceptance of the updated terms.",
  },
  {
    title: "Contact",
    body: "For terms questions, contact us at legal@defrag.app.",
  },
];

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