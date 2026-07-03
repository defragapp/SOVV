import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-8 border-b border-white/[0.06] last:border-0">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-4">{title}</h2>
      <div className="text-[15px] text-[#a8a29a] leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export function TermsPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-16 bg-[#08070a] border-b border-white/5">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Terms</span>
          </div>
          <h1 className="font-serif text-4xl text-[#f4efe9] leading-[1.1] mb-4">Terms of Service</h1>
          <p className="text-sm text-[#4f4b47]">Last updated: 2024</p>
        </Container>
      </section>
      <section className="w-full py-12 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <Section title="Acceptance">
            <p>By using Sovereign.os, you agree to these terms. If you do not agree, do not use the service.</p>
          </Section>
          <Section title="The service">
            <p>Sovereign.os provides pattern-aware AI tools for personal reflection. It is not a medical device, mental health service, or professional counseling tool. It does not provide diagnoses, predictions, or professional advice.</p>
          </Section>
          <Section title="Not a replacement for professional support">
            <p>Sovereign.os is not a replacement for therapy, crisis services, or professional mental health support. If you are in crisis, please contact a qualified professional or emergency services immediately.</p>
          </Section>
          <Section title="Your account">
            <p>You are responsible for maintaining the security of your account credentials. You must not use Sovereign.os for any unlawful purpose or in ways that could harm others.</p>
          </Section>
          <Section title="Subscriptions and billing">
            <p>Pro subscriptions are billed monthly. You may cancel at any time from your account settings. Refunds are handled on a case-by-case basis — contact info@defrag.app.</p>
          </Section>
          <Section title="Limitation of liability">
            <p>Sovereign.os is provided "as is." We make no warranties about the accuracy or completeness of outputs. To the maximum extent permitted by law, we are not liable for any damages arising from your use of the service.</p>
          </Section>
          <Section title="Contact">
            <p>Questions about these terms: <a href="mailto:info@defrag.app" className="text-[#a8a29a] hover:text-[#f4efe9] transition-colors">info@defrag.app</a></p>
          </Section>
        </Container>
      </section>
    </SiteShell>
  );
}
