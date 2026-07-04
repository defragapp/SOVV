import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';

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
  const [location] = useLocation();
  const [patterns, setPatterns] = useState<ArchivedPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldFetchArchive = /^(\/apps|\/hub)(\/|$)/.test(location);

  // Fetch on mount — gracefully degrade if unauthenticated
  useEffect(() => {
    let cancelled = false;
    if (!shouldFetchArchive) {
      setLoading(false);
      return;
    }
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
  }, [shouldFetchArchive]);

  const save = useCallback(async (
    result: Omit<ArchivedPattern, 'id' | 'savedAt' | 'savedAtFull'>,
  ): Promise<ArchivedPattern> => {
    let res: Response;
    try {
      res = await fetch('/api/archive', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    } catch {
      // Genuine network failure — local-only fallback
      const now = new Date();
      const offline: ArchivedPattern = {
        ...result,
        id: `local-${Date.now()}`,
        savedAt: now.toISOString().slice(0, 10),
        savedAtFull: now.toISOString(),
      };
      setPatterns(prev => [offline, ...prev]);
      return offline;
    }

    if (res.ok) {
      const entry = await res.json() as ArchivedPattern;
      setPatterns(prev => [entry, ...prev]);
      return entry;
    }

    // Server returned an HTTP error — surface it to the caller
    let msg = 'Failed to save pattern.';
    try {
      const body = await res.json() as { error?: string };
      if (body.error) msg = body.error;
    } catch { /* ignore parse failures */ }
    throw new Error(msg);
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
