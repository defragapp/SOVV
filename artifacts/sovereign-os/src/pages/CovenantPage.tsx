import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';
import { setLocalPremium } from '@/lib/tier';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Mock covenant data ────────────────────────────────────────────────────────
interface Covenant {
  id: string;
  relationship: string;
  boundary: string;
  trigger: string;
  sealed: string; // ISO date string
}

const MOCK_COVENANTS: Covenant[] = [
  {
    id: '1',
    relationship: 'Partner — Communication',
    boundary: 'No conflict escalation after 10pm. Request a pause and resume at a scheduled time.',
    trigger: 'ESCALATION',
    sealed: '2026-06-14',
  },
  {
    id: '2',
    relationship: 'Parent — Boundaries',
    boundary: 'Financial decisions are not open for unsolicited commentary. Redirect with: "I have it handled."',
    trigger: 'FINANCIAL INTRUSION',
    sealed: '2026-06-28',
  },
  {
    id: '3',
    relationship: 'Colleague — Scope',
    boundary: 'Work requests outside designated hours receive a response the next business morning only.',
    trigger: 'AVAILABILITY ASSUMPTION',
    sealed: '2026-07-01',
  },
];

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
      className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02] ${
        isLast ? '' : 'border-b border-white/[0.06]'
      }`}
    >
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-4">
        <span className="text-[15px] text-[#f4efe9] font-sans leading-tight truncate">
          {covenant.relationship}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60">
          [{covenant.trigger}]
        </span>
      </div>
      {/* Chevron */}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0 text-white/20">
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
      className="rounded-2xl ring-1 ring-inset ring-white/[0.05] overflow-hidden mx-4 mb-4"
      style={{ background: '#1C1C1E' }}
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

// ── Drafting engine ───────────────────────────────────────────────────────────
function DraftingEngine({ onSeal }: { onSeal: (c: Omit<Covenant, 'id' | 'sealed'>) => void }) {
  const [relationship, setRelationship] = useState('');
  const [boundary, setBoundary] = useState('');
  const isActive = relationship.trim().length > 0 || boundary.trim().length > 0;
  const canSeal = relationship.trim().length > 0 && boundary.trim().length > 0;

  const handleSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSeal) return;
    onSeal({
      relationship: relationship.trim(),
      boundary: boundary.trim(),
      trigger: 'USER DEFINED',
    });
    setRelationship('');
    setBoundary('');
  };

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <form onSubmit={handleSeal}>
        <div
          className="rounded-3xl ring-1 ring-inset ring-white/[0.05] overflow-hidden"
          style={{ background: '#1C1C1E' }}
        >
          {/* Relationship input */}
          <div className="border-b border-white/[0.05]">
            <input
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="Target relationship or dynamic..."
              className="w-full px-5 pt-5 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none"
              style={{ fontFamily: 'var(--app-font-sans)' }}
            />
          </div>

          {/* Boundary textarea */}
          <div className="border-b border-white/[0.05]">
            <textarea
              value={boundary}
              onChange={e => setBoundary(e.target.value)}
              placeholder="Define the structural boundary..."
              rows={3}
              className="w-full px-5 pt-4 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none resize-none leading-relaxed"
              style={{ fontFamily: 'var(--app-font-sans)' }}
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
              className="px-5 py-2.5 rounded-2xl font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 disabled:opacity-30"
              style={{
                background: canSeal ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: canSeal ? '#f4efe9' : '#4f4b47',
                boxShadow: canSeal
                  ? '0 0 0 1px rgba(255,255,255,0.10) inset'
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
  const [covenants, setCovenants] = useState<Covenant[]>(MOCK_COVENANTS);
  const [selected, setSelected] = useState<Covenant | null>(null);

  const handleSeal = (draft: Omit<Covenant, 'id' | 'sealed'>) => {
    const next: Covenant = {
      ...draft,
      id: String(Date.now()),
      sealed: new Date().toISOString().slice(0, 10),
    };
    setCovenants(prev => [next, ...prev]);
    setSelected(next);
  };

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
          <motion.div
            layout
            className="rounded-2xl overflow-hidden ring-1 ring-inset ring-white/[0.05]"
            style={{ background: '#1C1C1E' }}
          >
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

      {/* Drafting engine — pinned to bottom, clears FloatingNav + iOS home bar */}
      <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }} className="lg:pb-0">
        <DraftingEngine onSeal={handleSeal} />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function CovenantPage() {
  const { isPremium, refresh } = useUserTier();
  const [location, setLocation] = useLocation();

  // Handle Stripe success redirect: /apps/covenant?session_id=cs_...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      setLocalPremium();
      refresh();
      setLocation(location.split('?')[0], { replace: true });
    }
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
        { id: 'context', label: 'Context', content: sidebar },
      ]}
    />
  );
}
