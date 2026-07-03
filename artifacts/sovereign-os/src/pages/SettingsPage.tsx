import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface BaselineData {
  dob?: string;
  tob?: { type: string; value: string };
  pob?: string;
}

export function SettingsPage() {
  const [baseline, setBaseline] = useState<BaselineData>({});
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pob, setPob] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/baseline', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => {
        if (d?.baseline) {
          const b = d.baseline as BaselineData;
          setBaseline(b);
          setDob(b.dob || '');
          setTob(b.tob?.value || '');
          setPob(b.pob || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dob, tob: { type: 'approx', value: tob }, pob }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error || 'Save failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070a] text-[#f4efe9]">
      {/* Header */}
      <header className="h-[52px] border-b border-white/[0.06] flex items-center px-6 justify-between">
        <Link href="/apps/defrag" className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
          ← Sovereign.os
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f4efe9]">Settings</span>
        <div className="w-24" />
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-serif text-2xl text-[#f4efe9] mb-2">Baseline Design</h1>
        <p className="text-sm text-[#76716b] mb-8 leading-relaxed">
          Your birth data maps how you process, respond, and return to center. Active beneath every thread. Never exposed in outputs.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="sovv-label">Date of birth</label>
            <input
              type="text"
              value={dob}
              onChange={e => setDob(e.target.value)}
              placeholder="e.g. 1990-03-15"
              className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
            />
            <p className="text-xs text-[#4f4b47]">YYYY-MM-DD format</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="sovv-label">Time of birth (approximate is fine)</label>
            <input
              type="text"
              value={tob}
              onChange={e => setTob(e.target.value)}
              placeholder="e.g. 14:30 or morning"
              className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="sovv-label">Place of birth</label>
            <input
              type="text"
              value={pob}
              onChange={e => setPob(e.target.value)}
              placeholder="e.g. Chicago, IL, USA"
              className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
            />
          </div>

          {error && <p className="text-sm text-red-400/80">{error}</p>}
          {saved && <p className="text-sm text-[#e0743a]/80">Baseline Design saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="self-start inline-flex items-center justify-center px-6 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#f4efe9', color: '#08070a' }}
          >
            {saving ? '···' : 'Save Baseline Design'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">Account</h2>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              window.location.href = '/';
            }}
            className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
