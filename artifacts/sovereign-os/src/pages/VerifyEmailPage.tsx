import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

export function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.ok ? setStatus('success') : setStatus('error'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div
      className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#08070a] items-center justify-center px-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 48px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)' }}
    >
      {/* Cinematic background */}
      <img
        src="/hero-light.png"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 pointer-events-none select-none"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#08070a] via-[#08070a]/85 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-transparent to-[#08070a]/50" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Wordmark */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="font-mono text-[10px] tracking-[0.28em] text-[#76716b] uppercase">
              SOVEREIGN.OS
            </span>
          </Link>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl ring-1 ring-inset ring-white/[0.05] overflow-hidden"
          style={{ background: '#1C1C1E' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease }}
                className="px-8 py-10 flex flex-col items-center gap-4"
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#4f4b47' }}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4f4b47]">
                  [VERIFYING...]
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="px-8 py-10 flex flex-col items-center text-center gap-4"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#e0743a', boxShadow: '0 0 10px rgba(224,116,58,0.7)' }}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e0743a]/80">
                  [DOMAIN VERIFIED]
                </p>
                <p className="text-[15px] text-[#a8a29a] font-sans leading-relaxed">
                  Your account is now active.
                </p>
                <div className="w-full h-px bg-white/[0.05]" />
                <Link href="/app/login">
                  <span className="block py-3.5 px-8 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'rgb(245,158,11)', color: '#000' }}>
                    Enter your domain
                  </span>
                </Link>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="px-8 py-10 flex flex-col items-center text-center gap-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e0743a]/60">
                  [SYSTEM_ERROR: VERIFICATION FAILED]
                </p>
                <p className="text-[15px] text-[#76716b] font-sans leading-relaxed">
                  This link may have expired. Request a new one from sign-in.
                </p>
                <div className="w-full h-px bg-white/[0.05]" />
                <Link href="/app/login">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
                    ← Back to sign in
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
