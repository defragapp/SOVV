import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { useHeroEntrance } from '@/hooks/useHeroEntrance';

const ease = [0.16, 1, 0.3, 1] as const;
const APP_URL = '/app/login';

// ── Palette tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#08070a',
  bgLift:    '#0e0c10',
  bgCard:    '#121016',
  cream:     '#f4efe9',
  mid:       '#76716b',
  dim:       '#4f4b47',
  amber:     '#e0743a',
  amberLine: 'rgba(224,116,58,0.18)',
  amberFill: 'rgba(224,116,58,0.09)',
  rule:      'rgba(255,255,255,0.055)',
} as const;

// ── Data ──────────────────────────────────────────────────────────────────────
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
  },
  {
    id: 'alignment',
    n: '02',
    label: 'Alignment',
    tier: 'Pro',
    description: 'Choose the cleaner move. For decisions, responses, and next steps. Alignment helps you see what is yours, what is not, and how to move without losing yourself.',
  },
  {
    id: 'covenant',
    n: '03',
    label: 'Covenant',
    tier: 'Pro',
    description: 'Understand what the moment belongs to. For reflection and deeper integration. Covenant helps you step back and see the larger pattern.',
  },
];

// ── CTA Button ────────────────────────────────────────────────────────────────
function GhostCta({ children, href }: { children: React.ReactNode; href: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.a
      href={href}
      className="inline-flex items-center justify-center px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] font-semibold"
      style={{
        borderRadius: 100,
        border: `1px solid ${C.amberLine}`,
        background: C.amberFill,
        color: C.cream,
      }}
      whileHover={prefersReducedMotion ? {} : { background: 'rgba(224,116,58,0.15)', borderColor: 'rgba(224,116,58,0.38)' }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
    >
      {children}
    </motion.a>
  );
}

// ── BaselinePanel ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'design' as const, label: 'Design' },
  { id: 'context' as const, label: 'Context' },
] as const;
type TabId = typeof TABS[number]['id'];

function BaselinePanel() {
  const [active, setActive] = useState<TabId>('design');

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const idx = TABS.findIndex(t => t.id === active);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(TABS[(idx + 1) % TABS.length].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(TABS[(idx - 1 + TABS.length) % TABS.length].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(TABS[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(TABS[TABS.length - 1].id);
    }
  }, [active]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 16,
          border: `1px solid ${C.amberLine}`,
          background: C.bgLift,
          boxShadow: '0 40px 80px -24px rgba(0,0,0,0.7)',
        }}
      >
        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Baseline panel views"
          className="flex items-center px-5 gap-5 shrink-0"
          style={{ height: 44, borderBottom: `1px solid ${C.rule}`, background: 'rgba(8,7,10,0.8)' }}
          onKeyDown={handleKeyDown}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              id={`baseline-tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls={`baseline-panel-${tab.id}`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className="relative font-mono text-[10px] uppercase tracking-[0.18em] h-full flex items-center transition-colors duration-150"
              style={{ color: active === tab.id ? C.cream : C.dim }}
            >
              {tab.label}
              {active === tab.id && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 1, background: C.amber, opacity: 0.65 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Panels */}
        <AnimatePresence mode="wait">
          {active === 'design' && (
            <motion.div
              key="design"
              role="tabpanel"
              id="baseline-panel-design"
              aria-labelledby="baseline-tab-design"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-5">
                {BASELINE_FACTS.map((fact, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.28, ease }}
                    className="flex items-start justify-between gap-4 py-4"
                    style={{ borderBottom: i < 2 ? `1px solid ${C.rule}` : 'none' }}
                  >
                    <p className="flex-1 text-[13px] leading-relaxed" style={{ color: '#a8a29a' }}>{fact.text}</p>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {fact.chips.map(c => (
                        <span
                          key={c}
                          className="font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5"
                          style={{ color: C.dim, border: `1px solid ${C.rule}`, borderRadius: 3 }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mx-5 mb-5 pt-4" style={{ borderTop: `1px solid ${C.amberLine}` }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: C.amber }}>
                  Best Next Response
                </p>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: C.cream }}>Pause before repair</p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.rule}` }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: C.dim }}>
                  What&apos;s active
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#d4cec8' }}>
                  The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.
                </p>
              </div>
              <div className="px-5 py-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: `${C.amber}99` }}>
                  Best next response
                </p>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#a8a29a' }}>Pause before repair</p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>
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
  const springCfg = { stiffness: 40, damping: 18, mass: 1 };
  const springX = useSpring(rawX, springCfg);
  const springY = useSpring(rawY, springCfg);
  const textX = useTransform(springX, [0, 1], prefersReducedMotion ? [0, 0] : [-8, 8]);
  const textY = useTransform(springY, [0, 1], prefersReducedMotion ? [0, 0] : [-6, 6]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width);
    rawY.set((e.clientY - r.top) / r.height);
  }, [prefersReducedMotion, rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
  }, [rawX, rawY]);

  return (
    <section
      className="relative w-full min-h-[100svh] flex items-center overflow-hidden"
      style={{ background: C.bg }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* GSAP light beam */}
      <div ref={refs.lightBeamRef} className="light-beam" aria-hidden />

      {/* GSAP ambient glow */}
      <div
        ref={refs.glowRef}
        className="ambient-blob absolute -top-60 right-0 w-[540px] h-[540px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,116,58,0.9) 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* Hero image */}
      <div
        ref={refs.imageOuterRef}
        className="absolute right-0 top-0 w-full h-full pointer-events-none"
        style={{ willChange: 'clip-path' }}
      >
        <div ref={refs.imageDriftRef} className="hero-drift absolute right-0 top-0 h-full w-[58%]">
          <img
            src="/hero-hand.webp"
            alt=""
            className="object-cover object-left h-full w-full"
            style={{ objectPosition: '20% center', filter: 'sepia(0.14) brightness(0.8)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to right, ${C.bg} 0%, rgba(10,7,5,0.65) 36%, rgba(14,9,6,0.15) 68%, transparent 100%)` }}
          />
        </div>
      </div>

      {/* Content — subtle x/y parallax, no 3D tilt */}
      <motion.div className="relative z-10 w-full" style={{ x: textX, y: textY }}>
        <Container className="py-28 md:py-44">
          <div className="max-w-2xl">

            {/* Amber hairline */}
            <span
              aria-hidden
              style={{ display: 'block', width: 20, height: 1, background: `${C.amber}80`, marginBottom: '1rem' }}
            />

            {/* Eyebrow */}
            <p
              ref={refs.labelRef}
              className="font-mono text-[9px] uppercase tracking-[0.36em] mb-10"
              style={{ color: C.dim }}
            >
              Sovereign.os
            </p>

            {/* Headline */}
            <h1
              className="font-serif leading-[1.04] tracking-[-0.03em] text-balance"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.6rem)', color: C.cream }}
            >
              <span className="block overflow-hidden" style={{ lineHeight: 1.09 }}>
                <span ref={refs.line1Ref} className="block" style={{ willChange: 'transform' }}>
                  Your private operating
                </span>
              </span>
              <span className="block overflow-hidden" style={{ lineHeight: 1.09 }}>
                <span ref={refs.line2Ref} className="block" style={{ willChange: 'transform' }}>
                  system for{' '}
                  <em style={{ fontStyle: 'italic' }}>becoming</em>
                </span>
              </span>
              <span className="block overflow-hidden" style={{ lineHeight: 1.09 }}>
                <span ref={refs.line3Ref} className="block" style={{ willChange: 'transform' }}>
                  <em style={{ fontStyle: 'italic' }}>clear</em> to yourself.
                </span>
              </span>
            </h1>

            {/* Subtext */}
            <p
              ref={refs.subtextRef}
              className="mt-8 max-w-md text-[15px] leading-[1.75]"
              style={{ color: C.mid }}
            >
              Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
            </p>

            {/* Differentiator */}
            <p
              className="mt-5 max-w-sm font-mono text-[10px] leading-relaxed tracking-[0.1em] pl-3"
              style={{ color: C.dim, borderLeft: `1px solid ${C.amberLine}` }}
            >
              Most AI responds to what you type. Sovereign.os understands the pattern you&apos;re typing from.
            </p>

            {/* CTA */}
            <div ref={refs.ctaRef} className="mt-10 flex items-center gap-5 flex-wrap">
              <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>
                Free to start
              </span>
            </div>

          </div>
        </Container>
      </motion.div>
    </section>
  );
}

// ── Shared section label ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-[0.32em] mb-5" style={{ color: C.dim }}>
      {children}
    </p>
  );
}

// ── Spaces grid ───────────────────────────────────────────────────────────────
const [defrag, ...restSpaces] = SPACES;

function SpacesGrid() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-3">

      {/* Defrag — full-width featured */}
      <motion.a
        href={APP_URL}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease }}
        whileHover={{ y: -2 }}
        className="flex items-start justify-between gap-8 p-6 md:p-8 cursor-pointer"
        style={{
          background: C.bgCard,
          border: `1px solid ${C.amberLine}`,
          borderLeft: `2px solid rgba(224,116,58,0.55)`,
          borderRadius: 14,
        }}
      >
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-mono text-[10px] tracking-[0.06em]" style={{ color: `${C.amber}55` }}>
              {defrag.n}
            </span>
            <h3 className="font-serif text-[20px] font-normal" style={{ color: C.cream }}>
              {defrag.label}
            </h3>
          </div>
          <p className="text-[14px] leading-[1.75] max-w-2xl" style={{ color: C.mid }}>
            {defrag.description}
          </p>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] shrink-0 pt-0.5" style={{ color: `${C.amber}66` }}>
          {defrag.tier}
        </span>
      </motion.a>

      {/* Alignment + Covenant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {restSpaces.map((s, i) => (
          <motion.a
            key={s.id}
            href={APP_URL}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.07, ease }}
            whileHover={{ y: -2 }}
            className="flex flex-col justify-between gap-6 p-6 cursor-pointer"
            style={{ background: C.bgCard, border: `1px solid ${C.rule}`, borderRadius: 14 }}
          >
            <div>
              <div className="flex items-baseline gap-3 mb-2.5">
                <span className="font-mono text-[10px] tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
                  {s.n}
                </span>
                <h3 className="font-serif text-[18px] font-normal" style={{ color: C.cream }}>
                  {s.label}
                </h3>
              </div>
              <p className="text-[13px] leading-[1.75]" style={{ color: C.mid }}>{s.description}</p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: C.dim }}>
              {s.tier}
            </span>
          </motion.a>
        ))}
      </div>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <SiteShell entranceControlled>
      <Hero />

      {/* ── Baseline ──────────────────────────────────────────────── */}
      <section
        className="relative w-full py-24 md:py-36"
        style={{ background: C.bg, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <SectionLabel>The Foundation</SectionLabel>
            <h2
              className="font-serif italic tracking-[-0.022em] leading-[1.07] max-w-xl text-balance"
              style={{ fontSize: 'clamp(1.9rem, 4.8vw, 3.2rem)', color: C.cream }}
            >
              Your Baseline Design.<br />Active beneath every thread.
            </h2>
            <p className="mt-4 max-w-xs text-[14px] leading-[1.75]" style={{ color: C.mid }}>
              The pattern is already visible. Sovereign.os names it.
            </p>
          </div>
          <BaselinePanel />
        </Container>
      </section>

      {/* ── Pull Quote ────────────────────────────────────────────── */}
      <section
        className="w-full py-24 md:py-36"
        style={{ background: C.bgLift, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease }}
            className="mx-auto max-w-3xl text-center font-serif italic tracking-[-0.02em] leading-[1.14]"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', color: C.cream, fontWeight: 300 }}
          >
            The pattern you are repeating is{' '}
            <span style={{ color: 'rgba(244,239,233,0.35)' }}>not</span>{' '}
            new.{' '}
            <br className="hidden md:block" />
            The clarity can be.
          </motion.blockquote>
        </Container>
      </section>

      {/* ── Spaces ───────────────────────────────────────────────── */}
      <section
        className="relative w-full py-24 md:py-36"
        style={{ background: C.bg, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <SectionLabel>The Spaces</SectionLabel>
            <h2
              className="font-serif tracking-[-0.022em] leading-[1.07] max-w-xl text-balance"
              style={{ fontSize: 'clamp(1.9rem, 4.8vw, 3.2rem)', color: C.cream }}
            >
              Where patterns resolve.
            </h2>
          </div>

          {SpacesGrid()}
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section
        className="relative w-full py-32 md:py-48"
        style={{ background: C.bgLift, borderTop: `1px solid ${C.rule}` }}
      >
        <Container className="flex flex-col items-center text-center">
          <SectionLabel>Begin</SectionLabel>
          <h2
            className="font-serif tracking-[-0.024em] leading-[1.05] max-w-2xl text-balance"
            style={{ fontSize: 'clamp(2.2rem, 5.6vw, 4.4rem)', color: C.cream }}
          >
            The pattern is not new.<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(244,239,233,0.7)' }}>
              The clarity can be.
            </em>
          </h2>
          <p className="mt-6 max-w-xs text-[14px] leading-[1.75]" style={{ color: C.mid }}>
            Sovereign.os helps you integrate what you learn into how you live.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>
              Private by design · Free to start
            </p>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
