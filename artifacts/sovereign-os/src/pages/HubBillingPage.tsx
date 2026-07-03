import { useState, useEffect } from 'react';
import { Link } from 'wouter';

export function HubBillingPage() {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST', credentials: 'include' });
      const d = await res.json() as { url?: string };
      if (d.url) window.location.href = d.url;
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#08070a] text-[#f4efe9]">
      <header className="h-[52px] border-b border-white/[0.06] flex items-center px-6 justify-between">
        <Link href="/apps/defrag" className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
          ← Sovereign.os
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f4efe9]">Billing</span>
        <div className="w-24" />
      </header>
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-serif text-2xl text-[#f4efe9] mb-2">Billing</h1>
        <p className="text-sm text-[#76716b] mb-8">Manage your subscription and payment details.</p>
        <button onClick={openPortal} disabled={loading} className="btn-primary">
          {loading ? '···' : 'Open billing portal'}
        </button>
        <div className="mt-6">
          <Link href="/pricing" className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors">
            View pricing →
          </Link>
        </div>
      </div>
    </div>
  );
}
