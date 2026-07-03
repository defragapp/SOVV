import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { readLocalTier, setLocalPremium } from '@/lib/tier';

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro';
}

interface UserContextValue {
  user: User | null;
  isPremium: boolean;
  loading: boolean;
  /** Re-fetch auth state (call after login/logout). Returns a promise you can await. */
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isPremium: false,
  loading: true,
  refresh: () => Promise.resolve(),
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [localPremium, setLocalPremiumState] = useState(readLocalTier);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { id?: string; email?: string; tier?: string };
        if (data.id && data.email) {
          const tier = data.tier === 'pro' ? 'pro' : 'free';
          setUser({ id: data.id, email: data.email, tier });
          // Keep local flag in sync: if backend confirms pro, ensure flag is set
          if (tier === 'pro') {
            setLocalPremium();
            setLocalPremiumState(true);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLocalPremiumState(readLocalTier());
    fetchUser();
  }, [fetchUser]);

  const isPremium = user?.tier === 'pro' || localPremium;

  return (
    <UserContext.Provider value={{ user, isPremium, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

/** Returns global auth + tier state. Available anywhere inside <UserProvider>. */
export function useUserTier(): UserContextValue {
  return useContext(UserContext);
}
