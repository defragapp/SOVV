import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';
import type { Person } from '@/components/spaces/types';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface AlignmentVector {
  theirPattern: string;
  yourResponse: string;
  yourAction:   string;
  /** The personId this vector was generated for — used to guard stale commits */
  forPersonId:  string;
  entryId?:     string;
  committedAt?: string;
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type CommitStatus = 'idle' | 'committing' | 'committed' | 'commit-error';

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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function VectorSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl ring-1 ring-inset ring-white/[0.05] overflow-hidden mb-4"
      style={{ background: '#1C1C1E' }}
    >
      <div className="px-5 py-5 border-b border-white/[0.06] flex flex-col gap-3">
        <div className="skeleton h-2.5 w-24 rounded" />
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-4/5 rounded" />
        <div className="skeleton h-3.5 w-3/5 rounded" />
      </div>
      <div className="px-5 py-5 flex flex-col gap-3">
        <div className="skeleton h-2.5 w-24 rounded" />
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-5/6 rounded" />
        <div className="skeleton h-3.5 w-2/3 rounded" />
        <div className="skeleton h-3 w-32 rounded mt-1" />
      </div>
    </motion.div>
  );
}

// ── Error card ────────────────────────────────────────────────────────────────
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3, ease }}
      className="rounded-2xl ring-1 ring-inset ring-red-500/20 px-5 py-5 mb-4 flex flex-col gap-3"
      style={{ background: 'rgba(239,68,68,0.06)' }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-red-400/70">
        [ERROR]
      </p>
      <p className="text-[13px] text-[#76716b] leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        className="self-start font-mono text-[9px] uppercase tracking-[0.16em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors"
      >
        Try again →
      </button>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ personName }: { personName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3, ease }}
      className="rounded-2xl ring-1 ring-inset ring-white/[0.05] px-5 py-6 mb-4 flex flex-col gap-3"
      style={{ background: '#1C1C1E' }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
        [NO CONTEXT]
      </p>
      <p className="text-[15px] text-[#76716b] leading-relaxed">
        No patterns recorded yet. Run a Defrag session first — Alignment draws from your existing pattern data
        {personName !== 'Self' ? ` for ${personName}` : ''}.
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4f4b47]">
        Complete your Baseline Design and at least one Defrag to begin.
      </p>
    </motion.div>
  );
}

// ── Idle / generate prompt ────────────────────────────────────────────────────
function IdlePrompt({ personName, onGenerate }: { personName: string; onGenerate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3, ease }}
      className="rounded-2xl ring-1 ring-inset ring-white/[0.05] px-5 py-6 mb-4 flex flex-col gap-4"
      style={{ background: '#1C1C1E' }}
    >
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">
          [RESPONSE VECTOR] — Ready
        </p>
        <p className="text-[14px] text-[#76716b] leading-relaxed">
          Generate a response vector for{' '}
          <span className="text-[#a8a29a]">{personName}</span>. Alignment draws
          from your Baseline Design and recent Defrag patterns to show what is yours to carry.
        </p>
      </div>
      <button
        onClick={onGenerate}
        className="self-start font-mono text-[10px] uppercase tracking-[0.16em] px-4 py-2.5 rounded-full transition-all"
        style={{
          background: 'rgba(224,116,58,0.12)',
          color:       '#e0743a',
          border:      '1px solid rgba(224,116,58,0.2)',
        }}
      >
        Generate Vector →
      </button>
    </motion.div>
  );
}

// ── Vector display ────────────────────────────────────────────────────────────
function VectorDisplay({
  vector,
  commitStatus,
  commitErrorMsg,
  onExpand,
  onCommit,
  ripple,
}: {
  vector:         AlignmentVector;
  commitStatus:   CommitStatus;
  commitErrorMsg: string;
  onExpand:       () => void;
  onCommit:       () => void;
  ripple:         boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const committed = commitStatus === 'committed';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35, ease }}
        className="rounded-2xl ring-1 ring-inset ring-white/[0.05] overflow-hidden mb-4"
        style={{ background: '#1C1C1E' }}
      >
        {/* Their Pattern block */}
        <motion.div layout className="px-5 py-5 border-b border-white/[0.06]">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">
            [THEIR PATTERN]
          </p>
          <p className="text-[15px] text-[#76716b] font-sans leading-relaxed">
            {vector.theirPattern}
          </p>
        </motion.div>

        {/* Your Response block — tap to expand */}
        <motion.button
          {...(!prefersReducedMotion ? { layoutId: 'response-block' } : {})}
          onClick={onExpand}
          className="w-full px-5 py-5 text-left transition-colors hover:bg-white/[0.02]"
          style={{ background: 'transparent' }}
          whileHover={prefersReducedMotion ? {} : { backgroundColor: 'rgba(224,116,58,0.03)' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70 mb-2">
            [YOUR RESPONSE]
          </p>
          <p className="text-[15px] text-[#f4efe9] font-sans leading-relaxed">
            {vector.yourResponse}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e0743a]/50">
            {vector.yourAction}
          </p>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] text-right">
            TAP TO FOCUS →
          </p>
        </motion.button>
      </motion.div>

      {/* [YOURS TO CARRY] status row */}
      <div className="flex items-center justify-between px-1 mb-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">
          [YOURS TO CARRY]
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background:  committed ? '#e0743a' : '#2a2826',
            boxShadow:   committed ? '0 0 6px rgba(224,116,58,0.6)' : 'none',
            transition:  'all 0.4s ease',
          }}
        />
      </div>

      {/* Commit bar */}
      <div className="px-0 pb-0">
        {commitStatus === 'commit-error' && (
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-red-400/70 mb-2 text-center">
            {commitErrorMsg || 'Commit failed. Please try again.'}
          </p>
        )}
        <div className="relative">
          <RippleRing animate={ripple} />
          <motion.button
            onClick={onCommit}
            disabled={committed || commitStatus === 'committing'}
            className="w-full py-4 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-default"
            style={{
              background:   committed ? 'rgba(224,116,58,0.12)' : commitStatus === 'commit-error' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color:        committed ? '#e0743a' : commitStatus === 'commit-error' ? 'rgba(252,165,165,0.9)' : '#f4efe9',
              boxShadow:    committed
                ? '0 0 0 1px rgba(224,116,58,0.2) inset'
                : commitStatus === 'commit-error'
                ? '0 0 0 1px rgba(239,68,68,0.2) inset'
                : '0 0 0 1px rgba(255,255,255,0.08) inset',
            }}
            whileTap={prefersReducedMotion || committed ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {commitStatus === 'committing'
              ? '[COMMITTING…]'
              : committed
              ? '[VECTOR COMMITTED]'
              : commitStatus === 'commit-error'
              ? 'Retry Commit'
              : 'Commit Response'}
          </motion.button>
        </div>
      </div>
    </>
  );
}

// ── Expanded overlay ──────────────────────────────────────────────────────────
function ExpandedOverlay({
  vector,
  onClose,
}: {
  vector:  AlignmentVector;
  onClose: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(8,7,10,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e0743a', boxShadow: '0 0 6px rgba(224,116,58,0.6)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70">[YOUR RESPONSE]</span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            [CLOSE]
          </button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-5">
          <p className="text-[18px] text-[#f4efe9] font-sans leading-relaxed">
            {vector.yourResponse}
          </p>
          <div className="pt-4 border-t border-white/[0.05]">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e0743a]/60 mb-1">
              The move
            </p>
            <p className="text-[17px] text-[#e0743a] font-sans font-medium">
              {vector.yourAction}
            </p>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">
            [YOURS TO CARRY]
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
function AlignmentDashboard({ person }: { person: Person }) {
  const [fetchStatus, setFetchStatus]   = useState<FetchStatus>('idle');
  const [commitStatus, setCommitStatus] = useState<CommitStatus>('idle');
  const [vector, setVector]             = useState<AlignmentVector | null>(null);
  const [errorMsg, setErrorMsg]         = useState('');
  const [commitErrorMsg, setCommitErrorMsg] = useState('');
  const [expanded, setExpanded]         = useState(false);
  const [ripple, setRipple]             = useState(false);
  // Persistent ref tracks the in-flight generate request so it can be aborted
  const generateAbortRef = useRef<AbortController | null>(null);
  // Live ref always reflects the current person — read after await to detect person switches
  const currentPersonIdRef = useRef(person.id);

  // Keep live ref in sync so commit() can detect person switches after await
  useEffect(() => { currentPersonIdRef.current = person.id; }, [person.id]);

  // Load committed state on mount / person change.
  // Aborts both the status fetch AND any in-flight generate for the prior person.
  useEffect(() => {
    setFetchStatus('idle');
    setVector(null);
    setCommitStatus('idle');
    setCommitErrorMsg('');
    setExpanded(false);

    // Cancel any in-flight generate for the previous person
    generateAbortRef.current?.abort();
    generateAbortRef.current = null;

    const personId = person.id;
    const statusController = new AbortController();

    fetch(`/api/alignment/status?personId=${encodeURIComponent(personId)}`, {
      credentials: 'include',
      signal: statusController.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (statusController.signal.aborted) return;
        if (data?.committed) {
          setVector({
            theirPattern: data.theirPattern,
            yourResponse: data.yourResponse,
            yourAction:   data.yourAction,
            forPersonId:  personId,
            entryId:      data.id,
            committedAt:  data.committedAt,
          });
          setFetchStatus('success');
          setCommitStatus('committed');
        }
        // else: leave as 'idle' — show generate prompt
      })
      .catch(err => {
        if ((err as Error).name === 'AbortError') return;
        // Network failure on status check — just show idle (generate button)
      });

    return () => {
      statusController.abort();
      // Also abort generate if still running when this person is unmounted/switched
      generateAbortRef.current?.abort();
      generateAbortRef.current = null;
    };
  }, [person.id]);

  const generate = useCallback(async () => {
    // Capture personId at call time — used to guard stale responses
    const personId   = person.id;
    const personName = person.name;

    // Cancel any prior in-flight request
    generateAbortRef.current?.abort();
    const controller = new AbortController();
    generateAbortRef.current = controller;

    setFetchStatus('loading');
    setErrorMsg('');
    setVector(null);
    setCommitStatus('idle');
    setCommitErrorMsg('');

    try {
      const r = await fetch('/api/alignment/generate', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal:      controller.signal,
        body:        JSON.stringify({ personId, personName }),
      });

      // Ignore response if a newer request has already replaced this one
      if (controller.signal.aborted) return;

      let data: Record<string, unknown> = {};
      const ct = r.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        data = await r.json() as Record<string, unknown>;
      }

      // Second abort check after JSON parse — a newer request may have fired during parse
      if (controller.signal.aborted) return;

      if (!r.ok) {
        if (r.status === 422 && (data.code as string) === 'NO_PATTERNS') {
          setFetchStatus('empty');
        } else {
          setErrorMsg((data.error as string) ?? 'Something went wrong. Please try again.');
          setFetchStatus('error');
        }
        return;
      }

      setVector({
        theirPattern: data.theirPattern as string,
        yourResponse: data.yourResponse as string,
        yourAction:   data.yourAction   as string,
        forPersonId:  personId,
      });
      setFetchStatus('success');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setErrorMsg('Network error. Please check your connection and try again.');
      setFetchStatus('error');
    }
  }, [person.id, person.name]);

  const commit = useCallback(async () => {
    if (!vector || (commitStatus !== 'idle' && commitStatus !== 'commit-error')) return;
    // Guard: only commit a vector that was generated for the current person
    if (vector.forPersonId !== person.id) return;

    // Capture person identity at call time — checked again after await to prevent
    // stale state writes if user switches person while request is in-flight
    const committingForPersonId = person.id;

    setCommitStatus('committing');
    setCommitErrorMsg('');

    try {
      const r = await fetch('/api/alignment/commit', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({
          personId:     person.id,
          personName:   person.name,
          theirPattern: vector.theirPattern,
          yourResponse: vector.yourResponse,
          yourAction:   vector.yourAction,
        }),
      });

      let data: Record<string, unknown> = {};
      const ct = r.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        data = await r.json() as Record<string, unknown>;
      }

      // Discard response if user switched to a different person mid-request.
      // Uses the live ref (not closure-captured person.id) to detect cross-render changes.
      if (committingForPersonId !== currentPersonIdRef.current) return;

      if (r.ok) {
        setVector(v => v ? { ...v, entryId: data.id as string, committedAt: data.committedAt as string } : v);
        setCommitStatus('committed');
        setRipple(true);
        setTimeout(() => setRipple(false), 900);
      } else {
        setCommitStatus('commit-error');
        setCommitErrorMsg((data.error as string) ?? 'Commit failed. Please try again.');
      }
    } catch {
      setCommitStatus('commit-error');
      setCommitErrorMsg('Network error. Please try again.');
    }
  }, [vector, commitStatus, person.id, person.name]);

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

        {/* Person context */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">
            [CONTEXT]
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b]">
            {person.name}
          </span>
        </div>

        {/* States */}
        <AnimatePresence mode="wait">
          {fetchStatus === 'idle' && (
            <IdlePrompt key="idle" personName={person.name} onGenerate={generate} />
          )}
          {fetchStatus === 'loading' && (
            <VectorSkeleton key="loading" />
          )}
          {fetchStatus === 'error' && (
            <ErrorCard key="error" message={errorMsg} onRetry={generate} />
          )}
          {fetchStatus === 'empty' && (
            <EmptyState key="empty" personName={person.name} />
          )}
          {fetchStatus === 'success' && vector && (
            <VectorDisplay
              key="success"
              vector={vector}
              commitStatus={commitStatus}
              commitErrorMsg={commitErrorMsg}
              onExpand={() => setExpanded(true)}
              onCommit={commit}
              ripple={ripple}
            />
          )}
        </AnimatePresence>
      </div>


      {/* Full-screen expanded overlay */}
      <AnimatePresence>
        {expanded && vector && (
          <ExpandedOverlay
            key="overlay"
            vector={vector}
            onClose={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function AlignmentPage() {
  const { isPremium } = useUserTier();
  const [selectedPerson, setSelectedPerson] = useState<Person>({
    id:       'self',
    name:     'Self',
    relation: 'self',
  });

  const sidebar = (
    <Sidebar
      onSelectPerson={setSelectedPerson}
      selectedPerson={selectedPerson}
    />
  );

  const main = isPremium ? (
    <AlignmentDashboard person={selectedPerson} />
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
        { id: 'context',   label: 'Context',   content: sidebar },
      ]}
    />
  );
}
