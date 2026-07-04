import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { useHeroEntrance } from '@/hooks/useHeroEntrance';

const ease = [0.16, 1, 0.3, 1] as const;
const APP_URL = '/app/login';
const sectionViewport = { once: true, margin: '-90px' } as const;

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

const FLOW_STEPS = [
  {
    n: '01',
    title: 'Capture The Moment',
    detail: 'Describe the conflict, decision, or pressure point exactly as it happened.',
  },
  {
    n: '02',
    title: 'Reveal The Pattern',
    detail: 'Sovereign.os maps the baseline behavior driving the reaction under stress.',
  },
  {
    n: '03',
    title: 'Choose The Repair',
    detail: 'Get one grounded next move aligned with your design instead of impulse.',
  },
];

const VALUE_PILLARS = [
  {
    n: '01',
    title: 'Pattern-Native Intelligence',
    detail:
      'Sovereign.os interprets the baseline underneath your words, so guidance is anchored to design, not noise.',
  },
  {
    n: '02',
    title: 'Private By Default',
    detail:
      'Your spaces are designed for personal signal work, with explicit boundaries between reflection, decision, and repair.',
  },
  {
    n: '03',
    title: 'Action Over Abstraction',
    detail:
      'Every analysis resolves into one concrete next move you can take in the current moment.',
  },
] as const;

const TRUST_SIGNALS = [
  'Pattern-aware AI platform',
  'Private by design architecture',
  'Actionable guidance in minutes',
] as const;

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

function IntelligencePanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.18, ease }}
      className="relative w-full max-w-[420px]"
      aria-label="Sovereign intelligence panel"
    >
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 18,
          border: '1px solid rgba(224,116,58,0.2)',
          background: 'linear-gradient(165deg, rgba(22,18,18,0.86) 0%, rgba(14,12,13,0.9) 52%, rgba(10,9,11,0.95) 100%)',
          boxShadow: '0 38px 86px -42px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,241,229,0.16)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(224,116,58,0.06) 0 1px, transparent 1px 54px)',
            opacity: 0.09,
          }}
        />

        <div className="relative p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(244,239,233,0.72)' }}>
              Live AI Decision Engine
            </p>
            <span
              className="font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-1"
              style={{ borderRadius: 999, color: '#f0a16f', border: '1px solid rgba(224,116,58,0.28)', background: 'rgba(224,116,58,0.1)' }}
            >
              Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              ['Clarity', '94'],
              ['Signal', '88'],
              ['Drift', '06'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="px-3 py-2"
                style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.12em] mb-1" style={{ color: C.dim }}>{label}</p>
                <p className="font-mono text-[12px]" style={{ color: C.cream }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 mb-4">
            {[
              'Input: conflict message + emotional pressure context.',
              'Output: baseline pattern + best next response.',
            ].map((line, i) => (
              <div
                key={line}
                className="flex items-start gap-3 px-3 py-2.5"
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: i === 1 ? 'rgba(224,116,58,0.09)' : 'rgba(255,255,255,0.015)',
                }}
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: i === 1 ? '#e0743a' : 'rgba(255,255,255,0.32)' }} />
                <p className="text-[12px] leading-relaxed" style={{ color: i === 1 ? C.cream : '#b8b0a8' }}>{line}</p>
              </div>
            ))}
          </div>

          <div className="flex items-end gap-1.5 h-7">
            {[14, 18, 12, 22, 16, 20, 15, 19, 17, 24].map((h, i) => (
              <span
                key={i}
                className="flex-1"
                style={{
                  height: `${h}px`,
                  borderRadius: 3,
                  background: i > 7 ? 'linear-gradient(180deg, rgba(224,116,58,0.84), rgba(224,116,58,0.3))' : 'linear-gradient(180deg, rgba(244,239,233,0.34), rgba(244,239,233,0.1))',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
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
      {/* Ultra-minimal premium backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          ref={refs.imageOuterRef}
          className="absolute inset-0"
          style={{
            willChange: 'clip-path',
            background:
              'linear-gradient(138deg, rgba(7,7,9,0.99) 0%, rgba(12,10,12,0.97) 46%, rgba(7,7,9,0.99) 100%)',
          }}
        />

        <div
          ref={refs.imageDriftRef}
          className="hero-drift absolute inset-0"
        >
          <div
            className="absolute right-[6%] top-[7%] h-[86%] w-[38%]"
            style={{
              borderRadius: 34,
              border: '1px solid rgba(214,180,149,0.18)',
              background: 'linear-gradient(160deg, rgba(255,250,245,0.07) 0%, rgba(182,142,110,0.04) 44%, rgba(74,55,44,0.16) 100%)',
              boxShadow: '0 44px 88px -38px rgba(4,6,11,0.95), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          />

          <div
            className="absolute right-[22%] top-[17%] h-[64%] w-[20%]"
            style={{
              borderRadius: 26,
              border: '1px solid rgba(214,180,149,0.12)',
              background: 'linear-gradient(170deg, rgba(255,250,245,0.05), rgba(170,132,101,0.03) 52%, rgba(53,40,33,0.16) 100%)',
            }}
          />

          <div
            className="absolute right-[12%] top-[20%] h-[52%] w-[30%] min-w-[210px] max-w-[360px]"
            style={{
              borderRadius: 999,
              border: '1px solid rgba(244,212,182,0.24)',
              background:
                'radial-gradient(58% 58% at 50% 50%, rgba(224,116,58,0.18) 0%, rgba(224,116,58,0.06) 42%, rgba(8,7,10,0) 78%)',
              boxShadow: '0 34px 72px -38px rgba(224,116,58,0.65), inset 0 1px 0 rgba(255,248,240,0.34)',
            }}
          >
            <div
              className="absolute inset-[16%] rounded-full"
              style={{ border: '1px dashed rgba(244,212,182,0.22)' }}
            />
            <div
              className="absolute left-[47%] top-[47%] h-2.5 w-2.5 rounded-full"
              style={{ background: '#ffd7b9', boxShadow: '0 0 14px rgba(255,215,185,0.8)' }}
            />
            <div
              className="absolute left-[16%] top-[58%] h-1.5 w-1.5 rounded-full"
              style={{ background: 'rgba(255,234,216,0.7)' }}
            />
            <div
              className="absolute right-[16%] top-[30%] h-1.5 w-1.5 rounded-full"
              style={{ background: 'rgba(255,234,216,0.7)' }}
            />
          </div>

          <div
            ref={refs.lightBeamRef}
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(88% 72% at 82% 14%, rgba(228,157,103,0.18) 0%, rgba(154,104,71,0.08) 38%, transparent 65%)',
              mixBlendMode: 'screen',
              opacity: 0.72,
            }}
          />

          <div
            ref={refs.glowRef}
            className="absolute right-[6%] top-[7%] h-[86%] w-[38%]"
            style={{
              borderRadius: 34,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(250,223,196,0.2) 4%, rgba(255,255,255,0) 10%)',
              opacity: 0.68,
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(220,181,143,0.05) 0 1px, transparent 1px 58px)',
              opacity: 0.2,
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 92% at 92% 8%, rgba(244,201,165,0.12) 0%, transparent 54%)',
              opacity: 0.46,
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(8,7,10,0.96) 0%, rgba(8,7,10,0.9) 34%, rgba(8,7,10,0.46) 68%, rgba(8,7,10,0.2) 100%)',
            }}
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,7,10,0.04) 0%, rgba(8,7,10,0.18) 76%, rgba(8,7,10,0.38) 100%)',
          }}
        />
      </div>

      {/* Content — subtle x/y parallax, no 3D tilt */}
      <motion.div className="relative z-10 w-full" style={{ x: textX, y: textY }}>
        <Container className="py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] items-start gap-10 lg:gap-9">
            <div className="max-w-2xl">

              {/* Amber hairline */}
              <span
                aria-hidden
                style={{ display: 'block', width: 20, height: 1, background: `${C.amber}80`, marginBottom: '1rem' }}
              />

              {/* Eyebrow */}
              <p
                ref={refs.labelRef}
                className="font-mono text-[9px] uppercase tracking-[0.36em] mb-6"
                style={{ color: C.dim }}
              >
                Sovereign.os AI Platform
              </p>

              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5"
                style={{ borderRadius: 999, border: '1px solid rgba(224,116,58,0.24)', background: 'rgba(224,116,58,0.08)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#e0743a' }} />
                <span className="font-mono text-[8px] uppercase tracking-[0.12em]" style={{ color: '#f3c7a3' }}>
                  Pattern-aware AI reasoning
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-serif leading-[1.04] tracking-[-0.03em] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 6.4vw, 5rem)', color: C.cream }}
              >
                <span className="block overflow-hidden" style={{ lineHeight: 1.09 }}>
                  <span ref={refs.line1Ref} className="block" style={{ willChange: 'transform' }}>
                    AI operating system
                  </span>
                </span>
                <span className="block overflow-hidden" style={{ lineHeight: 1.09 }}>
                  <span ref={refs.line2Ref} className="block" style={{ willChange: 'transform' }}>
                    for pattern-aware
                  </span>
                </span>
                <span className="block overflow-hidden" style={{ lineHeight: 1.09 }}>
                  <span ref={refs.line3Ref} className="block" style={{ willChange: 'transform' }}>
                    decisions under pressure.
                  </span>
                </span>
              </h1>

              {/* Subtext */}
              <p
                ref={refs.subtextRef}
                className="mt-7 max-w-lg text-[14px] md:text-[15px] leading-[1.75]"
                style={{ color: '#aba096' }}
              >
                Sovereign.os turns your messages and decision context into pattern-level AI guidance, so you can see what is happening, why it repeats, and what to do next.
              </p>

              {/* Differentiator */}
              <p
                className="mt-5 max-w-sm font-mono text-[9px] md:text-[10px] leading-relaxed tracking-[0.1em] pl-3"
                style={{ color: '#877e76', borderLeft: `1px solid ${C.amberLine}` }}
              >
                How it works: capture the moment, model the baseline pattern, choose the best next response.
              </p>

              {/* CTA */}
              <div ref={refs.ctaRef} className="mt-9 md:mt-10 flex items-center gap-4 md:gap-5 flex-wrap">
                <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>
                  Guided onboarding · Free to start
                </span>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: '#8e867f' }}>
                Bring one real conversation, decision, or conflict. Get a concrete next move in minutes.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 max-w-xl">
                {TRUST_SIGNALS.map((signal) => (
                  <span
                    key={signal}
                    className="font-mono text-[8px] uppercase tracking-[0.12em] px-2.5 py-1"
                    style={{ borderRadius: 999, border: `1px solid ${C.rule}`, color: '#958d86', background: 'rgba(255,255,255,0.02)' }}
                  >
                    {signal}
                  </span>
                ))}
              </div>

              <div className="xl:hidden mt-8 grid grid-cols-3 gap-2.5 max-w-sm">
                {[
                  ['Clarity', '94'],
                  ['Signal', '88'],
                  ['Drift', '06'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="px-3 py-2"
                    style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] mb-1" style={{ color: '#847a72' }}>{label}</p>
                    <p className="font-mono text-[12px]" style={{ color: C.cream }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block lg:pt-12">
              <IntelligencePanel />
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
    <p className="font-mono text-[9px] uppercase tracking-[0.26em] mb-5" style={{ color: C.dim }}>
      {children}
    </p>
  );
}

// ── Spaces grid ───────────────────────────────────────────────────────────────
const [defrag, ...restSpaces] = SPACES;

function SpacesGrid() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-3">

      {/* Defrag — full-width featured */}
      <motion.a
        href={APP_URL}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease }}
        whileHover={prefersReducedMotion ? {} : { y: -2 }}
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
            whileHover={prefersReducedMotion ? {} : { y: -2 }}
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

function ProcessRail() {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {FLOW_STEPS.map((step, index) => (
        <motion.article
          key={step.n}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.45, delay: index * 0.07, ease }}
          className="p-5 md:p-6"
          style={{
            borderRadius: 14,
            border: `1px solid ${index === 1 ? C.amberLine : C.rule}`,
            background: index === 1 ? 'rgba(224,116,58,0.07)' : C.bgCard,
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] mb-3" style={{ color: index === 1 ? '#f3b88f' : C.dim }}>
            Step {step.n}
          </p>
          <h3 className="font-serif text-[23px] leading-tight mb-3" style={{ color: C.cream }}>
            {step.title}
          </h3>
          <p className="text-[13px] leading-[1.75]" style={{ color: C.mid }}>
            {step.detail}
          </p>
        </motion.article>
      ))}
    </div>
  );
}

function ValuePillars() {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {VALUE_PILLARS.map((pillar, index) => (
        <motion.article
          key={pillar.n}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.45, delay: index * 0.06, ease }}
          className="p-5 md:p-6"
          style={{
            borderRadius: 14,
            border: `1px solid ${index === 0 ? C.amberLine : C.rule}`,
            borderLeft: index === 0 ? '2px solid rgba(224,116,58,0.5)' : undefined,
            background: index === 0 ? 'rgba(224,116,58,0.06)' : C.bgCard,
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] mb-3" style={{ color: index === 0 ? '#f3b88f' : C.dim }}>
            Pillar {pillar.n}
          </p>
          <h3 className="font-serif text-[22px] leading-tight mb-3" style={{ color: C.cream }}>
            {pillar.title}
          </h3>
          <p className="text-[13px] leading-[1.75]" style={{ color: C.mid }}>
            {pillar.detail}
          </p>
        </motion.article>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <SiteShell entranceControlled>
      <Hero />

      {/* ── Value ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: 0.62, ease }}
        className="relative w-full py-20 md:py-28"
        style={{ background: C.bgLift, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <SectionLabel>What It Does</SectionLabel>
            <h2
              className="font-serif tracking-[-0.022em] leading-[1.07] max-w-2xl text-balance"
              style={{ fontSize: 'clamp(2rem, 4.8vw, 3.3rem)', color: C.cream }}
            >
              AI analysis for high-stakes moments.
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-[1.75]" style={{ color: C.mid }}>
              Sovereign.os reads behavioral signal beneath language and returns practical response guidance you can use immediately.
            </p>
          </div>
          <ValuePillars />
        </Container>
      </motion.section>

      {/* ── Baseline ──────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: 0.62, ease }}
        className="relative w-full py-20 md:py-28"
        style={{ background: C.bg, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <SectionLabel>How It Reasons</SectionLabel>
            <h2
              className="font-serif tracking-[-0.022em] leading-[1.07] max-w-2xl text-balance"
              style={{ fontSize: 'clamp(2rem, 4.8vw, 3.3rem)', color: C.cream }}
            >
              Baseline model + context + response guidance.
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-[1.75]" style={{ color: C.mid }}>
              The AI identifies recurring behavioral structure, then translates it into a cleaner next move.
            </p>
          </div>
          <BaselinePanel />
        </Container>
      </motion.section>

      {/* ── Pull Quote ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: 0.62, ease }}
        className="w-full py-18 md:py-24"
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
            Most AI answers the prompt.
            <br className="hidden md:block" />
            Sovereign.os maps the pattern behind it.
          </motion.blockquote>
        </Container>
      </motion.section>

      {/* ── Process ──────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: 0.62, ease }}
        className="relative w-full py-20 md:py-28"
        style={{ background: C.bg, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <SectionLabel>How It Works</SectionLabel>
            <h2
              className="font-serif tracking-[-0.022em] leading-[1.07] max-w-2xl text-balance"
              style={{ fontSize: 'clamp(2rem, 4.8vw, 3.3rem)', color: C.cream }}
            >
              From tension to repair.
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-[1.75]" style={{ color: C.mid }}>
              One sequence, repeated across relationships, decisions, and pressure.
            </p>
          </div>
          <ProcessRail />
        </Container>
      </motion.section>

      {/* ── Spaces ───────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: 0.62, ease }}
        className="relative w-full py-20 md:py-28"
        style={{ background: C.bg, borderTop: `1px solid ${C.rule}` }}
      >
        <Container>
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <SectionLabel>Product Spaces</SectionLabel>
            <h2
              className="font-serif tracking-[-0.022em] leading-[1.07] max-w-2xl text-balance"
              style={{ fontSize: 'clamp(2rem, 4.8vw, 3.3rem)', color: C.cream }}
            >
              Three AI workspaces. One operating system.
            </h2>
          </div>

          {SpacesGrid()}
        </Container>
      </motion.section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: 0.62, ease }}
        className="relative w-full py-24 md:py-32"
        style={{ background: C.bgLift, borderTop: `1px solid ${C.rule}` }}
      >
        <Container className="flex flex-col items-center text-center">
          <SectionLabel>Begin</SectionLabel>
          <h2
            className="font-serif tracking-[-0.024em] leading-[1.05] max-w-2xl text-balance"
            style={{ fontSize: 'clamp(2.2rem, 5.6vw, 4.4rem)', color: C.cream }}
          >
            Start with one moment.<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(244,239,233,0.7)' }}>
              Get AI guidance in minutes.
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
      </motion.section>
    </SiteShell>
  );
}
