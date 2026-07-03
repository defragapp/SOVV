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

export function PrivacyPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-16 bg-[#08070a] border-b border-white/5">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Privacy</span>
          </div>
          <h1 className="font-serif text-4xl text-[#f4efe9] leading-[1.1] mb-4">Privacy Policy</h1>
          <p className="text-sm text-[#4f4b47]">Last updated: 2024</p>
        </Container>
      </section>
      <section className="w-full py-12 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <Section title="What we collect">
            <p>We collect the email address and password you provide when creating an account. We collect your Baseline Design (date, time, and place of birth) when you enter it. We collect the text of sessions you initiate.</p>
          </Section>
          <Section title="What we do not do">
            <p>We do not sell your data. We do not use your sessions to train AI models. We do not expose your Baseline Design in any output. We do not share personal information with third parties for advertising purposes.</p>
          </Section>
          <Section title="Data storage and security">
            <p>Your data is encrypted in transit (TLS) and at rest. We retain your data for as long as your account is active. You may request deletion of your account and all associated data by emailing info@defrag.app.</p>
          </Section>
          <Section title="Cookies">
            <p>We use a session cookie to keep you signed in. We do not use tracking or advertising cookies.</p>
          </Section>
          <Section title="Contact">
            <p>For privacy requests, contact us at <a href="mailto:info@defrag.app" className="text-[#c8c2bc] hover:text-[#f4efe9] transition-colors">info@defrag.app</a>. We respond within 30 days.</p>
          </Section>
        </Container>
      </section>
    </SiteShell>
  );
}
