import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { Link } from 'wouter';

const USE_CASES = [
  { label: 'The message', title: 'The text that unsettled you', body: 'Read before you reply. Surface what\'s active beneath the words — yours and theirs.' },
  { label: 'The family', title: 'The role you keep falling back into', body: 'Name the loop before the holiday. Understand what gets activated and why.' },
  { label: 'The boundary', title: 'The one you keep negotiating', body: 'See the pattern before you override yourself again.' },
  { label: 'The grief', title: 'The loss that changed the room', body: 'Work through what\'s still active without having to explain it from scratch each time.' },
  { label: 'The work', title: 'The dynamic that keeps repeating', body: 'Understand the relational structure at play before the next meeting.' },
  { label: 'The response', title: 'The one you wish you\'d given', body: 'Alignment space shows you what was yours, what was theirs, and what the cleaner move looks like.' },
];

export function UseCasesPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Use cases</span>
          </div>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            <span className="text-glow">The moments</span> that bring people here.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed">
            Not abstract growth. Specific, real moments where the pattern needs reading before it runs the room.
          </p>
        </Container>
      </section>

      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.04]">
            {USE_CASES.map((uc, i) => (
              <div key={i} className="bg-[#0c0a0d] p-8 flex flex-col gap-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/50">{uc.label}</p>
                <h3 className="font-serif text-[1.1rem] text-[#f4efe9] leading-snug">{uc.title}</h3>
                <p className="text-sm text-[#76716b] leading-relaxed">{uc.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative w-full py-24 bg-[#08070a] border-t border-white/5 text-center">
        <Container className="relative z-10">
          <h2 className="font-serif text-4xl text-[#f4efe9] tracking-[-0.02em] mb-8 text-balance max-w-2xl mx-auto">
            Bring the moment.
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
