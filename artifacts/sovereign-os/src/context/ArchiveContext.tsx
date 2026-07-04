import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface ArchivedPattern {
  id: string;
  savedAt: string;     // YYYY-MM-DD
  savedAtFull: string; // ISO timestamp
  inputText?: string;
  activePattern: string;
  whatsActive: string;
  defenseMechanism?: string;
  resolutionSteps?: string[];
  bestNextResponse?: string;
  baselineTriggered?: boolean;
}

interface ArchiveContextValue {
  patterns: ArchivedPattern[];
  loading: boolean;
  /** POST to /api/archive (requires auth). Falls back to local-only on failure. */
  save: (result: Omit<ArchivedPattern, 'id' | 'savedAt' | 'savedAtFull'>) => Promise<ArchivedPattern>;
}

const ArchiveContext = createContext<ArchiveContextValue>({
  patterns: [],
  loading: false,
  save: () => { throw new Error('ArchiveProvider missing'); },
});

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [patterns, setPatterns] = useState<ArchivedPattern[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch on mount — gracefully degrade if unauthenticated
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/archive', { credentials: 'include' });
        if (res.ok) {
          // API returns { items, total, hasMore } — extract items array
          const data = await res.json() as { items?: ArchivedPattern[] } | ArchivedPattern[];
          const items = Array.isArray(data) ? data : (data.items ?? []);
          if (!cancelled) setPatterns(items);
        }
        // 401 = not logged in — silently stay empty
      } catch { /* network error — stay empty */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async (
    result: Omit<ArchivedPattern, 'id' | 'savedAt' | 'savedAtFull'>,
  ): Promise<ArchivedPattern> => {
    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (res.ok) {
        const entry = await res.json() as ArchivedPattern;
        setPatterns(prev => [entry, ...prev]);
        return entry;
      }
    } catch { /* fall through to local save */ }

    // Offline / unauthenticated fallback — local only
    const now = new Date();
    const entry: ArchivedPattern = {
      ...result,
      id: `local-${Date.now()}`,
      savedAt: now.toISOString().slice(0, 10),
      savedAtFull: now.toISOString(),
    };
    setPatterns(prev => [entry, ...prev]);
    return entry;
  }, []);

  return (
    <ArchiveContext.Provider value={{ patterns, loading, save }}>
      {children}
    </ArchiveContext.Provider>
  );
}

export function useArchive(): ArchiveContextValue {
  return useContext(ArchiveContext);
}
