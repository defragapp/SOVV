import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHIP_GROUPS } from '@/lib/core/chips';
import type { Mode } from '@/lib/core/types';

const ease = [0.16, 1, 0.3, 1] as const;

function InputPanel({ onSubmit, loading }: { onSubmit: (msg: string) => void; loading: boolean }) {
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

  return (
    <div className="flex flex-col gap-4 px-6 py-6 border-t border-white/[0.06] bg-[#08070a]">
      {/* Mode selector */}
      <div className="flex gap-1.5 flex-wrap">
        {(['self', 'situation', 'pair', 'group'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`font-mono text-[9px] uppercase tracking-[0.14em] px-3 py-1.5 border transition-colors ${
              mode === m
                ? 'border-white/[0.20] text-[#f4efe9] bg-white/[0.06]'
                : 'border-white/[0.06] text-[#4f4b47] hover:border-white/[0.12] hover:text-[#76716b]'
            }`}
            style={{ borderRadius: 4 }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Chips */}
      <div className="flex gap-1.5 flex-wrap">
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => setValue(chip)}
            className="font-mono text-[9px] text-[#4f4b47] border border-white/[0.06] px-2.5 py-1 hover:border-white/[0.14] hover:text-[#76716b] transition-colors"
            style={{ borderRadius: 3 }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Describe the moment. What happened? What was said?"
          rows={3}
          className="w-full resize-none bg-white/[0.02] border border-white/[0.08] text-[#f4efe9] text-sm placeholder:text-[#4f4b47] p-3 outline-none focus:border-white/[0.18] transition-colors"
          style={{ borderRadius: 'var(--radius-input)', fontFamily: 'var(--app-font-sans)' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {loading ? '···' : 'Defrag'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface DefragResult {
  summary?: string;
  activePattern?: string;
  bestNextResponse?: { summary?: string; phrasing?: string[] };
  [key: string]: unknown;
}

function ResultDisplay({ result }: { result: DefragResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="px-6 md:px-10 py-10 flex flex-col gap-8 max-w-2xl"
    >
      {result.summary && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">What's active</p>
          <p className="text-[15px] text-[#d4cec8] leading-relaxed">{result.summary}</p>
        </div>
      )}

      {result.activePattern && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">The pattern</p>
          <p className="text-[15px] text-[#d4cec8] leading-relaxed">{result.activePattern}</p>
        </div>
      )}

      {result.bestNextResponse && (
        <div className="border border-white/[0.06] bg-[#0c0a0d] p-6" style={{ borderRadius: 'var(--radius-container)' }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-4">Best next response</p>
          {result.bestNextResponse.summary && (
            <p className="text-[14px] text-[#a8a29a] leading-relaxed mb-4">{result.bestNextResponse.summary}</p>
          )}
          {result.bestNextResponse.phrasing?.map((p, i) => (
            <p key={i} className="text-sm text-[#76716b] border-l border-[#e0743a]/20 pl-4 py-1 mb-2 last:mb-0">{p}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function DefragPage() {
  const [result, setResult] = useState<DefragResult | null>(null);
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
        const data = await res.json() as DefragResult;
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

  const sidebar = <Sidebar onSelectPerson={() => {}} selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }} />;

  const main = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-4">Defrag</p>
            <p className="font-serif text-xl text-[#f4efe9] mb-2">Bring the moment.</p>
            <p className="text-sm text-[#76716b] max-w-xs leading-relaxed">Describe what happened. See what's active beneath it.</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-px bg-[#e0743a]/40 animate-pulse" />
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Reading the pattern…</p>
            </div>
          </div>
        )}
        {error && (
          <div className="px-6 py-10">
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        )}
        {result && <ResultDisplay result={result} />}
      </div>
      <InputPanel onSubmit={handleSubmit} loading={loading} />
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
