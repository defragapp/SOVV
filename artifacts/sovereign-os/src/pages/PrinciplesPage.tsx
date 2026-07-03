import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

const PRINCIPLES = [
  { num: '01', title: 'Private by design', body: 'Your Baseline Design and everything you share are held privately. We do not sell data, train on your sessions, or surface personal details in outputs.' },
  { num: '02', title: 'Pattern over prediction', body: 'Sovereign.os reads what\'s active and repeating — not what will happen. We surface patterns, not forecasts. This is not a determinism machine.' },
  { num: '03', title: 'Not a replacement for professional support', body: 'If you\'re in crisis, please contact a qualified professional or emergency services. Sovereign.os is the space between sessions, not the session itself.' },
  { num: '04', title: 'Depth that matches the moment', body: 'A simple moment gets a focused read. A complex situation gets more. The system does not pad outputs to feel comprehensive.' },
  { num: '05', title: 'Return is the discipline', body: 'The work is not one session. It\'s returning before the pattern runs the room again. The Library exists to support that return.' },
  { num: '06', title: 'Context is not compliance', body: 'Your Baseline Design informs the work — it does not determine outcomes. Pattern awareness is not destiny. You still choose.' },
];

export function PrinciplesPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Principles</span>
          </div>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            What we believe.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed">
            These are the commitments that shape every feature we build and every boundary we maintain.
          </p>
        </Container>
      </section>

      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-0">
            {PRINCIPLES.map((p, idx) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-start gap-8 py-8 border-b border-white/[0.05] last:border-0 glow-card-hover -mx-4 px-4"
                style={{ borderRadius: 2 }}
              >
                <span className="font-mono text-[11px] tracking-[0.2em] shrink-0 mt-1 select-none" style={{ color: 'rgba(200, 194, 188, 0.35)', fontVariantNumeric: 'tabular-nums' }}>
                  {p.num}
                </span>
                <div className="flex-1">
                  <h3 className="font-serif text-[1rem] text-[#f4efe9] mb-2">{p.title}</h3>
                  <p className="text-[13px] text-[#76716b] leading-[1.7] max-w-xl">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative w-full py-20 bg-[#08070a] border-t border-white/[0.04] text-center overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center">
          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] mb-5 text-balance max-w-xl leading-tight">
            See the pattern. Choose the repair.
          </h2>
          <Link href="/app/login" className="btn-primary">Enter Sovereign.os</Link>
        </Container>
      </section>
    </SiteShell>
  );
}
