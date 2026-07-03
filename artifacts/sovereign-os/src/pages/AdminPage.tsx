import { useEffect, useState } from 'react';
import { Link } from 'wouter';

export function AdminPage() {
  const [me, setMe] = useState<{ email?: string; isAdmin?: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setMe(d))
      .catch(() => setMe(null));
  }, []);

  if (!me?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#08070a] flex items-center justify-center text-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4f4b47] mb-4">Access denied</p>
          <Link href="/" className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors">← Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08070a] text-[#f4efe9] p-8">
      <h1 className="font-serif text-3xl mb-2">Admin</h1>
      <p className="text-sm text-[#76716b]">Signed in as {me.email}</p>
    </div>
  );
}
