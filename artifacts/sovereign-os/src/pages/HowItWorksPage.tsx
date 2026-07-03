import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  );
}

const STEPS = [
  {
    num: '01',
    title: 'Your Baseline Design is set once',
    body: 'Your core pattern layer. Maps how you process, respond, protect, relate, and return to center — across every app inside Sovereign.os. Active beneath every session. Never exposed in outputs.',
    note: 'You do not have to explain who you are every time a moment happens.',
  },
  {
    num: '02',
    title: 'Bring the moment',
    body: 'Describe the pressure, the message, the dynamic, or the decision. Say it how it actually happened. No framework required.',
    note: null,
  },
  {
    num: '03',
    title: 'Receive a structured read',
    body: 'Active pattern. What keeps forming. What shaped it. The clearest next response. Your Baseline Design is read in full before the output is generated — so the result starts from who you are, not from a blank prompt.',
    note: null,
  },
  {
    num: '04',
    title: 'Save to your Archive',
    body: 'Save the result before the moment disappears. Your Archive holds what helped — a growing record of your mapped patterns over time.',
    note: null,
  },
  {
    num: '05',
    title: 'Return before the pattern takes over',
    body: 'The next time the loop tries to form, you do not start from zero. Return to your Archive, interrupt the old role, and respond differently.',
    note: null,
  },
];

export function HowItWorksPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>The OS process</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            How the operating system works.
          </h1>
          <p className="text-[#a8a29a] text-[17px] max-w-lg leading-relaxed">
            Sovereign.os uses your Baseline Design to read what&apos;s active, identify what may be repeating, and surface a structured response — before pressure chooses for you.
          </p>
          <p className="mt-5 max-w-sm font-mono text-[10px] tracking-[0.12em] text-[#4f4b47] leading-relaxed border-l border-[#e0743a]/20 pl-4">
            Most AI responds to what you type. Sovereign.os understands the pattern you&apos;re typing from.
          </p>
        </Container>
      </section>

      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container>
          <div className="max-w-2xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-start gap-8 py-8 border-b border-white/[0.04] last:border-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center border border-white/[0.08] bg-[#0c0a0d]" style={{ borderRadius: 8 }}>
                    <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.2em]">{step.num}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 min-h-[32px] bg-white/[0.06] mt-2" />}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="font-serif text-[1.15rem] text-[#f4efe9] leading-snug mb-3">{step.title}</h3>
                  <p className="text-sm text-[#a8a29a] leading-relaxed mb-3">{step.body}</p>
                  {step.note && (
                    <p className="text-sm text-[#76716b] leading-relaxed border-l-2 border-[#e0743a]/20 pl-4">{step.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative w-full py-24 bg-[#08070a] border-t border-white/5 text-center overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] mb-8 text-balance max-w-2xl mx-auto">
            Ready to interrupt the loop?
          </h2>
          <a
            href="/app/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 active:scale-[0.97]"
            style={{ background: '#f4efe9', color: '#08070a' }}
          >
            Enter Sovereign.os
          </a>
        </Container>
      </section>
    </SiteShell>
  );
}
