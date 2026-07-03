import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHIP_GROUPS } from '@/lib/core/chips';
import type { Mode } from '@/lib/core/types';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Mock diagnostic result shown on first load ────────────────────────────────
const MOCK_RESULT = {
  summary:
    'An established pattern of emotional withdrawal is active. When conflict registers as unresolvable, the system routes around it — reducing presence to avoid the cost of engagement. This is protective in the short term and corrosive in the long term.',
  activePattern: 'Withdrawal / Avoidance',
  defenseMechanism: 'The pattern surfaces as physical distance, reduced verbal response, and a cognitive shift to "not worth it" framing. It prevents rupture in the moment by preventing contact entirely.',
  resolutionSteps: [
    "Name what is happening before leaving: \"I need ten minutes — I'm not done with this conversation.\"",
    'Distinguish between a boundary (healthy) and a disappearance (pattern).',
    'Return with a specific re-entry: start with a factual statement, not a position.',
  ],
  bestNextResponse: {
    summary:
      'Reconnect before repairing. A bid for connection — even a small one — resets the nervous system faster than an apology.',
    phrasing: [
      "\u201CI got flooded. I\u2019m back.\u201D",
      "\u201CI don\u2019t want to leave it like that.\u201D",
      "\u201CCan we try that part again?\u201D",
    ],
  },
};

// ── Drop Zone input ───────────────────────────────────────────────────────────
function DropZone({
  onSubmit,
  loading,
}: {
  onSubmit: (msg: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<Mode>('self');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chips = CHIP_GROUPS[mode]?.[0]?.chips ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value.trim());
    setValue('');
  };

  const inputActive = value.trim().length > 0;

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      {/* Mode selector */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {(['self', 'situation', 'pair', 'group'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`font-mono text-[9px] uppercase tracking-[0.14em] px-3 py-1.5 transition-colors rounded-[4px] ${
              mode === m
                ? 'bg-white/[0.08] text-[#f4efe9] ring-1 ring-inset ring-white/[0.14]'
                : 'text-[#4f4b47] ring-1 ring-inset ring-white/[0.05] hover:text-[#76716b]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Chips */}
      {chips.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setValue(chip)}
              className="font-mono text-[9px] text-[#4f4b47] ring-1 ring-inset ring-white/[0.05] px-2.5 py-1 hover:text-[#76716b] transition-colors rounded-[3px]"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Drop zone container */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-3xl ring-1 ring-inset ring-white/[0.05] p-5 flex flex-col gap-4"
          style={{ background: '#1C1C1E' }}
        >
          {/* Borderless textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Describe the moment. What happened? What was said?"
            rows={4}
            className="w-full resize-none bg-transparent text-[17px] text-white placeholder:text-[#4f4b47] outline-none border-none ring-0 leading-relaxed"
            style={{ fontFamily: 'var(--app-font-sans)' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />

          {/* Action footer */}
          <div className="flex items-center justify-between border-t border-white/[0.05] pt-4">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#4f4b47]">
              {inputActive ? 'INPUT ACTIVE' : 'WAITING'}
            </span>

            <button
              type="submit"
              disabled={!inputActive || loading}
              className="px-5 py-2.5 rounded-2xl font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 disabled:opacity-30"
              style={{
                background: inputActive && !loading ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: inputActive && !loading ? '#f4efe9' : '#4f4b47',
                boxShadow: inputActive && !loading ? '0 0 0 1px rgba(255,255,255,0.10) inset' : '0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              {loading ? '···' : 'Map Pattern'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Diagnostic output cards ───────────────────────────────────────────────────
interface DiagnosticResult {
  summary?: string;
  activePattern?: string;
  defenseMechanism?: string;
  resolutionSteps?: string[];
  bestNextResponse?: { summary?: string; phrasing?: string[] };
  [key: string]: unknown;
}

function DiagnosticCard({
  tag,
  children,
  delay = 0,
}: {
  tag: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease, delay }}
      className="rounded-2xl ring-1 ring-inset ring-white/[0.05] overflow-hidden"
      style={{ background: '#1C1C1E' }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <span className="font-mono text-[10px] tracking-[0.18em] text-[#4f4b47] uppercase">
          {tag}
        </span>
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: '#e0743a', boxShadow: '0 0 6px rgba(224,116,58,0.6)' }}
        />
      </div>

      {/* Card body */}
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

function DiagnosticOutput({ result }: { result: DiagnosticResult }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {/* Pattern name */}
      {result.activePattern && (
        <DiagnosticCard tag="[Active Pattern]" delay={0}>
          <p className="font-mono text-[15px] text-[#f4efe9] tracking-[0.04em]">
            {result.activePattern}
          </p>
        </DiagnosticCard>
      )}

      {/* What's active */}
      {result.summary && (
        <DiagnosticCard tag="[What's Active]" delay={0.06}>
          <p className="text-[15px] text-[#d4cec8] leading-relaxed font-sans">
            {result.summary}
          </p>
        </DiagnosticCard>
      )}

      {/* Defense mechanism */}
      {result.defenseMechanism && (
        <DiagnosticCard tag="[Defense Mechanism]" delay={0.12}>
          <p className="text-[15px] text-[#d4cec8] leading-relaxed font-sans">
            {result.defenseMechanism}
          </p>
        </DiagnosticCard>
      )}

      {/* Resolution steps */}
      {result.resolutionSteps && result.resolutionSteps.length > 0 && (
        <DiagnosticCard tag="[Resolution Steps]" delay={0.18}>
          <div className="flex flex-col gap-3">
            {result.resolutionSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-mono text-[10px] text-[#e0743a]/50 mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] text-[#d4cec8] leading-relaxed font-sans">{step}</p>
              </div>
            ))}
          </div>
        </DiagnosticCard>
      )}

      {/* Best next response */}
      {result.bestNextResponse && (
        <DiagnosticCard tag="[Best Next Response]" delay={0.24}>
          {result.bestNextResponse.summary && (
            <p className="text-[14px] text-[#a8a29a] leading-relaxed mb-4 font-sans">
              {result.bestNextResponse.summary}
            </p>
          )}
          {result.bestNextResponse.phrasing?.map((p, i) => (
            <p
              key={i}
              className="text-[14px] text-[#76716b] border-l border-[#e0743a]/25 pl-4 py-1 mb-2 last:mb-0 font-sans italic"
            >
              {p}
            </p>
          ))}
        </DiagnosticCard>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function DefragPage() {
  const [result, setResult] = useState<DiagnosticResult | null>(MOCK_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (message: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        const data = await res.json() as DiagnosticResult;
        setResult(data);
      } else if (res.status === 401) {
        window.location.href = '/app/login';
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = (
    <div className="flex flex-col h-full">
      {/* Scrollable output area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!result && !loading && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-6 py-20"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-4">
                Defrag
              </p>
              <p className="font-serif text-xl text-[#f4efe9] mb-2">Bring the moment.</p>
              <p className="text-sm text-[#76716b] max-w-xs leading-relaxed">
                Describe what happened. See what's active beneath it.
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-px bg-[#e0743a]/40 animate-pulse" />
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
                  Reading the pattern…
                </p>
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-10"
            >
              <p className="text-sm text-red-400/80">{error}</p>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DiagnosticOutput result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drop Zone — pinned to bottom */}
      <DropZone onSubmit={handleSubmit} loading={loading} />
    </div>
  );

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebar}
      main={main}
      mobileTabs={[
        { id: 'defrag', label: 'Defrag', content: main },
        { id: 'context', label: 'Context', content: sidebar },
      ]}
    />
  );
}
