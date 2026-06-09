import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { MotionSection } from "@/components/marketing/motion-section";

export const metadata: Metadata = {
  title: "Contact — Sovereign.os",
  description: "For product questions, support, or account help. Reach us at info@defrag.app.",
};

const SUPPORT_URL = process.env.STRIPE_SUPPORT_LINK_URL || "mailto:info@defrag.app";

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Get in touch."
        body="For product questions, support, or account help."
      />

      <MotionSection className="section-gap container-narrow">
        <div className="mx-auto max-w-xl space-y-12">

          {/* Primary contact */}
          <div className="space-y-4">
            <p className="text-label">Primary contact</p>
            <a
              href="mailto:info@defrag.app"
              className="block text-title text-foreground hover:text-white transition-colors"
            >
              info@defrag.app
            </a>
            <p className="text-body-sm text-foreground-muted">
              This is the public contact address for Sovereign.os. For product questions, support, account help, privacy requests, and general inquiries.
            </p>
          </div>

          <div className="divider" />

          {/* What to include */}
          <div className="space-y-4">
            <p className="text-label">What to include</p>
            <div className="space-y-3">
              {[
                "Your account email",
                "What you were trying to do",
                "What happened instead",
                "Any error message you saw",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-px w-3 bg-border shrink-0" />
                  <span className="text-body-sm text-foreground-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Privacy */}
          <div className="space-y-3">
            <p className="text-label">Privacy and data requests</p>
            <p className="text-body-sm text-foreground-muted">
              To request deletion of your account and all associated data, email info@defrag.app. We process deletion requests within 30 days.
            </p>
          </div>

          {/* Support link */}
          {SUPPORT_URL && (
            <div className="pt-4">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-body-sm text-foreground hover:text-white transition-colors underline underline-offset-4"
              >
                Support Defrag development →
              </a>
            </div>
          )}
        </div>
      </MotionSection>
    </SiteShell>
  );
}