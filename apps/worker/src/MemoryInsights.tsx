'use client';

import React, { useEffect, useState } from 'react';
import { getPatterns, verifyPattern } from '../../../../worker/src/api'; // Adjust path as needed

export default function MemoryInsights() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatterns().then((res) => {
      if (res?.patterns) setPatterns(res.patterns);
      setLoading(false);
    });
  }, []);

  const handleVerify = async (id: string, action: 'confirm' | 'dismiss') => {
    // Optimistic UI update
    setPatterns((prev) => 
      prev.filter(p => action === 'confirm' ? true : p.id !== id)
          .map(p => p.id === id ? { ...p, verified: action === 'confirm' ? 1 : -1 } : p)
    );
    await verifyPattern(id, action);
  };

  if (loading) return <div className="animate-pulse h-12 bg-gray-100 rounded-md" />;
  if (patterns.length === 0) return null; // Hide if no memory exists yet

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Relational Memory Insights
      </h3>
      <div className="space-y-4">
        {patterns.filter(p => p.verified !== -1).map((pattern) => (
          <div key={pattern.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-md">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                {pattern.pattern_type} (Seen {pattern.occurrence_count}x)
              </span>
              <p className="text-gray-800 text-sm">{pattern.content}</p>
            </div>
            
            {pattern.verified === 0 && (
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => handleVerify(pattern.id, 'confirm')}
                  className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                >
                  Accurate
                </button>
                <button 
                  onClick={() => handleVerify(pattern.id, 'dismiss')}
                  className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}