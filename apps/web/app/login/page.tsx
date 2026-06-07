'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://api.defrag.app/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign in failed.');

      if (data.token) {
        document.cookie = `sovv_session=${data.token}; path=/; max-age=86400; SameSite=Strict; Secure`;
      }
      router.push('/apps/defrag');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white/70 transition-colors">
            Sovereign.os
          </Link>
          <h1 className="text-2xl font-light text-white mt-4">Sign in to continue.</h1>
          <p className="text-sm text-white/35">Enter your Sovereign.os account.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/70" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="sovv-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sovv-input"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="sovv-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sovv-input"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sovv-button-primary py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Enter Sovereign.os'}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center space-y-3">
          <p className="text-xs text-white/25">
            New to Sovereign.os?{' '}
            <Link href="https://app.defrag.app/app/login" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">
              Create account
            </Link>
          </p>
          <p className="text-xs text-white/20">
            <Link href="/" className="hover:text-white/40 transition-colors">
              ← Back to Sovereign.os
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}