import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
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
          <h1 className="mt-6 font-serif text-2xl text-[#f4efe9]">Reset your password</h1>
          <p className="mt-2 text-sm text-[#76716b]">We'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <p className="text-sm text-[#a8a29a]">Check your email for a reset link.</p>
            <Link href="/app/login" className="mt-4 inline-block text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="sovv-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="sovv-input w-full border border-white/[0.08] bg-white/[0.03] rounded-[var(--radius-input)]"
              />
            </div>
            {error && <p className="text-sm text-red-400/80">{error}</p>}
            <button type="submit" disabled={loading || !email} className="btn-primary w-full mt-2">
              {loading ? '···' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/app/login" className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
