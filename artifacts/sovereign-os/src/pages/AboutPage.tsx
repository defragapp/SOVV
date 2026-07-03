import { useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';

const ease = [0.16, 1, 0.3, 1] as const;

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  );
}

export function AboutPage() {
  const prefersReducedMotion = useReducedMotion();

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const springX = useSpring(rawX, { stiffness: 50, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 50, damping: 20 });
  const rotateY = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [-1.5, 1.5]);
  const rotateX = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [1.5, -1.5]);
  const glowX = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [30, -30]);
  const glowY = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [20, -20]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }, [prefersReducedMotion, rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
  }, [rawX, rawY]);

  return (
    <SiteShell>
      {/* Hero — parallax reactive */}
      <section
        className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="light-beam opacity-50" aria-hidden />
        {/* Inverse parallax glow */}
        <motion.div
          className="absolute -top-60 -right-60 w-[700px] h-[700px] pointer-events-none"
          style={{ x: glowX, y: glowY, background: 'radial-gradient(circle, rgba(224,116,58,0.07) 0%, transparent 70%)' }}
          aria-hidden
        />
        <motion.div
          className="relative z-10"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          <Container className="max-w-3xl">
            <MetaLabel>About</MetaLabel>
            <h1 className="reveal-up reveal-up-2 font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
              <span className="text-glow">Before you explain yourself again,</span>
              <br />
              return to yourself first.
            </h1>
            <p className="text-[#a8a29a] text-[17px] max-w-xl leading-relaxed">
              Pattern-aware AI for the moments that are hard to read while you&apos;re inside them. Not abstract self-improvement — specific, real, sometimes difficult moments of actual life.
            </p>
          </Container>
        </motion.div>
      </section>

      {/* Detail grid */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {[
              { label: 'The moment', body: 'The message that unsettled you. The family role you keep falling back into. The boundary you keep negotiating with yourself. The grief that changes the room.' },
              { label: 'The structure', body: 'Sovereign.os gives those moments structure — showing what\'s active, what may be repeating, and what next move gives the situation a better chance.' },
              { label: 'The platform', body: 'Your Baseline Design is the starting map. Defrag, Covenant, and Alignment are the spaces where the work happens. The Archive is where you save what helped.' },
              { label: 'The limit', body: 'Sovereign.os does not diagnose, predict, or guarantee outcomes. It is not a replacement for therapy. It is the space between sessions.' },
            ].map((item, i) => (
              <div key={i} className={`py-8 pr-8 border-b border-white/[0.06] md:border-r md:even:border-r-0 last:border-b-0 reveal-up reveal-up-${Math.min(i + 2, 6)} glow-card-hover cursor-default`}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/50 mb-3">{item.label}</p>
                <p className="text-[15px] text-[#a8a29a] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative w-full py-20 md:py-28 bg-[#08070a] border-t border-white/[0.04] text-center overflow-hidden">
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-15" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.06]" />
        <Container className="relative z-10 flex flex-col items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">Begin</p>
          <h2 className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] max-w-2xl text-balance" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}>
            <span className="text-glow">Return before</span> the pattern runs the room.
          </h2>
          <p className="mt-6 max-w-md text-[15px] text-[#76716b] leading-relaxed">
            Understand what&apos;s active, see what may be repeating, and choose the next move with more context.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4">
            <motion.a
              href="/app/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-mono text-[12px] uppercase tracking-[0.12em]"
              style={{
                background: 'rgba(224,116,58,0.90)',
                color: '#08070a',
                boxShadow: '0 0 0 1px rgba(224,116,58,0.5) inset',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Enter Sovereign.os
            </motion.a>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              Private by design · Free to start
            </p>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
