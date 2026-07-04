import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';
import { setLocalPremium } from '@/lib/tier';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Covenant {
  id: string;
  relationship: string;
  boundary: string;
  trigger: string;
  sealed: string; // ISO date string
}

type SuggestStatus = 'idle' | 'loading' | 'error';

// ── Covenant list row ─────────────────────────────────────────────────────────
function CovenantRow({
  covenant,
  isLast,
  onClick,
}: {
  covenant: Covenant;
  isLast: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-1 py-4 text-left transition-colors duration-[350ms] ${
        isLast ? '' : 'border-b border-white/[0.08]'
      }`}
    >
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-4">
        <span className="text-[14px] text-[#d4cec8] group-hover:text-[#f4efe9] font-sans leading-tight truncate transition-colors duration-[350ms]">
          {covenant.relationship}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/55 group-hover:text-[#e0743a]/85 transition-colors duration-[350ms]">
          [{covenant.trigger}]
        </span>
      </div>
      {/* Chevron */}
      <svg
        width="7" height="12" viewBox="0 0 7 12" fill="none"
        className="shrink-0 text-white/[0.18] group-hover:text-[#e0743a]/45 transition-all duration-[350ms] group-hover:translate-x-[2px]"
      >
        <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ── Covenant detail overlay ───────────────────────────────────────────────────
function CovenantDetail({
  covenant,
  onClose,
}: {
  covenant: Covenant;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease }}
      className="rounded-2xl ring-1 ring-inset ring-white/[0.07] overflow-hidden mx-4 mb-4"
      style={{ background: 'rgba(8,7,10,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#e0743a', boxShadow: '0 0 5px rgba(224,116,58,0.6)' }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70">
            [ACTIVE COVENANT]
          </span>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
        >
          [CLOSE]
        </button>
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] mb-1.5">Relationship</p>
          <p className="text-[15px] text-[#f4efe9] font-sans">{covenant.relationship}</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] mb-1.5">Structural Boundary</p>
          <p className="text-[15px] text-[#d4cec8] leading-relaxed font-sans">{covenant.boundary}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
            Sealed {covenant.sealed}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/50">
            [BOUNDARY SET]
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Pulsing indicator ─────────────────────────────────────────────────────────
function PulseDot() {
  return (
    <span className="inline-flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="inline-block w-1 h-1 rounded-full"
          style={{ background: 'rgba(224,116,58,0.6)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

// ── Drafting engine ───────────────────────────────────────────────────────────
function DraftingEngine({ onSeal }: { onSeal: (c: Omit<Covenant, 'id' | 'sealed'>) => void }) {
  const [relationship, setRelationship] = useState('');
  const [boundary, setBoundary]         = useState('');
  const [focusedField, setFocusedField] = useState<'relationship' | 'boundary' | null>(null);
  const [suggestStatus, setSuggestStatus] = useState<SuggestStatus>('idle');
  const [suggestError, setSuggestError]   = useState('');
  const suggestAbortRef            = useRef<AbortController | null>(null);
  // Live ref tracks current relationship so stale responses can be discarded
  const currentRelationshipRef     = useRef(relationship);

  // Keep live ref in sync so stale responses can detect relationship changes
  useEffect(() => { currentRelationshipRef.current = relationship; }, [relationship]);

  // Cancel any in-flight suggestion on unmount
  useEffect(() => () => { suggestAbortRef.current?.abort(); }, []);

  const isActive = relationship.trim().length > 0 || boundary.trim().length > 0;
  const canSeal  = relationship.trim().length > 0 && boundary.trim().length > 0;
  const canSuggest = relationship.trim().length > 0 && suggestStatus !== 'loading';

  const handleSuggest = useCallback(async () => {
    if (!canSuggest) return;

    // Capture input snapshot — used to discard stale responses if user edits relationship mid-flight
    const capturedRelationship = relationship.trim();
    const capturedDynamic      = boundary.trim() || undefined;

    // Cancel any prior in-flight suggestion
    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    setSuggestStatus('loading');
    setSuggestError('');

    try {
      const r = await fetch('/api/covenants/suggest', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal:      controller.signal,
        body:        JSON.stringify({ relationship: capturedRelationship, dynamic: capturedDynamic }),
      });

      // After every await, verify this is still the active request before touching state
      if (suggestAbortRef.current !== controller) return;

      let data: Record<string, unknown> = {};
      const ct = r.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        data = await r.json() as Record<string, unknown>;
      }

      if (suggestAbortRef.current !== controller) return;

      // Staleness check — discard if relationship changed since this request was fired
      if (capturedRelationship !== currentRelationshipRef.current.trim()) {
        setSuggestStatus('idle');
        return;
      }

      if (!r.ok) {
        setSuggestStatus('error');
        setSuggestError((data.error as string) ?? 'Generation failed. Please try again.');
        return;
      }

      const suggested = data.boundary as string;
      if (typeof suggested === 'string' && suggested.trim()) {
        setBoundary(suggested.trim());
        setSuggestStatus('idle');
      } else {
        setSuggestStatus('error');
        setSuggestError('Unexpected response format. Please try again.');
      }
      // Mark controller as finished to prevent stale state writes from any residual paths
      suggestAbortRef.current = null;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      // Only surface error if this request is still active
      if (suggestAbortRef.current === controller) {
        setSuggestStatus('error');
        setSuggestError('Network error. Please check your connection and try again.');
        suggestAbortRef.current = null;
      }
    }
  }, [canSuggest, relationship, boundary]);

  const handleSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSeal) return;
    // Cancel any in-flight suggestion on seal
    suggestAbortRef.current?.abort();
    onSeal({
      relationship: relationship.trim(),
      boundary:     boundary.trim(),
      trigger:      'USER DEFINED',
    });
    setRelationship('');
    setBoundary('');
    setSuggestStatus('idle');
    setSuggestError('');
  };

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <form onSubmit={handleSeal}>
        <div className="overflow-hidden">
          {/* Relationship input */}
          <div
            className="border-b transition-colors duration-700"
            style={{ borderColor: focusedField === 'relationship' ? 'rgba(224,116,58,0.45)' : 'rgba(255,255,255,0.05)' }}
          >
            <input
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="Target relationship or dynamic..."
              className="w-full px-5 pt-5 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] placeholder:transition-opacity placeholder:duration-500 focus:placeholder:opacity-40 outline-none border-none"
              style={{ fontFamily: 'var(--app-font-sans)' }}
              onFocus={() => setFocusedField('relationship')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          {/* Generate draft button — visible once relationship has content */}
          <AnimatePresence>
            {relationship.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    {suggestStatus === 'loading' && <PulseDot />}
                    {suggestStatus === 'error' && (
                      <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-red-400/70 max-w-[200px] truncate">
                        {suggestError}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSuggest}
                    disabled={!canSuggest}
                    className="font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-200 disabled:opacity-40"
                    style={{ color: suggestStatus === 'loading' ? 'rgba(224,116,58,0.4)' : 'rgba(224,116,58,0.75)' }}
                  >
                    {suggestStatus === 'loading' ? 'Generating…' : 'Generate draft →'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boundary textarea */}
          <div
            className="border-b transition-colors duration-700"
            style={{ borderColor: focusedField === 'boundary' ? 'rgba(224,116,58,0.45)' : suggestStatus === 'loading' ? 'rgba(224,116,58,0.15)' : 'rgba(255,255,255,0.05)' }}
          >
            <textarea
              value={boundary}
              onChange={e => setBoundary(e.target.value)}
              placeholder={suggestStatus === 'loading' ? '' : 'Define the structural boundary...'}
              rows={3}
              className="w-full px-5 pt-4 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] placeholder:transition-opacity placeholder:duration-500 focus:placeholder:opacity-40 outline-none border-none resize-none leading-relaxed"
              style={{ fontFamily: 'var(--app-font-sans)', opacity: suggestStatus === 'loading' ? 0.45 : 1, transition: 'opacity 300ms ease' }}
              onFocus={() => setFocusedField('boundary')}
              onBlur={() => setFocusedField(null)}
              readOnly={suggestStatus === 'loading'}
            />
          </div>

          {/* Footer action bar */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#4f4b47]">
              {isActive ? 'DRAFTING...' : 'AWAITING INPUT'}
            </span>
            <button
              type="submit"
              disabled={!canSeal}
              className="px-5 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-[0.16em] transition-[opacity,transform] duration-[250ms] active:scale-[0.97] active:duration-0 disabled:opacity-30"
              style={{
                background: canSeal ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: canSeal ? '#f4efe9' : '#4f4b47',
                boxShadow: canSeal
                  ? '0 0 0 1px rgba(224,116,58,0.22) inset, 0 0 14px rgba(224,116,58,0.07)'
                  : '0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              Seal Covenant
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Covenant dashboard (pro content) ─────────────────────────────────────────
function CovenantDashboard() {
  const [covenants, setCovenants] = useState<Covenant[]>([]);
  const [selected, setSelected]   = useState<Covenant | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/covenants', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json() as Array<{
            id: string; title: string; type: string; boundary: string; sealed: string;
          }>;
          setCovenants(data.map(d => ({
            id:           d.id,
            relationship: d.title,
            boundary:     d.boundary,
            trigger:      d.type,
            sealed:       d.sealed,
          })));
        }
      } catch { /* silently stay empty */ }
    }
    load();
  }, []);

  const [sealError, setSealError] = useState('');

  const handleSeal = useCallback(async (draft: Omit<Covenant, 'id' | 'sealed'>) => {
    const sealed = new Date().toISOString().slice(0, 10);
    setSealError('');
    let networkFailed = false;

    try {
      const res = await fetch('/api/covenants', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          title:           draft.relationship,
          type:            draft.trigger || 'USER DEFINED',
          withWhom:        draft.relationship,
          boundary:        draft.boundary,
          costOfViolation: '',
          sealed,
        }),
      });
      if (res.ok) {
        const saved = await res.json() as { id: string; sealed: string };
        const next: Covenant = { ...draft, id: saved.id, sealed: saved.sealed };
        setCovenants(prev => [next, ...prev]);
        setSelected(next);
        return;
      }
      // Server returned an HTTP error — surface it instead of silently saving locally
      let msg = 'Failed to seal covenant. Please try again.';
      try {
        const body = await res.json() as { error?: string };
        if (body.error) msg = body.error;
      } catch { /* ignore parse failures */ }
      setSealError(msg);
      return;
    } catch {
      // Genuine network failure — fall through to local offline insert
      networkFailed = true;
    }

    if (networkFailed) {
      const next: Covenant = { ...draft, id: String(Date.now()), sealed };
      setCovenants(prev => [next, ...prev]);
      setSelected(next);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        {/* Space header */}
        <div className="px-6 pt-6 pb-5">
          <h1 className="font-serif text-4xl text-[#f4efe9] tracking-[-0.02em] leading-tight">
            Covenant
          </h1>
          <p className="mt-1.5 text-[15px] text-[#76716b] font-sans">
            Codify your relational boundaries.
          </p>
        </div>

        {/* Active covenants list */}
        <div className="px-4 mb-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2 px-1">
            Active — {covenants.length}
          </p>
          <motion.div layout className="border-t border-white/[0.06]">
            <AnimatePresence initial={false}>
              {covenants.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <CovenantRow
                    covenant={c}
                    isLast={i === covenants.length - 1}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <CovenantDetail
              key={selected.id}
              covenant={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Drafting engine — pinned to bottom */}
      <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }} className="lg:pb-0">
        {sealError && (
          <p className="font-mono text-[9px] text-red-400/70 tracking-[0.1em] px-5 pb-2">
            {sealError}
          </p>
        )}
        <DraftingEngine onSeal={handleSeal} />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function CovenantPage() {
  const { isPremium, refresh } = useUserTier();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      let cancelled = false;

      void (async () => {
        try {
          const res = await fetch(`/api/billing/confirm?session_id=${encodeURIComponent(sessionId)}`, {
            credentials: 'include',
          });

          if (!cancelled && res.ok) {
            setLocalPremium();
            await refresh();
          }
        } catch {
          // Ignore confirmation errors here; the backend tier will still be
          // authoritative once the webhook settles.
        } finally {
          if (!cancelled) {
            setLocation(location.split('?')[0], { replace: true });
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = isPremium ? (
    <CovenantDashboard />
  ) : (
    <PremiumGate
      space="Covenant"
      tagline="Faith-context reflection."
      description="For users who want faith connected to the work — repair and the next honest step. Available on Pro."
    />
  );

  return (
    <SpaceShell
      spaceName="Covenant"
      sidebar={sidebar}
      main={main}
      mobileTabs={[
        { id: 'covenant', label: 'Covenant', content: main },
        { id: 'context',  label: 'Context',  content: sidebar },
      ]}
    />
  );
}
