import { useState } from 'react';

interface PremiumGateProps {
  space: 'Covenant' | 'Alignment' | 'Archive';
  tagline: string;
  description: string;
}

/** Zero-edge premium gate — no card, content floats directly on the OS canvas. */
export function PremiumGate({ space, tagline, description }: PremiumGateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="flex flex-col items-center text-center max-w-xs gap-6">
        {/* Amber accent */}
        <div className="h-px w-12 bg-[#e0743a]/40" />

        {/* Space label */}
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#4f4b47]">
          {space}
        </p>

        {/* Headline */}
        <h2 className="font-serif text-3xl text-[#f4efe9] leading-snug tracking-[-0.01em]">
          {tagline}
        </h2>

        {/* Description */}
        <p className="text-[15px] text-[#76716b] leading-relaxed font-sans">
          {description}
        </p>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="inline-flex items-center justify-center px-8 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.18em] font-semibold transition-[opacity,transform] duration-[250ms] active:scale-[0.97] active:duration-0 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#f4efe9', color: '#08070a' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#08070a]/40 animate-pulse" />
              <span>···</span>
            </span>
          ) : (
            'Upgrade to Pro'
          )}
        </button>

        {error ? (
          <p className="font-mono text-[9px] text-red-400/70 tracking-[0.1em]">{error}</p>
        ) : (
          <p className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em]">
            $12 / month · cancel anytime
          </p>
        )}
      </div>
    </div>
  );
}
