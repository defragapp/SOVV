import { createContext, useContext, useState, useCallback } from 'react';

export interface ArchivedPattern {
  id: string;
  savedAt: string; // ISO date string YYYY-MM-DD
  savedAtFull: string; // ISO timestamp for display
  activePattern: string;
  whatsActive: string;
  defenseMechanism?: string;
  resolutionSteps?: string[];
  bestNextResponse?: string;
}

interface ArchiveContextValue {
  patterns: ArchivedPattern[];
  save: (result: Omit<ArchivedPattern, 'id' | 'savedAt' | 'savedAtFull'>) => ArchivedPattern;
}

const ArchiveContext = createContext<ArchiveContextValue>({
  patterns: [],
  save: () => { throw new Error('ArchiveProvider missing'); },
});

// ── Seed data — 3 mock patterns so the list feels alive from day one ──────────
const SEED_PATTERNS: ArchivedPattern[] = [
  {
    id: 'seed-1',
    savedAt: '2026-06-12',
    savedAtFull: '2026-06-12T09:14:00Z',
    activePattern: 'Withdrawal / Avoidance',
    whatsActive: 'An established pattern of emotional withdrawal is active. When conflict registers as unresolvable, the system routes around it — reducing presence to avoid the cost of engagement.',
    defenseMechanism: 'Physical distance, reduced verbal response, and a cognitive shift to "not worth it" framing.',
    bestNextResponse: 'I got flooded. I\'m back — can we try that part again?',
  },
  {
    id: 'seed-2',
    savedAt: '2026-06-24',
    savedAtFull: '2026-06-24T18:02:00Z',
    activePattern: 'Over-Explanation / Repair Loop',
    whatsActive: 'Repair is being attempted through extended justification rather than acknowledgment. The listener has already moved past the incident; the speaker has not.',
    defenseMechanism: 'Verbal elaboration used as proof of innocence rather than as genuine clarification.',
    bestNextResponse: 'I hear that it landed wrong. I\'m going to stop explaining and just ask — are we okay?',
  },
  {
    id: 'seed-3',
    savedAt: '2026-07-01',
    savedAtFull: '2026-07-01T11:45:00Z',
    activePattern: 'Authority Collapse',
    whatsActive: 'Boundary dissolution is occurring in response to sustained pressure from a perceived authority figure. The original position is being abandoned under low-grade coercion.',
    defenseMechanism: 'Appeasement framed as flexibility. Agreement used to end discomfort rather than reflect actual alignment.',
    bestNextResponse: 'I need to sit with this before I commit. I\'ll come back to you by end of day.',
  },
];

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [patterns, setPatterns] = useState<ArchivedPattern[]>(SEED_PATTERNS);

  const save = useCallback((result: Omit<ArchivedPattern, 'id' | 'savedAt' | 'savedAtFull'>): ArchivedPattern => {
    const now = new Date();
    const entry: ArchivedPattern = {
      ...result,
      id: `pat-${Date.now()}`,
      savedAt: now.toISOString().slice(0, 10),
      savedAtFull: now.toISOString(),
    };
    setPatterns(prev => [entry, ...prev]);
    return entry;
  }, []);

  return (
    <ArchiveContext.Provider value={{ patterns, save }}>
      {children}
    </ArchiveContext.Provider>
  );
}

export function useArchive(): ArchiveContextValue {
  return useContext(ArchiveContext);
}
