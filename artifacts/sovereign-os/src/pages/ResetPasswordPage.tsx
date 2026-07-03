import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-[#08070a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4f4b47] hover:text-[#f4efe9] transition-colors">
            Sovereign.os
          </Link>
          <h1 className="mt-6 font-serif text-2xl text-[#f4efe9]">Set new password</h1>
        </div>

        {done ? (
          <div className="text-center py-6">
            <p className="text-sm text-[#a8a29a]">Password updated. You can sign in now.</p>
            <Link href="/app/login" className="mt-4 inline-block btn-primary">Sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="sovv-label">New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
              />
            </div>
            {error && <p className="text-sm text-red-400/80">{error}</p>}
            <button type="submit" disabled={loading || password.length < 8} className="btn-primary w-full mt-2">
              {loading ? '···' : 'Update password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
