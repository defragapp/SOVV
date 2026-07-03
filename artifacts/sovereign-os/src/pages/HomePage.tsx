import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';

const ease = [0.16, 1, 0.3, 1] as const;
const APP_URL = '/app/login';

const BASELINE = {
  label: 'Your Baseline Design is active beneath every thread.',
  facts: [
    { text: 'You process conflict through withdrawal before re-engagement.', chips: ['DEFENSE', 'DELAY'] },
    { text: 'Boundaries collapse under sustained pressure from authority figures.', chips: ['PATTERN', 'ROLE'] },
    { text: 'You repair through over-explanation rather than silence.', chips: ['REPAIR'] },
  ],
};

const RESULT = {
  summary: 'The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.',
  move: { label: 'Pause before repair', description: 'Hold the impulse to fix immediately. Name what you noticed before you respond.' },
};

const SPACES = [
  { id: 'defrag', label: 'Defrag', description: 'The pattern recognition space. Bring the moment — message, conflict, boundary, grief — and read what\'s actually happening beneath it.', href: APP_URL, tags: ['free', 'core', 'pattern recognition'] },
  { id: 'covenant', label: 'Covenant', description: 'Faith-context reflection. Not certainty — the next honest step, held by something larger than the pattern.', href: APP_URL, tags: ['pro', 'faith', 'repair'] },
  { id: 'alignment', label: 'Alignment', description: 'Response integration. What is yours to carry. What belongs to the other side. The cleaner move.', href: APP_URL, tags: ['pro', 'action', 'response'] },
];

function SpacePreview() {
  const [active, setActive] = useState<'context' | 'result'>('context');
  const panels = [
    { id: 'context' as const, label: 'Design' },
    { id: 'result' as const, label: 'Result' },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="pointer-events-none absolute -inset-px" style={{ borderRadius: 'var(--radius-container)', background: 'radial-gradient(ellipse 60% 30% at 50% 100%, rgba(200,194,188,0.05) 0%, transparent 70%)' }} aria-hidden />
      <div className="relative border border-white/[0.12] bg-[#0c0a0d] overflow-hidden scan-lines" style={{ borderRadius: 'var(--radius-container)', boxShadow: '0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(224,116,58,0.06)' }}>
        {/* Titlebar */}
        <div className="h-11 border-b border-white/[0.08] bg-[#08070a]/95 flex items-center px-4 gap-3 shrink-0">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-sm bg-white/[0.10]" />)}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#76716b]">Sovereign.os</span>
          </div>
          <div className="flex gap-0.5">
            {panels.map(p => (
              <button key={p.id} onClick={() => setActive(p.id)} className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-200 ${active === p.id ? 'bg-white/[0.12] text-[#f4efe9]' : 'text-[#4f4b47] hover:text-[#76716b]'}`} style={{ borderRadius: 5 }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {active === 'context' && (
            <motion.div key="context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="px-6 pt-5 pb-3 border-b border-white/[0.06] bg-[#e0743a]/[0.03]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#e0743a]/60" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/70">Baseline Design Active</p>
                </div>
                <p className="text-[11px] text-[#76716b] leading-relaxed">{BASELINE.label}</p>
              </div>
              <div className="px-6 py-1">
                {BASELINE.facts.map((fact, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.35, ease }} className="flex items-start gap-4 py-4 border-b border-white/[0.05] last:border-0">
                    <div className="flex-1">
                      <p className="text-[13px] text-[#d4cec8] leading-snug">{fact.text}</p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end shrink-0 max-w-[150px]">
                      {fact.chips.map(c => (
                        <span key={c} className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06]" style={{ borderRadius: 4 }}>{c}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {active === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">What's active</p>
                <p className="text-[13px] text-[#d4cec8] leading-relaxed">{RESULT.summary}</p>
              </div>
              <div className="px-6 py-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">Best next response</p>
                <p className="text-[12px] font-medium text-[#c8c2bc] mb-1">{RESULT.move.label}</p>
                <p className="text-[12px] text-[#76716b] leading-relaxed">{RESULT.move.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <SiteShell>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[100svh] flex items-center bg-[#08070a] overflow-hidden">
        <div className="light-beam" aria-hidden />
        <div className="ambient-blob absolute -top-60 right-0 w-[600px] h-[600px] opacity-[0.04]" style={{ background: 'radial-gradient(circle, rgba(224,116,58,1) 0%, transparent 70%)' }} aria-hidden />

        {/* Hero image */}
        <div className="absolute right-0 top-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="hero-drift absolute right-0 top-0 h-full w-[55%]">
            <img src="/hero-hand.webp" alt="" className="object-cover object-left h-full w-full" style={{ objectPosition: '20% center' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #08070a 0%, rgba(8,7,10,0.4) 40%, transparent 100%)' }} />
          </div>
        </div>

        <Container className="relative z-10 py-32 md:py-48">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#4f4b47] mb-10">Sovereign.os</p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease }}
              className="font-serif text-[#f4efe9] leading-[1.05] tracking-[-0.025em] text-balance"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
            >
              Healing isn't optional.<br />
              <span className="text-glow">Holding the pain is.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease }}
              className="mt-7 max-w-md text-[17px] text-[#76716b] leading-relaxed"
            >
              Pattern-aware AI for the moments that are hard to read while you're inside them.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease }}
              className="mt-9 flex items-center gap-5 flex-wrap"
            >
              <Link href={APP_URL} className="btn-primary">Enter Sovereign.os</Link>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">Free to start</span>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ── Clarity Console ───────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#08070a] border-t border-white/[0.04] overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">How it works</p>
            <h2 className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.08] max-w-xl text-balance" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Your Baseline Design.<br />Active beneath every thread.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] text-[#76716b] leading-relaxed">
              Pattern recognition that reads what's active before you reply, react, or withdraw.
            </p>
          </div>
          <SpacePreview />
        </Container>
      </section>

      {/* ── Spaces ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/[0.04] overflow-hidden">
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">The spaces</p>
            <h2 className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.08] max-w-xl text-balance" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Three contexts. One Baseline Design.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {SPACES.map((space, i) => (
              <motion.a
                key={space.id}
                href={space.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="relative flex flex-col p-7 border border-white/[0.06] bg-[#0c0a0d] hover:border-white/[0.12] hover:bg-white/[0.015] transition-all duration-300 group cursor-pointer"
                style={{ borderRadius: 'var(--radius-container)' }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#4f4b47] mb-4">{space.id === 'defrag' ? 'Free' : 'Pro'}</p>
                <h3 className="font-serif text-xl text-[#f4efe9] mb-3 group-hover:text-glow transition-all">{space.label}</h3>
                <p className="text-[14px] text-[#76716b] leading-relaxed flex-1">{space.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-5 border-t border-white/[0.05] mt-5">
                  {space.tags.map(tag => (
                    <span key={tag} className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05]" style={{ borderRadius: 3 }}>{tag}</span>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-32 md:py-48 bg-[#0c0a0d] border-t border-white/[0.04] overflow-hidden">
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-15" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-[0.08]" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,116,58,0.05) 0%, transparent 70%)' }} aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">Begin</p>
          <h2 className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] max-w-2xl text-balance" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}>
            <span className="text-glow">Return before</span> the pattern runs the room.
          </h2>
          <p className="mt-6 max-w-md text-[15px] text-[#76716b] leading-relaxed">
            Understand what's active, see what may be repeating, and choose the next move with more context.
          </p>
          <div className="mt-9">
            <Link href={APP_URL} className="btn-primary">Enter Sovereign.os</Link>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">Private by design · Free to start</p>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
