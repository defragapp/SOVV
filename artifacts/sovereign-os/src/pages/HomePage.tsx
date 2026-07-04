import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { SiteShell } from '@/components/marketing/site-shell';
import { Container } from '@/components/ui/layout-primitives';
import { useHeroEntrance } from '@/hooks/useHeroEntrance';

const ease = [0.16, 1, 0.3, 1] as const;
const APP_URL = '/app/login';
const sectionViewport = { once: true, margin: '-90px' } as const;

const C = {
  bg: '#08070a',
  bgLift: '#0e0c10',
  bgCard: '#121016',
  cream: '#f4efe9',
  mid: '#76716b',
  dim: '#4f4b47',
  amber: '#e0743a',
  amberLine: 'rgba(224,116,58,0.18)',
  amberFill: 'rgba(224,116,58,0.09)',
  rule: 'rgba(255,255,255,0.055)',
} as const;

const BASELINE_FACTS = [
  { text: 'You process conflict through withdrawal before re-engagement.', chips: ['Defense', 'Delay'] },
  { text: 'Boundaries collapse under sustained pressure from authority figures.', chips: ['Pattern', 'Role'] },
  { text: 'You repair through over-explanation rather than silence.', chips: ['Repair'] },
] as const;

const FLOW_STEPS = [
  {
    n: '01',
    title: 'Capture the moment',
    detail: 'Describe the conflict, decision, or pressure point exactly as it happened.',
  },
  {
    n: '02',
    title: 'Reveal the pattern',
    detail: 'Sovereign.os maps baseline behavior under stress instead of only parsing words.',
  },
  {
    n: '03',
    title: 'Choose the repair',
    detail: 'Get one grounded next move aligned with your design instead of impulse.',
  },
] as const;

const SPACES = [
  {
    id: 'defrag',
    n: '01',
    label: 'Defrag',
    tier: 'Free',
    description: "Untangle the moment. See what is happening, what pattern is forming, and what changes it.",
  },
  {
    id: 'alignment',
    n: '02',
    label: 'Alignment',
    tier: 'Pro',
    description: 'Choose the cleaner move. Separate what is yours from what is not and respond without self-betrayal.',
  },
  {
    id: 'covenant',
    n: '03',
    label: 'Covenant',
    tier: 'Pro',
    description: 'Integrate the lesson. Step back and map the larger pattern shaping the relationship.',
  },
] as const;

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

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-[0.26em] mb-5" style={{ color: C.dim }}>
      {children}
    </p>
  );
}

const TABS = [
  { id: 'design' as const, label: 'Design' },
  { id: 'context' as const, label: 'Context' },
] as const;
type TabId = typeof TABS[number]['id'];

function BaselinePanel() {
  const [active, setActive] = useState<TabId>('design');

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const idx = TABS.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(TABS[(idx + 1) % TABS.length].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(TABS[(idx - 1 + TABS.length) % TABS.length].id);
    }
  }, [active]);

  return (
    <div className="relative w-full">
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 16,
          border: `1px solid ${C.amberLine}`,
          background: C.bgLift,
          boxShadow: '0 40px 80px -24px rgba(0,0,0,0.7)',
        }}
      >
        <div
          role="tablist"
          aria-label="Baseline panel views"
          className="flex items-center px-5 gap-5 shrink-0"
          style={{ height: 44, borderBottom: `1px solid ${C.rule}`, background: 'rgba(8,7,10,0.8)' }}
          onKeyDown={handleKeyDown}
        >
          {TABS.map((tab) => (
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

        <AnimatePresence mode="wait">
          {active === 'design' && (
            <motion.div
              key="design"
              role="tabpanel"
              id="baseline-panel-design"
              aria-labelledby="baseline-tab-design"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-5">
                {BASELINE_FACTS.map((fact, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4 py-4"
                    style={{ borderBottom: i < 2 ? `1px solid ${C.rule}` : 'none' }}
                  >
                    <p className="flex-1 text-[13px] leading-relaxed" style={{ color: '#a8a29a' }}>{fact.text}</p>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {fact.chips.map((c) => (
                        <span
                          key={c}
                          className="font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5"
                          style={{ color: C.dim, border: `1px solid ${C.rule}`, borderRadius: 3 }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-5 mb-5 pt-4" style={{ borderTop: `1px solid ${C.amberLine}` }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: C.amber }}>
                  Best next response
                </p>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: C.cream }}>Pause before repair</p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>
                  Hold the impulse to fix immediately. Name what you noticed before responding.
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.rule}` }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: C.dim }}>
                  What is active
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#d4cec8' }}>
                  Accumulated pressure is seeking relief through the relationship. The pattern is old, not random.
                </p>
              </div>
              <div className="px-5 py-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: `${C.amber}99` }}>
                  Best next response
                </p>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#a8a29a' }}>Pause before repair</p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>
                  Name what happened first. Repair after signal, not during reactivity.
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
      className="relative w-full max-w-[440px]"
      aria-label="Sovereign intelligence panel"
    >
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 20,
          border: '1px solid rgba(224,116,58,0.26)',
          background: 'linear-gradient(166deg, rgba(24,19,19,0.9) 0%, rgba(13,11,12,0.94) 50%, rgba(8,7,9,0.98) 100%)',
          boxShadow: '0 48px 98px -46px rgba(0,0,0,0.98), inset 0 1px 0 rgba(255,241,229,0.18)',
        }}
      >
        <div className="relative p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(244,239,233,0.72)' }}>
              Live AI decision engine
            </p>
            <span
              className="font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-1"
              style={{ borderRadius: 999, color: '#f0a16f', border: '1px solid rgba(224,116,58,0.28)', background: 'rgba(224,116,58,0.1)' }}
            >
              Live
            </span>
          </div>

          <div
            className="p-3.5"
            style={{ borderRadius: 12, border: '1px solid rgba(224,116,58,0.26)', background: 'linear-gradient(145deg, rgba(224,116,58,0.16), rgba(224,116,58,0.05) 55%, rgba(255,255,255,0.02))' }}
          >
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] mb-2" style={{ color: '#f5c8a3' }}>Best next response</p>
            <p className="text-[14px] leading-relaxed" style={{ color: '#f4efe9' }}>
              Pause first. Name the pressure pattern. Then choose one clean sentence.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              ['Clarity', '94'],
              ['Signal', '88'],
              ['Drift', '06'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="px-3 py-2"
                style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)' }}
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.12em] mb-1" style={{ color: C.dim }}>{label}</p>
                <p className="font-mono text-[12px]" style={{ color: C.cream }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function IntelligencePanelCompact() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12, ease }}
      className="w-full max-w-[340px]"
      aria-label="Sovereign compact intelligence panel"
    >
      <div
        className="p-4"
        style={{
          borderRadius: 14,
          border: '1px solid rgba(224,116,58,0.24)',
          background: 'linear-gradient(160deg, rgba(22,18,18,0.9), rgba(10,9,11,0.96))',
          boxShadow: '0 26px 54px -34px rgba(0,0,0,0.96), inset 0 1px 0 rgba(255,241,229,0.14)',
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: '#cbc2b9' }}>
            Live AI decision engine
          </p>
          <span
            className="font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-0.5"
            style={{ borderRadius: 999, color: '#f0a16f', border: '1px solid rgba(224,116,58,0.28)', background: 'rgba(224,116,58,0.1)' }}
          >
            Live
          </span>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#e2dad3' }}>
          Best next response: pause first, name the pattern, then choose one clean sentence.
        </p>
      </div>
    </motion.aside>
  );
}

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
      className="relative w-full min-h-[84svh] flex items-center overflow-hidden"
      style={{ background: C.bg }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          ref={refs.imageOuterRef}
          className="absolute inset-0"
          style={{
            willChange: 'clip-path',
            background: 'linear-gradient(138deg, rgba(7,7,9,0.99) 0%, rgba(12,10,12,0.97) 46%, rgba(7,7,9,0.99) 100%)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,7,10,0.04) 0%, rgba(8,7,10,0.22) 80%, rgba(8,7,10,0.4) 100%)' }} />
      </div>

      <motion.div className="relative z-10 w-full" style={{ x: textX, y: textY }}>
        <Container className="py-18 md:py-22">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_440px] items-center gap-8 md:gap-7 xl:gap-10">
            <div className="max-w-2xl">
              <span aria-hidden style={{ display: 'block', width: 20, height: 1, background: `${C.amber}80`, marginBottom: '1rem' }} />
              <p ref={refs.labelRef} className="font-mono text-[9px] uppercase tracking-[0.34em] mb-6" style={{ color: C.dim }}>
                Sovereign.os AI platform
              </p>

              <h1 className="font-serif leading-[1.04] tracking-[-0.03em] text-balance" style={{ fontSize: 'clamp(2.3rem, 6vw, 4.6rem)', color: C.cream }}>
                <span className="block overflow-hidden" style={{ lineHeight: 1.08 }}>
                  <span ref={refs.line1Ref} className="block" style={{ willChange: 'transform' }}>Pattern-aware AI</span>
                </span>
                <span className="block overflow-hidden" style={{ lineHeight: 1.08 }}>
                  <span ref={refs.line2Ref} className="block" style={{ willChange: 'transform' }}>for relationships</span>
                </span>
                <span className="block overflow-hidden" style={{ lineHeight: 1.08 }}>
                  <span ref={refs.line3Ref} className="block" style={{ willChange: 'transform' }}>under pressure.</span>
                </span>
              </h1>

              <p ref={refs.subtextRef} className="mt-7 max-w-lg text-[15px] leading-[1.75]" style={{ color: '#aba096' }}>
                Bring one real conversation. Sovereign.os identifies the repeating pattern and gives one practical next move that repairs instead of escalates.
              </p>

              <div ref={refs.ctaRef} className="mt-9 flex items-center gap-4 md:gap-5 flex-wrap">
                <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>
                  Private by design · Free to start
                </span>
              </div>
            </div>

            <div className="hidden md:block xl:hidden md:justify-self-end">
              <IntelligencePanelCompact />
            </div>

            <div className="hidden xl:block">
              <IntelligencePanel />
            </div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}

function ProofSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={sectionViewport}
      transition={{ duration: 0.62, ease }}
      className="relative w-full py-16 md:py-20"
      style={{ background: C.bgLift, borderTop: `1px solid ${C.rule}` }}
    >
      <Container>
        <div className="flex flex-col items-center text-center mb-10 md:mb-12">
          <SectionLabel>Proof</SectionLabel>
          <h2 className="font-serif tracking-[-0.022em] leading-[1.07] max-w-2xl text-balance" style={{ fontSize: 'clamp(2rem, 4.8vw, 3.2rem)', color: C.cream }}>
            One model. One sequence. One better next move.
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.75]" style={{ color: C.mid }}>
            This is the core product proof: baseline interpretation plus response guidance, translated into action in under a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 lg:gap-5 items-start">
          <BaselinePanel />

          <div className="space-y-3">
            {FLOW_STEPS.map((step, index) => (
              <motion.article
                key={step.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.45, delay: index * 0.07, ease }}
                className="p-4"
                style={{
                  borderRadius: 12,
                  border: `1px solid ${index === 1 ? C.amberLine : C.rule}`,
                  background: index === 1 ? 'rgba(224,116,58,0.08)' : C.bgCard,
                }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] mb-2" style={{ color: index === 1 ? '#f3b88f' : C.dim }}>
                  Step {step.n}
                </p>
                <h3 className="font-serif text-[20px] leading-tight mb-2" style={{ color: C.cream }}>
                  {step.title}
                </h3>
                <p className="text-[13px] leading-[1.75]" style={{ color: C.mid }}>
                  {step.detail}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </Container>
    </motion.section>
  );
}

function SpacesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={sectionViewport}
      transition={{ duration: 0.62, ease }}
      className="relative w-full py-20 md:py-24"
      style={{ background: C.bg, borderTop: `1px solid ${C.rule}` }}
    >
      <Container>
        <div className="flex flex-col items-center text-center mb-10 md:mb-12">
          <SectionLabel>Product Spaces</SectionLabel>
          <h2 className="font-serif tracking-[-0.022em] leading-[1.07] max-w-2xl text-balance" style={{ fontSize: 'clamp(2rem, 4.8vw, 3.2rem)', color: C.cream }}>
            Three workspaces. One operating system.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {SPACES.map((s, i) => (
            <motion.a
              key={s.id}
              href={APP_URL}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06, ease }}
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              className="flex items-start justify-between gap-8 p-6 md:p-7 cursor-pointer"
              style={{
                background: C.bgCard,
                border: `1px solid ${s.id === 'defrag' ? C.amberLine : C.rule}`,
                borderLeft: s.id === 'defrag' ? '2px solid rgba(224,116,58,0.55)' : undefined,
                borderRadius: 14,
              }}
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="font-mono text-[10px] tracking-[0.06em]" style={{ color: s.id === 'defrag' ? `${C.amber}66` : 'rgba(255,255,255,0.12)' }}>
                    {s.n}
                  </span>
                  <h3 className="font-serif text-[20px] font-normal" style={{ color: C.cream }}>
                    {s.label}
                  </h3>
                </div>
                <p className="text-[14px] leading-[1.75] max-w-2xl" style={{ color: C.mid }}>
                  {s.description}
                </p>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] shrink-0 pt-0.5" style={{ color: C.dim }}>
                {s.tier}
              </span>
            </motion.a>
          ))}
        </div>
      </Container>
    </motion.section>
  );
}

function FinalCtaSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={sectionViewport}
      transition={{ duration: 0.62, ease }}
      className="relative w-full py-24 md:py-30"
      style={{ background: C.bgLift, borderTop: `1px solid ${C.rule}` }}
    >
      <Container className="flex flex-col items-center text-center">
        <SectionLabel>Begin</SectionLabel>
        <h2 className="font-serif tracking-[-0.024em] leading-[1.05] max-w-2xl text-balance" style={{ fontSize: 'clamp(2.2rem, 5.4vw, 4.2rem)', color: C.cream }}>
          Start with one moment.
          <br />
          Get guidance in minutes.
        </h2>
        <p className="mt-6 max-w-md text-[14px] leading-[1.75]" style={{ color: C.mid }}>
          Bring a real message or decision. Sovereign.os returns one next step that protects clarity and relationship integrity.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <GhostCta href={APP_URL}>Enter Sovereign.os</GhostCta>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.dim }}>
            Private by design · Free to start
          </p>
        </div>
      </Container>
    </motion.section>
  );
}

export function HomePage() {
  return (
    <SiteShell entranceControlled>
      <Hero />
      <ProofSection />
      <SpacesSection />
      <FinalCtaSection />
    </SiteShell>
  );
}
