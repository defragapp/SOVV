import { useState } from 'react';

interface PremiumGateProps {
  space: 'Covenant' | 'Alignment';
  tagline: string;
  description: string;
}

/** Paywall card shown in pro-gated spaces. */
export function PremiumGate({ space, tagline, description }: PremiumGateProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error ?? 'Could not start checkout. Please try again.');
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError('Connection failed. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full px-6">
      {/* Outer shell */}
      <div
        className="w-full max-w-sm rounded-3xl p-px overflow-hidden"
        style={{ background: '#1C1C1E' }}
      >
        {/* Inner vibrancy layer with amber gradient bleed from top */}
        <div
          className="relative rounded-[calc(1.5rem-1px)] overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.40)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Amber gradient top bleed */}
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(224,116,58,0.22) 0%, transparent 100%)',
            }}
          />

          <div className="relative px-7 pt-10 pb-8 flex flex-col items-center text-center gap-5">
            {/* Lock icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center ring-1 ring-inset ring-white/[0.08]"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <svg
                width="24" height="28" viewBox="0 0 24 28"
                fill="none" xmlns="http://www.w3.org/2000/svg"
                className="text-[#e0743a]"
              >
                <rect x="2" y="13" width="20" height="14" rx="4"
                  stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M7 13V8.5C7 5.46 9.24 3 12 3s5 2.46 5 5.5V13"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>

            {/* Label */}
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#4f4b47]">
              {space}
            </p>

            {/* Headline */}
            <h2 className="font-serif text-2xl text-[#f4efe9] leading-snug tracking-[-0.01em]">
              Unlock the Full Structure
            </h2>

            {/* Tagline */}
            <p className="text-[15px] text-[#a8a29a] leading-relaxed font-sans">
              {tagline}
            </p>

            {/* Description */}
            <p className="text-[13px] text-[#4f4b47] leading-relaxed font-sans -mt-1">
              {description}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-white/[0.05]" />

            {/* CTA — switches to INITIALIZING... while loading */}
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full py-3.5 rounded-2xl font-mono text-center transition-all duration-200 disabled:cursor-not-allowed"
              style={{
                background: checkoutLoading ? 'rgba(245,158,11,0.7)' : 'rgb(245,158,11)',
                color: '#000',
              }}
            >
              {checkoutLoading ? (
                <span className="flex items-center justify-center gap-2 text-[10px] tracking-[0.16em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
                  [INITIALIZING...]
                </span>
              ) : (
                <span className="text-[12px] uppercase tracking-[0.14em] font-semibold">
                  Upgrade to Pro
                </span>
              )}
            </button>

            {checkoutError ? (
              <p className="font-mono text-[9px] text-red-400/70 tracking-[0.1em]">
                {checkoutError}
              </p>
            ) : (
              <p className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em]">
                $12 / month · cancel anytime
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
