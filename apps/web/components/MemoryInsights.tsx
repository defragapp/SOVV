'use client';

import React, { useEffect, useState } from 'react';

const API_BASE = '';

interface Pattern {
  id: string;
  pattern_type: string;
  content: string;
  occurrence_count: number;
  verified: number;
}

export default function MemoryInsights() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_BASE + '/api/patterns', { credentials: 'include' })
      .then(r => r.json())
      .then(res => {
        if (res?.patterns) setPatterns(res.patterns);
      })
      .catch(() => {
        setError('Failed to load relational memory insights.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleVerify = async (id: string, action: 'confirm' | 'dismiss') => {
    setPatterns(prev =>
      prev.map(p => p.id === id ? { ...p, verified: action === 'confirm' ? 1 : -1 } : p)
    );
    await fetch(API_BASE + '/api/patterns/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ patternId: id, action }),
    });
  };

  if (loading) {
    return null; // Or a loading indicator
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 my-4 text-red-200 text-sm">{error}</div>
    );
  }

  const visible = patterns.filter(p => p.verified !== -1);
  if (visible.length === 0) return null;

  return (
    <div className="bg-white/[0.02] rounded-lg border border-white/10 p-5 my-4">
      <h3 className="text-xs font-bold text-white/50 mb-4 uppercase tracking-[0.15em]">
        Relational Memory
      </h3>
      <div className="space-y-3">
        {visible.map(pattern => (
          <div key={pattern.id} className="p-4 rounded-lg border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  {pattern.pattern_type} · Seen {pattern.occurrence_count}x
                </span>
                <p className="text-sm text-white/80 mt-1">{pattern.content}</p>
              </div>
              {pattern.verified === 0 && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleVerify(pattern.id, 'confirm')} className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors">Confirm</button>
                  <button onClick={() => handleVerify(pattern.id, 'dismiss')} className="text-xs px-3 py-1.5 bg-white/5 text-white/30 rounded hover:text-red-400 transition-colors">Dismiss</button>
                </div>
              )}
              {pattern.verified === 1 && <span className="text-xs text-emerald-400 shrink-0">Confirmed</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
