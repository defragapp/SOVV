import { useEffect, useState } from 'react';
import { Link } from 'wouter';

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
    <div className="min-h-screen bg-[#08070a] flex items-center justify-center px-4 text-center">
      <div>
        <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4f4b47] hover:text-[#f4efe9] transition-colors">
          Sovereign.os
        </Link>
        {status === 'loading' && (
          <p className="mt-8 font-serif text-2xl text-[#f4efe9]">Verifying…</p>
        )}
        {status === 'success' && (
          <>
            <p className="mt-8 font-serif text-2xl text-[#f4efe9]">Email verified.</p>
            <p className="mt-2 text-sm text-[#76716b]">Your account is now active.</p>
            <Link href="/app/login" className="mt-6 inline-block btn-primary">Sign in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="mt-8 font-serif text-2xl text-[#f4efe9]">Verification failed.</p>
            <p className="mt-2 text-sm text-[#76716b]">The link may have expired.</p>
            <Link href="/app/login" className="mt-6 inline-block text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
