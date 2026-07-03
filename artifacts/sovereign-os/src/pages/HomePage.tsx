import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Link } from 'wouter';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { useHeroEntrance } from '@/hooks/useHeroEntrance';

const ease = [0.16, 1, 0.3, 1] as const;
const APP_URL = '/app/login';

// ── Data ─────────────────────────────────────────────────────────────────────
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
  { id: 'defrag',    label: 'Defrag',    description: "The pattern recognition space. Bring the moment — message, conflict, boundary, grief — and read what's actually happening beneath it.", href: APP_URL, tags: ['free', 'core', 'pattern recognition'] },
  { id: 'covenant',  label: 'Covenant',  description: 'Faith-context reflection. Not certainty — the next honest step, held by something larger than the pattern.',                            href: APP_URL, tags: ['pro', 'faith', 'repair'] },
  { id: 'alignment', label: 'Alignment', description: 'Response integration. What is yours to carry. What belongs to the other side. The cleaner move.',                                     href: APP_URL, tags: ['pro', 'action', 'response'] },
];

// ── SpacePreview ──────────────────────────────────────────────────────────────
function SpacePreview() {
  const [active, setActive] = useState<'context' | 'result'>('context');

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div
        className="pointer-events-none absolute -inset-px"
        style={{ borderRadius: 'var(--radius-container)', background: 'radial-gradient(ellipse 60% 30% at 50% 100%, rgba(200,194,188,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="relative border border-white/[0.12] bg-[#0c0a0d] overflow-hidden scan-lines"
        style={{ borderRadius: 'var(--radius-container)', boxShadow: '0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(224,116,58,0.06)' }}
      >
        {/* Titlebar */}
        <div className="h-11 border-b border-white/[0.08] bg-[#08070a]/95 flex items-center px-4 gap-3 shrink-0">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-sm bg-white/[0.10]" />)}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#76716b]">Sovereign.os</span>
          </div>
          <div className="flex gap-0.5">
            {([{ id: 'context' as const, label: 'Design' }, { id: 'result' as const, label: 'Result' }]).map(p => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-200 ${active === p.id ? 'bg-white/[0.12] text-[#f4efe9]' : 'text-[#4f4b47] hover:text-[#76716b]'}`}
                style={{ borderRadius: 5 }}
              >
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

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const refs = useHeroEntrance();
  const prefersReducedMotion = useReducedMotion();

  // Mouse tracking — normalised to [0, 1] with 0.5 = center
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  // Spring-smoothed: heavy hardware feel
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);

  // 3D tilt: max ±2 degrees
  const rotateY = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [-2, 2]);
  const rotateX = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [2, -2]);

  // Text parallax: moves slightly faster than the tilt (forward-Z illusion)
  const textX = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [-10, 10]);
  const textY = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [-10, 10]);

  // Ambient glow: moves inversely (light source appears behind the glass)
  const glowX = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [40, -40]);
  const glowY = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [40, -40]);

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
    <section
      className="relative w-full min-h-[100svh] flex items-center bg-[#08070a] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px' }}
    >
      {/* Light beam — GSAP entrance */}
      <div ref={refs.lightBeamRef} className="light-beam" aria-hidden />

      {/* Ambient glow — GSAP entrance; Framer Motion parallax offset layered via transform */}
      <div
        ref={refs.glowRef}
        className="ambient-blob absolute -top-60 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,116,58,1) 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* Parallax reactive glow — separate layer, inverse to mouse (light source illusion) */}
      <motion.div
        className="absolute -top-60 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          background: 'radial-gradient(circle, rgba(224,116,58,0.18) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      {/* Hero image — GSAP clip-path entrance */}
      <div
        ref={refs.imageOuterRef}
        className="absolute right-0 top-0 w-full h-full pointer-events-none"
        style={{ willChange: 'clip-path' }}
      >
        <div className="hero-drift absolute right-0 top-0 h-full w-[55%]">
          <img
            src="/hero-hand.webp"
            alt=""
            className="object-cover object-left h-full w-full"
            style={{ objectPosition: '20% center' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #08070a 0%, rgba(8,7,10,0.4) 40%, transparent 100%)' }}
          />
        </div>
      </div>

      {/* 3D tilt wrapper — applies rotateX/Y to the entire text + CTA layer */}
      <motion.div
        className="relative z-10 w-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <Container className="py-32 md:py-48">
          <div className="max-w-2xl">

            {/* Eyebrow — GSAP entrance */}
            <p
              ref={refs.labelRef}
              className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#4f4b47] mb-10"
            >
              Sovereign.os
            </p>

            {/* Headline — GSAP mask reveal + Framer Motion parallax translate */}
            <motion.h1
              className="font-serif text-[#f4efe9] leading-[1.05] tracking-[-0.025em] text-balance"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                x: textX,
                y: textY,
                translateZ: prefersReducedMotion ? 0 : 20,
              }}
            >
              <span className="block overflow-hidden" style={{ lineHeight: 1.12 }}>
                <span ref={refs.line1Ref} className="block" style={{ willChange: 'transform' }}>
                  Healing isn&apos;t optional.
                </span>
              </span>
              <span className="block overflow-hidden" style={{ lineHeight: 1.12 }}>
                <span ref={refs.line2Ref} className="block" style={{ willChange: 'transform' }}>
                  <span className="text-glow">Holding the pain is.</span>
                </span>
              </span>
            </motion.h1>

            {/* Subtext — GSAP entrance */}
            <p
              ref={refs.subtextRef}
              className="mt-7 max-w-md text-[17px] text-[#76716b] leading-relaxed"
            >
              Pattern-aware AI for the moments that are hard to read while you&apos;re inside them.
            </p>

            {/* CTA — tactile glass button */}
            <div ref={refs.ctaRef} className="mt-9 flex items-center gap-5 flex-wrap">
              <motion.a
                href={APP_URL}
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#f4efe9', color: '#08070a' }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                Enter Sovereign.os
              </motion.a>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">Free to start</span>
            </div>

          </div>
        </Container>
      </motion.div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <SiteShell entranceControlled>
      <Hero />

      {/* ── Clarity Console ─────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#08070a] border-t border-white/[0.04] overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">How it works</p>
            <h2 className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.08] max-w-xl text-balance" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Your Baseline Design.<br />Active beneath every thread.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] text-[#76716b] leading-relaxed">
              Pattern recognition that reads what&apos;s active before you reply, react, or withdraw.
            </p>
          </div>
          <SpacePreview />
        </Container>
      </section>

      {/* ── Spaces ──────────────────────────────────────────────────────── */}
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

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
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
            Understand what&apos;s active, see what may be repeating, and choose the next move with more context.
          </p>
          <div className="mt-9">
            <motion.a
              href={APP_URL}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#f4efe9', color: '#08070a' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Enter Sovereign.os
            </motion.a>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">Private by design · Free to start</p>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
