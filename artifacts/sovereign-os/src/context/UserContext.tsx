import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { readLocalTier, setLocalPremium, clearLocalPremium } from '@/lib/tier';
import { checkHasBaseline, hydrateBaseline } from '@/lib/baseline';
import { useLocation } from 'wouter';

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro';
}

interface UserContextValue {
  user: User | null;
  isPremium: boolean;
  hasBaseline: boolean;
  loading: boolean;
  /** Re-fetch auth state (call after login/logout). Returns a promise you can await. */
  refresh: () => Promise<void>;
  /** Call after baseline setup completes to update the flag without a full re-fetch. */
  setBaselineDone: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isPremium: false,
  hasBaseline: false,
  loading: true,
  refresh: () => Promise.resolve(),
  setBaselineDone: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [localPremium, setLocalPremiumState] = useState(readLocalTier);
  const [hasBaseline, setHasBaseline] = useState(checkHasBaseline);
  const [loading, setLoading] = useState(true);
  const isAuthEntryRoute = /^(\/app\/(login|register|forgot-password|reset-password)|\/app\/?$)(\/|\?|$)/.test(location);
  const shouldFetchAuth = /^(\/app|\/apps|\/settings|\/admin|\/hub)(\/|$)/.test(location) && !isAuthEntryRoute;

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { id?: string; email?: string; tier?: string };
        if (data.id && data.email) {
          const tier = data.tier === 'pro' ? 'pro' : 'free';
          setUser({ id: data.id, email: data.email, tier });
          if (tier === 'pro') {
            setLocalPremium();
            setLocalPremiumState(true);
          } else {
            clearLocalPremium();
            setLocalPremiumState(false);
          }
          // Hydrate baseline from server if localStorage is empty (cross-device sync)
          hydrateBaseline().then(() => setHasBaseline(checkHasBaseline())).catch(() => {});
        } else {
          clearLocalPremium();
          setLocalPremiumState(false);
          setUser(null);
        }
      } else {
        clearLocalPremium();
        setLocalPremiumState(false);
        setUser(null);
      }
    } catch {
      clearLocalPremium();
      setLocalPremiumState(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLocalPremiumState(readLocalTier());
    setHasBaseline(checkHasBaseline());
    if (!shouldFetchAuth) {
      setLoading(false);
      return;
    }
    fetchUser();
  }, [fetchUser, shouldFetchAuth]);

  const isPremium = user?.tier === 'pro' || localPremium;
  const setBaselineDone = useCallback(() => setHasBaseline(true), []);

  return (
    <UserContext.Provider value={{ user, isPremium, hasBaseline, loading, refresh: fetchUser, setBaselineDone }}>
      {children}
    </UserContext.Provider>
  );
}

/** Returns global auth + tier state. Available anywhere inside <UserProvider>. */
export function useUserTier(): UserContextValue {
  return useContext(UserContext);
}
