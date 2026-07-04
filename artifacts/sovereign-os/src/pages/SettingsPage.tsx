import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface BaselineApiResponse {
  dob?: string;
  tob?: string;
  pob?: string;
}

// Strict calendar validation — empty is fine (optional in settings), no rollover accepted.
function isStrictDate(v: string): boolean {
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
}

function validateDobFormat(val: string): string {
  const v = val.trim();
  if (!v) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Use YYYY-MM-DD format\u2002\u00b7\u2002e.g. 1990-03-15';
  if (!isStrictDate(v)) return 'Please enter a valid calendar date.';
  return '';
}

export function SettingsPage() {
  const [dob, setDob]         = useState('');
  const [tob, setTob]         = useState('');
  const [pob, setPob]         = useState('');
  const [dobError, setDobError] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/baseline', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((d: BaselineApiResponse | null) => {
        if (!d) return;
        setDob(d.dob ?? '');
        setTob(d.tob ?? '');
        setPob(d.pob ?? '');
      })
      .catch(() => {});
  }, []);

  const handleDobChange = (val: string) => {
    setDob(val);
    // Clear error while user is typing — re-validate on blur
    if (dobError) setDobError('');
  };

  const handleDobBlur = () => {
    setDobError(validateDobFormat(dob));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate before submitting
    const dobErr = validateDobFormat(dob);
    if (dobErr) {
      setDobError(dobErr);
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dob: dob.trim(), tob: tob.trim(), pob: pob.trim() }),
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
        <Link
          href="/apps/defrag"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
        >
          \u2190 Sovereign.os
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f4efe9]">Settings</span>
        <div className="w-24" />
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-serif text-2xl text-[#f4efe9] mb-2">Baseline Design</h1>
        <p className="text-sm text-[#76716b] mb-8 leading-relaxed">
          Your birth data maps how you process, respond, and return to center.
          Active beneath every thread. Never exposed in outputs.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Date of birth */}
          <div className="flex flex-col gap-1.5">
            <label className="sovv-label">
              Date of birth
              <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#e0743a]/50">Required</span>
            </label>
            <input
              type="text"
              value={dob}
              onChange={e => handleDobChange(e.target.value)}
              onBlur={handleDobBlur}
              placeholder="e.g. 1990-03-15"
              className={`sovv-input w-full border bg-white/[0.03] rounded-[var(--radius-input)] transition-colors duration-200 ${
                dobError
                  ? 'border-red-400/40 focus:border-red-400/60'
                  : 'border-white/[0.08] focus:border-white/[0.14]'
              }`}
            />
            {dobError ? (
              <p className="text-[11px] text-red-400/70 font-mono tracking-[0.04em]">{dobError}</p>
            ) : (
              <p className="text-xs text-[#4f4b47]">
                YYYY-MM-DD format \u00b7 Anchors your pattern signature
              </p>
            )}
          </div>

          {/* Time of birth */}
          <div className="flex flex-col gap-1.5">
            <label className="sovv-label">
              Time of birth
              <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Optional</span>
            </label>
            <input
              type="text"
              value={tob}
              onChange={e => setTob(e.target.value)}
              placeholder="e.g. 14:30 or morning"
              className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
            />
            <p className="text-xs text-[#4f4b47]">
              Approximate is fine \u00b7 Leave blank if unknown
            </p>
          </div>

          {/* Place of birth */}
          <div className="flex flex-col gap-1.5">
            <label className="sovv-label">
              Place of birth
              <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#e0743a]/50">Required</span>
            </label>
            <input
              type="text"
              value={pob}
              onChange={e => setPob(e.target.value)}
              placeholder="e.g. Chicago, IL, USA"
              className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
            />
            <p className="text-xs text-[#4f4b47]">
              Seeds the geographical layer of your design
            </p>
          </div>

          {error && <p className="text-sm text-red-400/80">{error}</p>}
          {saved && <p className="text-sm text-[#e0743a]/80">Baseline Design saved.</p>}

          <button
            type="submit"
            disabled={saving || Boolean(dobError)}
            className="self-start inline-flex items-center justify-center px-6 py-3 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#f4efe9', color: '#08070a' }}
          >
            {saving ? '\u00b7\u00b7\u00b7' : 'Save Baseline Design'}
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
