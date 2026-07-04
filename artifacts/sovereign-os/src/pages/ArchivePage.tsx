import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type SpaceFilter = 'all' | 'defrag';

interface ArchiveItem {
  id:                string;
  space:             string;
  savedAt:           string;
  savedAtFull:       string;
  inputText:         string;
  activePattern:     string;
  whatsActive:       string;
  defenseMechanism:  string;
  resolutionSteps:   string[];
  bestNextResponse:  string;
  baselineTriggered: boolean;
}

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
  pattern: ArchiveItem;
  isLast: boolean;
  onClick: () => void;
  reducedMotion: boolean | null;
}) {
  return (
    <motion.button
      {...(!reducedMotion ? { layoutId: `row-${pattern.id}` } : {})}
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-1 py-4 text-left transition-colors duration-[350ms] ${
        isLast ? '' : 'border-b border-white/[0.08]'
      }`}
    >
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] group-hover:text-[#76716b] transition-colors duration-[350ms]">
          {fmtDate(pattern.savedAtFull)}
        </span>
        <span className="text-[14px] text-[#d4cec8] group-hover:text-[#f4efe9] font-sans leading-snug line-clamp-1 transition-colors duration-[350ms]">
          {pattern.whatsActive}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/55 group-hover:text-[#e0743a]/85 transition-colors duration-[350ms]">
          [{pattern.activePattern}]
        </span>
      </div>
      <svg
        width="7" height="12" viewBox="0 0 7 12" fill="none"
        className="shrink-0 text-white/[0.18] group-hover:text-[#e0743a]/45 transition-all duration-[350ms] group-hover:translate-x-[2px]"
      >
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
  pattern: ArchiveItem;
  onClose: () => void;
  reducedMotion: boolean | null;
}) {
  return (
    <>
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

// ── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <div className="border-t border-white/[0.06]">
      {[72, 58, 84, 65, 78].map((w, i) => (
        <div key={i} className="py-4 border-b border-white/[0.06] last:border-0 px-1">
          <div className="h-2 w-16 rounded-sm mb-2.5" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className={`h-3.5 rounded-sm mb-2`} style={{ width: `${w}%`, background: 'rgba(255,255,255,0.055)' }} />
          <div className="h-2 w-28 rounded-sm" style={{ background: 'rgba(224,116,58,0.1)' }} />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ isFiltered, search }: { isFiltered: boolean; search: string }) {
  if (isFiltered) {
    return (
      <div className="py-10 flex flex-col gap-2 border-t border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">[NO RESULTS]</p>
        <p className="text-[14px] text-[#76716b] font-sans">
          {search ? `Nothing matched "${search.slice(0, 40)}".` : 'No patterns match the current filter.'}
          {' '}Try different terms.
        </p>
      </div>
    );
  }
  return (
    <div className="py-10 flex flex-col gap-2 border-t border-white/[0.06]">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">[ARCHIVE EMPTY]</p>
      <p className="text-[14px] text-[#76716b] font-sans">
        Save a Defrag output to begin your pattern record.
      </p>
    </div>
  );
}

// ── Space filter pill ─────────────────────────────────────────────────────────
function SpacePill({
  value,
  active,
  label,
  onClick,
}: {
  value: SpaceFilter;
  active: boolean;
  label: string;
  onClick: (v: SpaceFilter) => void;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className="px-3.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-[0.14em] transition-all duration-200"
      style={{
        background: active ? 'rgba(224,116,58,0.14)' : 'rgba(255,255,255,0.04)',
        color: active ? 'rgba(224,116,58,0.9)' : '#4f4b47',
        boxShadow: active
          ? '0 0 0 1px rgba(224,116,58,0.22) inset'
          : '0 0 0 1px rgba(255,255,255,0.06) inset',
      }}
    >
      {label}
    </button>
  );
}

// ── Archive dashboard ─────────────────────────────────────────────────────────
interface FetchQuery { search: string; space: SpaceFilter; page: number; }

function ArchiveDashboard() {
  const [, setLocation] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Read initial values from URL
  const initParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const initSearch = initParams.get('q') ?? '';
  const initSpace: SpaceFilter =
    initParams.get('space') === 'defrag' ? 'defrag' : 'all';

  // ── Single query state — updates are atomic, eliminating double-fetch ────────
  // Changing search or space always resets page to 1 in one state update,
  // so the fetch effect runs exactly once per filter change.
  const [query, setQuery] = useState<FetchQuery>({
    search: initSearch,
    space:  initSpace,
    page:   1,
  });
  const { search: qs, space: qsp, page: qp } = query;

  // ── Separate searchInput for controlled typing (debounce delays query update)
  const [searchInput, setSearchInput] = useState(initSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── retryKey — incrementing forces a re-fetch with unchanged params ──────────
  const [retryKey, setRetryKey] = useState(0);

  // ── Results ────────────────────────────────────────────────────────────────
  const [items, setItems]     = useState<ArchiveItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'idle' | 'appending' | 'error'>('loading');
  const [selected, setSelected]   = useState<ArchiveItem | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Functional updater reads current space — no closure staleness
      setQuery(prev => ({ search: value, space: prev.space, page: 1 }));
    }, 300);
  }, []);

  const handleSpaceChange = useCallback((newSpace: SpaceFilter) => {
    setQuery(prev => ({ ...prev, space: newSpace, page: 1 }));
  }, []);

  // ── URL sync (q + space only — page is transient) ─────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (qs) params.set('q', qs);
    if (qsp !== 'all') params.set('space', qsp);
    const str = params.toString();
    setLocation(window.location.pathname + (str ? '?' + str : ''), { replace: true });
  }, [qs, qsp, setLocation]);

  // ── Fetch (one effect — deps are primitives, no double-trigger) ────────────
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isAppend = qp > 1;
    setLoadState(isAppend ? 'appending' : 'loading');

    const params = new URLSearchParams();
    params.set('page', String(qp));
    params.set('limit', '20');
    if (qs)  params.set('search', qs);
    if (qsp !== 'all') params.set('space', qsp);

    fetch(`/api/archive?${params.toString()}`, {
      credentials: 'include',
      signal:      controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json() as Promise<{ items: ArchiveItem[]; total: number; hasMore: boolean }>;
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setTotal(data.total);
        setHasMore(data.hasMore);
        if (isAppend) setItems(prev => [...prev, ...data.items]);
        else          setItems(data.items);
        setLoadState('idle');
      })
      .catch(err => {
        if ((err as Error).name === 'AbortError') return;
        if (!controller.signal.aborted) setLoadState('error');
      });

    return () => controller.abort();
  }, [qs, qsp, qp, retryKey]); // primitive deps — exactly one run per change

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  const isFiltered = qs !== '' || qsp !== 'all';
  const isEmpty    = loadState === 'idle' && items.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="font-serif text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight">
            Archive
          </h1>
          <p className="mt-1.5 text-[15px] text-[#76716b] font-sans">
            Your mapped patterns and historical baselines.
          </p>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              boxShadow:  '0 0 0 1px rgba(255,255,255,0.06) inset',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 text-[#4f4b47]">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search patterns..."
              className="flex-1 bg-transparent text-[13px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none"
              style={{ fontFamily: 'var(--app-font-sans)' }}
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => handleSearch('')}
                  className="text-[#4f4b47] hover:text-[#76716b] transition-colors font-mono text-[11px] shrink-0"
                >
                  ×
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Space filter pills */}
        <div className="px-4 pb-4 flex gap-2">
          <SpacePill value="all"    active={qsp === 'all'}    label="All"    onClick={handleSpaceChange} />
          <SpacePill value="defrag" active={qsp === 'defrag'} label="Defrag" onClick={handleSpaceChange} />
        </div>

        {/* List */}
        <div className="px-4 mb-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2 px-1">
            {loadState === 'loading'
              ? 'Loading\u2026'
              : isFiltered
              ? `Results \u2014 ${total}`
              : `Saved \u2014 ${total}`}
          </p>

          {loadState === 'loading' ? (
            <SkeletonRows />
          ) : isEmpty ? (
            <EmptyState isFiltered={isFiltered} search={qs} />
          ) : (
            <>
              <motion.div layout className="border-t border-white/[0.06]">
                <AnimatePresence initial={false}>
                  {items.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease }}
                    >
                      <ArchiveRow
                        pattern={p}
                        isLast={i === items.length - 1 && !hasMore}
                        onClick={() => setSelected(selected?.id === p.id ? null : p)}
                        reducedMotion={prefersReducedMotion}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Load more */}
              {hasMore && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => setQuery(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={loadState === 'appending'}
                    className="px-6 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      boxShadow:  '0 0 0 1px rgba(255,255,255,0.08) inset',
                      color:      '#76716b',
                    }}
                  >
                    {loadState === 'appending' ? 'Loading\u2026' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Error state */}
          {loadState === 'error' && (
            <div className="py-8 flex flex-col gap-2 border-t border-white/[0.06]">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-red-400/60">[LOAD FAILED]</p>
              <p className="text-[14px] text-[#76716b] font-sans">
                Could not load archive. Check your connection and try again.
              </p>
              <button
                onClick={() => setRetryKey(k => k + 1)} // always triggers re-fetch
                className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/60 hover:text-[#e0743a]/90 transition-colors text-left"
              >
                [RETRY]
              </button>
            </div>
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
