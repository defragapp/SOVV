import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';
import { useArchive } from '@/context/ArchiveContext';
import type { ArchivedPattern } from '@/context/ArchiveContext';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Format date ───────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

// ── Archive row ───────────────────────────────────────────────────────────────
function ArchiveRow({
  pattern,
  isLast,
  onClick,
  reducedMotion,
}: {
  pattern: ArchivedPattern;
  isLast: boolean;
  onClick: () => void;
  reducedMotion: boolean | null;
}) {
  return (
    <motion.button
      {...(!reducedMotion ? { layoutId: `row-${pattern.id}` } : {})}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-1 py-4 text-left transition-opacity hover:opacity-80 ${
        isLast ? '' : 'border-b border-white/[0.08]'
      }`}
    >
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-4">
        {/* Timestamp */}
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
          {fmtDate(pattern.savedAtFull)}
        </span>
        {/* Snippet */}
        <span className="text-[14px] text-[#d4cec8] font-sans leading-snug line-clamp-1">
          {pattern.whatsActive}
        </span>
        {/* Tag */}
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/60">
          [{pattern.activePattern}]
        </span>
      </div>
      {/* Chevron */}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0 text-white/20">
        <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}

// ── Detail overlay ────────────────────────────────────────────────────────────
function ArchiveDetail({
  pattern,
  onClose,
  reducedMotion,
}: {
  pattern: ArchivedPattern;
  onClose: () => void;
  reducedMotion: boolean | null;
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(8,7,10,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Morphed detail panel */}
      <motion.div
        key={`detail-${pattern.id}`}
        {...(!reducedMotion ? { layoutId: `row-${pattern.id}` } : {})}
        className="fixed inset-x-4 z-50 rounded-3xl ring-1 ring-inset ring-[#e0743a]/12 overflow-hidden"
        style={{
          background: 'rgba(8,7,10,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          top: '50%',
          translateY: '-50%',
        }}
        initial={reducedMotion ? { opacity: 0, scale: 0.96 } : undefined}
        animate={reducedMotion ? { opacity: 1, scale: 1 } : undefined}
        exit={reducedMotion ? { opacity: 0, scale: 0.96 } : { opacity: 0 }}
        transition={reducedMotion
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
              [{pattern.activePattern}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            [CLOSE]
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] mb-1.5">Saved</p>
            <p className="font-mono text-[11px] text-[#76716b]">{fmtDate(pattern.savedAtFull)}</p>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] mb-1.5">What Was Active</p>
            <p className="text-[15px] text-[#d4cec8] font-sans leading-relaxed">{pattern.whatsActive}</p>
          </div>

          {pattern.defenseMechanism && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] mb-1.5">Defense Mechanism</p>
              <p className="text-[15px] text-[#76716b] font-sans leading-relaxed">{pattern.defenseMechanism}</p>
            </div>
          )}

          {pattern.bestNextResponse && (
            <div className="border-t border-white/[0.05] pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/60 mb-1.5">Best Next Response</p>
              <p className="text-[14px] text-[#76716b] border-l border-[#e0743a]/25 pl-4 py-1 font-sans italic leading-relaxed">
                {pattern.bestNextResponse}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Archive dashboard ─────────────────────────────────────────────────────────
function ArchiveDashboard() {
  const { patterns } = useArchive();
  const [selected, setSelected] = useState<ArchivedPattern | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <h1 className="font-serif text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight">
            Archive
          </h1>
          <p className="mt-1.5 text-[15px] text-[#76716b] font-sans">
            Your mapped patterns and historical baselines.
          </p>
        </div>

        {/* Pattern list */}
        <div className="px-4 mb-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2 px-1">
            Saved — {patterns.length}
          </p>

          {patterns.length === 0 ? (
            <div className="py-10 flex flex-col gap-2 border-t border-white/[0.06]">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                [ARCHIVE EMPTY]
              </p>
              <p className="text-[14px] text-[#76716b] font-sans">
                Save a Defrag output to begin your pattern record.
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="border-t border-white/[0.06]"
            >
              <AnimatePresence initial={false}>
                {patterns.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <ArchiveRow
                      pattern={p}
                      isLast={i === patterns.length - 1}
                      onClick={() => setSelected(selected?.id === p.id ? null : p)}
                      reducedMotion={prefersReducedMotion}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {selected && (
          <ArchiveDetail
            key={selected.id}
            pattern={selected}
            onClose={() => setSelected(null)}
            reducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function ArchivePage() {
  const { isPremium } = useUserTier();

  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = isPremium ? (
    <ArchiveDashboard />
  ) : (
    <PremiumGate
      space="Archive"
      tagline="Your pattern memory."
      description="Save Defrag outputs and track how your relational patterns shift over time. Available on Pro."
    />
  );

  return (
    <SpaceShell
      spaceName="Archive"
      sidebar={sidebar}
      main={main}
      mobileTabs={[
        { id: 'archive', label: 'Archive', content: main },
        { id: 'context', label: 'Context', content: sidebar },
      ]}
    />
  );
}
