import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Mock scenario ─────────────────────────────────────────────────────────────
const MOCK_VECTOR = {
  theirPattern: {
    label: 'Their Pattern',
    tag: 'THEIR PATTERN',
    text: 'Sustained over-explanation of intent without pausing to register impact. Deflection from accountability through re-contextualisation of events.',
  },
  yourResponse: {
    label: 'Your Response',
    tag: 'YOUR RESPONSE',
    text: 'Name the pattern once, cleanly. "I notice we are still on how it was meant rather than what it landed as." Do not expand. Hold the pause.',
    action: 'State it. Then stop.',
  },
};

// ── Commit ripple animation ───────────────────────────────────────────────────
function RippleRing({ animate }: { animate: boolean }) {
  return (
    <AnimatePresence>
      {animate && (
        <>
          {[0, 1].map(i => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 + i * 0.25 }}
              exit={{}}
              transition={{ duration: 0.6 + i * 0.15, ease: [0, 0.55, 0.45, 1], delay: i * 0.08 }}
              style={{ border: '1.5px solid rgba(224,116,58,0.7)' }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

// ── Lens card ─────────────────────────────────────────────────────────────────
function AlignmentDashboard() {
  const [expanded, setExpanded] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [ripple, setRipple] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCommit = () => {
    if (committed) return;
    setCommitted(true);
    setRipple(true);
    setTimeout(() => setRipple(false), 900);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable main */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Space header */}
        <div className="pt-6 pb-5">
          <h1 className="font-serif text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight">
            Alignment
          </h1>
          <p className="mt-1.5 text-[15px] text-[#76716b] font-sans">
            What is yours to carry. The cleaner move.
          </p>
        </div>

        {/* Active Lens */}
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2 px-1">
          [RESPONSE VECTOR] — Active
        </p>

        <motion.div
          layout
          className="rounded-2xl ring-1 ring-inset ring-white/[0.05] overflow-hidden mb-4"
          style={{ background: '#1C1C1E' }}
        >
          {/* Their Pattern block */}
          <motion.div layout className="px-5 py-5 border-b border-white/[0.06]">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">
              [{MOCK_VECTOR.theirPattern.tag}]
            </p>
            <motion.p
              layout
              className="text-[15px] text-[#76716b] font-sans leading-relaxed"
            >
              {MOCK_VECTOR.theirPattern.text}
            </motion.p>
          </motion.div>

          {/* Your Response block — tap to expand (layoutId morph or fade depending on reduced motion) */}
          <motion.button
            {...(!prefersReducedMotion ? { layoutId: 'response-block' } : {})}
            onClick={() => setExpanded(true)}
            className="w-full px-5 py-5 text-left transition-colors hover:bg-white/[0.02]"
            style={{ background: 'transparent' }}
            whileHover={prefersReducedMotion ? {} : { backgroundColor: 'rgba(224,116,58,0.03)' }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70 mb-2">
              [{MOCK_VECTOR.yourResponse.tag}]
            </p>
            <p className="text-[15px] text-[#f4efe9] font-sans leading-relaxed">
              {MOCK_VECTOR.yourResponse.text}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e0743a]/50">
              {MOCK_VECTOR.yourResponse.action}
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] text-right">
              TAP TO FOCUS →
            </p>
          </motion.button>
        </motion.div>

        {/* [YOURS TO CARRY] attribution */}
        <div className="flex items-center justify-between px-1 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">
            [YOURS TO CARRY]
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: committed ? '#e0743a' : '#2a2826', boxShadow: committed ? '0 0 6px rgba(224,116,58,0.6)' : 'none', transition: 'all 0.4s ease' }}
          />
        </div>
      </div>

      {/* Commit action bar — safe-area clearance for FloatingNav */}
      <div
        className="px-4 pb-4 pt-2 shrink-0 lg:pb-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
      >
        <div className="relative">
          <RippleRing animate={ripple} />
          <motion.button
            onClick={handleCommit}
            disabled={committed}
            className="w-full py-4 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-default"
            style={{
              background: committed ? 'rgba(224,116,58,0.12)' : 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: committed ? '#e0743a' : '#f4efe9',
              boxShadow: committed
                ? '0 0 0 1px rgba(224,116,58,0.2) inset'
                : '0 0 0 1px rgba(255,255,255,0.08) inset',
            }}
            whileTap={prefersReducedMotion || committed ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {committed ? '[VECTOR COMMITTED]' : 'Commit Response'}
          </motion.button>
        </div>
      </div>

      {/* ── Full-screen layoutId expansion ── */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(8,7,10,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              onClick={() => setExpanded(false)}
            />

            {/* Morphed response panel — spatial morph when motion OK, plain fade when reduced */}
            <motion.div
              key="expanded-response"
              {...(!prefersReducedMotion ? { layoutId: 'response-block' } : {})}
              className="fixed inset-x-4 top-[50%] z-50 -translate-y-1/2 rounded-2xl ring-1 ring-inset ring-white/[0.08] overflow-hidden"
              style={{ background: '#1C1C1E', translateY: '-50%' }}
              initial={{ opacity: prefersReducedMotion ? 0 : 1, scale: prefersReducedMotion ? 0.96 : 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: prefersReducedMotion ? 0.96 : 1 }}
              transition={prefersReducedMotion
                ? { duration: 0.2, ease: 'easeOut' }
                : { type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#e0743a', boxShadow: '0 0 6px rgba(224,116,58,0.6)' }}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70">
                    [{MOCK_VECTOR.yourResponse.tag}]
                  </span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 flex flex-col gap-5">
                <p className="text-[18px] text-[#f4efe9] font-sans leading-relaxed">
                  {MOCK_VECTOR.yourResponse.text}
                </p>
                <div className="pt-4 border-t border-white/[0.05]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e0743a]/60 mb-1">
                    The move
                  </p>
                  <p className="text-[17px] text-[#e0743a] font-sans font-medium">
                    {MOCK_VECTOR.yourResponse.action}
                  </p>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">
                  [YOURS TO CARRY]
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function AlignmentPage() {
  const { isPremium } = useUserTier();

  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = isPremium ? (
    <AlignmentDashboard />
  ) : (
    <PremiumGate
      space="Alignment"
      tagline="Response integration. Action choice."
      description="Alignment shows you what is yours to carry and what belongs to the other side. Available on Pro."
    />
  );

  return (
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebar}
      main={main}
      mobileTabs={[
        { id: 'alignment', label: 'Alignment', content: main },
        { id: 'context', label: 'Context', content: sidebar },
      ]}
    />
  );
}
