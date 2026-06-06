'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ACCESS DENIED');

      if (data.token) {
        document.cookie = `sovv_session=${data.token}; path=/; max-age=86400; SameSite=Strict; Secure`;
        router.push('/workspace');
      }
    } catch (err: any) {
      setError(err.message || 'SYSTEM AUTHENTICATION FAILURE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-mono text-white p-4">
      <div className="w-full max-w-md border border-white p-8 bg-black">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold tracking-widest text-white">SOVEREIGN.OS</h1>
          <p className="mt-2 text-xs text-neutral-500">SYSTEM ACCESS REQUIRED</p>
        </div>

        {error && (
          <div className="mb-6 border border-white bg-black p-3 text-xs text-white uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">IDENTITY</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white p-3 text-white text-xs focus:outline-none placeholder-neutral-700"
              placeholder="OWNER@DEFRAG.APP"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">ACCESS KEY</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white p-3 text-white text-xs focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full border border-white bg-white py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'ENTER WORKBENCH'}
          </button>
        </form>
      </div>
    </div>
  );
}
