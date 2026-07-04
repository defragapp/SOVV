import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import { Link } from 'wouter';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { useHeroEntrance } from '@/hooks/useHeroEntrance';

const ease = [0.16, 1, 0.3, 1] as const;
const APP_URL = '/app/login';

// ── Data ─────────────────────────────────────────────────────────────────────
const BASELINE_FACTS = [
  { text: 'You process conflict through withdrawal before re-engagement.', chips: ['Defense', 'Delay'] },
  { text: 'Boundaries collapse under sustained pressure from authority figures.', chips: ['Pattern', 'Role'] },
  { text: 'You repair through over-explanation rather than silence.', chips: ['Repair'] },
];

const SPACES = [
  {
    id: 'defrag',
    n: '01',
    label: 'Defrag',
    tier: 'Free',
    description: "Untangle the moment. For conversations, conflicts, and inner pressure that feel messy. Defrag shows what's happening, what pattern is forming, and what changes it.",
    accent: true,
  },
  {
    id: 'alignment',
    n: '02',
    label: 'Alignment',
    tier: 'Pro',
    description: 'Choose the cleaner move. For decisions, responses, and next steps. Alignment helps you see what is yours, what is not, and how to move without losing yourself.',
    accent: false,
  },
  {
    id: 'covenant',
    n: '03',
    label: 'Covenant',
    tier: 'Pro',
    description: 'Understand what the moment belongs to. For reflection and deeper integration. Covenant helps you step back and see the larger pattern.',
    accent: false,
  },
];

// ── Ghost CTA button ──────────────────────────────────────────────────────────
const ghostHover: TargetAndTransition = {
  backgroundColor: 'rgba(224,116,58,0.16)',
  boxShadow: '0 0 0 4px rgba(224,116,58,0.10), 0 0 0 10px rgba(224,116,58,0.045)',
};
const ghostTap: TargetAndTransition = { scale: 0.97 };

function GhostCta({ children, href }: { children: React.ReactNode; href: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.a
      href={href}
      className="inline-flex items-center justify-center px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] font-semibold text-[#f4efe9]"
      style={{
        borderRadius: 100,
        border: '1px solid rgba(224,116,58,0.38)',
        background: 'rgba(224,116,58,0.09)',
        boxShadow: '0 0 0 4px rgba(224,116,58,0.06), 0 0 0 10px rgba(224,116,58,0.025)',
      }}
      whileHover={prefersReducedMotion ? {} : ghostHover}
      whileTap={prefersReducedMotion ? {} : ghostTap}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      {children}
    </motion.a>
  );
}

// ── BaselinePanel ─────────────────────────────────────────────────────────────
function BaselinePanel() {
  const [active, setActive] = useState<'design' | 'context'>('design');

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div
        className="pointer-events-none absolute -inset-px"
        style={{ borderRadius: 18, background: 'radial-gradient(ellipse 60% 30% at 50% 100%, rgba(224,116,58,0.06) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="relative bg-[#0d0b0e] overflow-hidden"
        style={{
          borderRadius: 18,
          border: '1px solid rgba(224,116,58,0.14)',
          boxShadow: '0 50px 120px -24px rgba(0,0,0,0.85), 0 0 0 1px rgba(224,116,58,0.10), 0 0 100px rgba(224,116,58,0.055)',
        }}
      >
        {/* Titlebar / Tab list */}
        <div
          role="tablist"
          aria-label="Baseline panel views"
          className="flex items-center px-6 gap-6 shrink-0"
          style={{ height: 48, borderBottom: '1px solid rgba(224,116,58,0.12)', background: 'rgba(8,7,10,0.95)' }}
        >
          {([
            { id: 'design' as const, label: 'Design', panelId: 'baseline-panel-design' },
            { id: 'context' as const, label: 'Context', panelId: 'baseline-panel-context' },
          ]).map(tab => (
            <button
              key={tab.id}
              role="tab"
              id={`baseline-tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls={tab.panelId}
              onClick={() => setActive(tab.id)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] pb-px transition-all duration-200"
              style={{
                color: active === tab.id ? '#f4efe9' : '#4f4b47',
                borderBottom: active === tab.id ? '1px solid rgba(224,116,58,0.7)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <AnimatePresence mode="wait">
          {active === 'design' && (
            <motion.div
              key="design"
              role="tabpanel"
              id="baseline-panel-design"
              aria-labelledby="baseline-tab-design"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            >
              <div className="px-6 py-1">
                {BASELINE_FACTS.map((fact, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease }}
                    className="relative flex items-start justify-between gap-4 py-4"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.025)' : 'none' }}
                  >
                    {/* Amber left accent */}
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: -24,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 2,
                        height: '60%',
                        background: 'rgba(224,116,58,0.35)',
                        borderRadius: 2,
                      }}
                    />
                    <p className="flex-1 text-[13px] text-[#a8a29a] leading-relaxed">{fact.text}</p>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {fact.chips.map(c => (
                        <span
                          key={c}
                          className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5"
                          style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3 }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Best Next Response */}
              <div className="mx-6 mb-6 pt-4" style={{ borderTop: '1px solid rgba(224,116,58,0.18)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a] mb-2">Best Next Response</p>
                <p className="text-[13px] text-[#f4efe9] font-medium mb-1.5">Pause before repair</p>
                <p className="text-[13px] text-[#76716b] leading-relaxed">
                  Hold the impulse to fix immediately. Name what you noticed before you respond.
                </p>
              </div>
            </motion.div>
          )}

          {active === 'context' && (
            <motion.div
              key="context"
              role="tabpanel"
              id="baseline-panel-context"
              aria-labelledby="baseline-tab-context"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            >
              <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">What&apos;s active</p>
                <p className="text-[13px] text-[#d4cec8] leading-relaxed">
                  The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.
                </p>
              </div>
              <div className="px-6 py-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">Best next response</p>
                <p className="text-[12px] font-medium text-[#a8a29a] mb-1">Pause before repair</p>
                <p className="text-[12px] text-[#76716b] leading-relaxed">
                  Hold the impulse to fix immediately. Name what you noticed before you respond.
                </p>
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

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);
  const rotateY = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [-2, 2]);
  const rotateX = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [2, -2]);
  const textX = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [-10, 10]);
  const textY = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [-10, 10]);
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

      {/* Ambient glow — GSAP entrance */}
      <div
        ref={refs.glowRef}
        className="ambient-blob absolute -top-60 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,116,58,1) 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* Parallax reactive glow */}
      <motion.div
        className="absolute -top-60 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          background: 'radial-gradient(circle, rgba(224,116,58,0.18) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      {/* Hero image — GSAP clip-path entrance, warmer grade */}
      <div
        ref={refs.imageOuterRef}
        className="absolute right-0 top-0 w-full h-full pointer-events-none"
        style={{ willChange: 'clip-path' }}
      >
        <div className="hero-drift absolute right-0 top-0 h-full w-[58%]">
          <img
            src="/hero-hand.webp"
            alt=""
            className="object-cover object-left h-full w-full"
            style={{ objectPosition: '20% center', filter: 'sepia(0.18) brightness(0.82)' }}
          />
          {/* Warmer gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #08070a 0%, rgba(10,7,5,0.62) 38%, rgba(14,9,6,0.18) 70%, transparent 100%)' }}
          />
        </div>
      </div>

      {/* 3D tilt wrapper */}
      <motion.div
        className="relative z-10 w-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <Container className="py-32 md:py-48">
          <div className="max-w-2xl">

            {/* Amber hairline rule */}
            <span
              aria-hidden
              style={{ display: 'block', width: 24, height: 1, background: 'rgba(224,116,58,0.5)', marginBottom: '1.125rem' }}
            />

            {/* Eyebrow — GSAP entrance */}
            <p
              ref={refs.labelRef}
              className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#4f4b47] mb-10"
            >
              Sovereign.os
            </p>

            {/* Headline — GSAP mask reveal + Framer Motion parallax */}
            <motion.h1
              className="font-serif text-[#f4efe9] leading-[1.05] tracking-[-0.028em] text-balance"
              style={{
                fontSize: 'clamp(2.9rem, 7.2vw, 5.8rem)',
                x: textX,
                y: textY,
                translateZ: prefersReducedMotion ? 0 : 20,
              }}
            >
              <span className="block overflow-hidden" style={{ lineHeight: 1.1 }}>
                <span ref={refs.line1Ref} className="block" style={{ willChange: 'transform' }}>
                  Your private operating
                </span>
              </span>
              <span className="block overflow-hidden" style={{ lineHeight: 1.1 }}>
                <span ref={refs.line2Ref} className="block" style={{ willChange: 'transform' }}>
                  system for{' '}
                  <em className="not-italic" style={{ fontStyle: 'italic', textShadow: '0 0 40px rgba(224,116,58,0.55)' }}>becoming</em>
                </span>
              </span>
              <span className="block overflow-hidden" style={{ lineHeight: 1.1 }}>
                <span className="block" style={{ willChange: 'transform' }}>
                  <em className="not-italic" style={{ fontStyle: 'italic', textShadow: '0 0 40px rgba(224,116,58,0.55)' }}>clear</em> to yourself.
                </span>
              </span>
            </motion.h1>

            {/* Subtext — GSAP entrance */}
            <p
              ref={refs.subtextRef}
              className="mt-7 max-w-md text-[17px] text-[#76716b] leading-relaxed"
            >
              Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
            </p>

            {/* Core hook */}
            <p className="mt-5 max-w-sm font-mono text-[10px] tracking-[0.12em] text-[#4f4b47] leading-relaxed border-l border-[#e0743a]/20 pl-4">
              Most AI responds to what you type. Sovereign.os understands the pattern you&apos;re typing from.
            </p>

            {/* CTA */}
            <div ref={refs.ctaRef} className="mt-10 flex items-center gap-6 flex-wrap">
              <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
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

      {/* ── Baseline ──────────────────────────────────────────────────── */}
      <section
        className="relative w-full py-24 md:py-40 bg-[#08070a] overflow-hidden"
        style={{ borderTop: '1px solid rgba(224,116,58,0.10)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,116,58,0.055) 0%, transparent 70%)' }}
          aria-hidden
        />
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center mb-14">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">The Foundation</p>
            <h2
              className="font-serif italic text-[#f4efe9] tracking-[-0.02em] leading-[1.08] max-w-xl text-balance"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
            >
              Your Baseline Design.<br />Active beneath every thread.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] text-[#76716b] leading-relaxed">
              The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.
            </p>
          </div>
          <BaselinePanel />
        </Container>
      </section>

      {/* ── Pull Quote ────────────────────────────────────────────────── */}
      <section
        className="w-full py-24 md:py-40 bg-[#06050a]"
        style={{ borderTop: '1px solid rgba(224,116,58,0.08)' }}
      >
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47]/60 mb-10">On pattern</p>
            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease }}
              className="font-serif italic text-[#f4efe9] leading-[1.16] tracking-[-0.018em]"
              style={{ fontSize: 'clamp(1.65rem, 4.2vw, 3.1rem)', fontWeight: 300 }}
            >
              The pattern you are repeating is{' '}
              <span style={{ color: 'rgba(244,239,233,0.4)' }}>not</span> new.{' '}
              <br className="hidden md:block" />
              The clarity can be.
            </motion.blockquote>
          </div>
        </Container>
      </section>

      {/* ── Spaces ───────────────────────────────────────────────────── */}
      <section
        className="relative w-full py-24 md:py-40 bg-[#0c0a0d] overflow-hidden"
        style={{ borderTop: '1px solid rgba(224,116,58,0.10)' }}
      >
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center mb-14">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">The Spaces</p>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.08] max-w-xl text-balance"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
            >
              Where patterns resolve.
            </h2>
          </div>

          {(() => {
            const [defrag, ...rest] = SPACES;
            const cardHover: TargetAndTransition = { y: -2 };
            return (
              <div className="max-w-4xl mx-auto flex flex-col gap-4">
                {/* Defrag — full width with amber left border */}
                <motion.a
                  href={APP_URL}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease }}
                  className="flex items-start justify-between gap-8 p-7 bg-[#0c0a0d] cursor-pointer"
                  style={{
                    border: '1px solid rgba(224,116,58,0.12)',
                    borderLeft: '3px solid rgba(224,116,58,0.55)',
                    borderRadius: 16,
                  }}
                  whileHover={cardHover}
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3.5 mb-3">
                      <span className="font-mono text-[11px] tracking-[0.06em]" style={{ color: 'rgba(224,116,58,0.45)' }}>{defrag.n}</span>
                      <h3 className="font-serif text-[22px] text-[#f4efe9] font-normal">{defrag.label}</h3>
                    </div>
                    <p className="text-[15px] text-[#76716b] leading-[1.72] max-w-2xl">{defrag.description}</p>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#e0743a]/50 whitespace-nowrap pt-1 shrink-0">
                    {defrag.tier}
                  </span>
                </motion.a>

                {/* Alignment + Covenant — 2-col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rest.map((s, i) => (
                    <motion.a
                      key={s.id}
                      href={APP_URL}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease }}
                      className="flex flex-col justify-between gap-8 p-7 bg-[#0c0a0d] cursor-pointer"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}
                      whileHover={cardHover}
                    >
                      <div>
                        <div className="flex items-baseline gap-3 mb-2.5">
                          <span className="font-mono text-[11px] tracking-[0.06em] text-white/15">{s.n}</span>
                          <h3 className="font-serif text-[19px] text-[#f4efe9] font-normal">{s.label}</h3>
                        </div>
                        <p className="text-[13px] text-[#76716b] leading-[1.72]">{s.description}</p>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#4f4b47]">{s.tier}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            );
          })()}
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section
        className="relative w-full py-32 md:py-52 bg-[#08070a] overflow-hidden"
        style={{ borderTop: '1px solid rgba(224,116,58,0.10)' }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 65% at 50% 50%, rgba(224,116,58,0.10) 0%, transparent 68%)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-10">Begin</p>
          <h2
            className="font-serif text-[#f4efe9] tracking-[-0.022em] leading-[1.06] max-w-2xl text-balance"
            style={{ fontSize: 'clamp(2.2rem, 5.8vw, 4.6rem)' }}
          >
            The pattern is not new.<br />
            <em className="not-italic" style={{ fontStyle: 'italic', textShadow: '0 0 40px rgba(224,116,58,0.52)' }}>
              The clarity can be.
            </em>
          </h2>
          <p className="mt-6 max-w-md text-[15px] text-[#76716b] leading-relaxed">
            Sovereign.os helps you integrate what you learn into how you live.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              Private by design · Free to start
            </p>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
