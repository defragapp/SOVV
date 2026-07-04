import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error || 'Reset failed. The link may have expired.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#08070a]">
      {/* Cinematic background */}
      <img
        src="/hero-light.png"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 pointer-events-none select-none"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#08070a] via-[#08070a]/85 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-transparent to-[#08070a]/50" />

      <div
        className="relative z-10 flex w-full items-center justify-center px-6"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 48px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="w-full max-w-[400px]"
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
              {done ? (
                /* ── Success state ── */
                <motion.div
                  key="done"
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
                    [PASSWORD UPDATED]
                  </p>
                  <p className="text-[15px] text-[#a8a29a] font-sans leading-relaxed">
                    Your domain access has been restored.
                  </p>
                  <div className="mt-2 w-full h-px bg-white/[0.05]" />
                  <Link href="/app/login">
                    <span className="w-full block py-3 rounded-2xl bg-[#f4efe9] text-[#08070a] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-center transition-opacity hover:opacity-90 px-8">
                      Sign in
                    </span>
                  </Link>
                </motion.div>
              ) : (
                /* ── Form state ── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  {/* Card header */}
                  <div className="px-8 pt-8 pb-6 border-b border-white/[0.05]">
                    <h1 className="font-serif text-2xl text-[#f4efe9] tracking-[-0.01em] mb-1">
                      Set a new password.
                    </h1>
                    <p className="text-[14px] text-[#4f4b47] font-sans">
                      Choose something strong. At least 8 characters.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Password field */}
                    <div className="border-b border-white/[0.05]">
                      <label className="block px-6 pt-4 pb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="w-full px-6 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none"
                        style={{ fontFamily: 'var(--app-font-sans)' }}
                      />
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-b border-white/[0.05]"
                        >
                          <p className="px-6 py-3 font-mono text-[10px] tracking-[0.12em] text-[#e0743a]/60">
                            [SYSTEM_ERROR: {error.toUpperCase()}]
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CTA */}
                    <div className="p-6">
                      <button
                        type="submit"
                        disabled={loading || password.length < 8}
                        className="w-full py-3.5 rounded-2xl bg-[#f4efe9] text-[#08070a] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {loading ? '···' : 'Update password'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link href="/app/login">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
                ← Back to sign in
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
