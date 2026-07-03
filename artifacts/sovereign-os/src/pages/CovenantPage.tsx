import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';
import { setLocalPremium } from '@/lib/tier';

export function CovenantPage() {
  const { isPremium, refresh } = useUserTier();
  const [location, setLocation] = useLocation();

  // Detect Stripe success redirect: /apps/covenant?session_id=cs_...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      setLocalPremium();
      refresh();
      // Clean the URL without a full reload
      setLocation(location.split('?')[0], { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = isPremium ? (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-4">Covenant</p>
      <p className="font-serif text-xl text-[#f4efe9] mb-2">Your space is ready.</p>
      <p className="text-sm text-[#76716b] max-w-xs leading-relaxed">
        Faith-context reflection and repair work is coming in the next phase.
      </p>
    </div>
  ) : (
    <PremiumGate
      space="Covenant"
      tagline="Faith-context reflection."
      description="For users who want faith connected to the work — repair and the next honest step. Available on Pro."
    />
  );

  return (
    <SpaceShell
      spaceName="Covenant"
      sidebar={sidebar}
      main={main}
      mobileTabs={[
        { id: 'covenant', label: 'Covenant', content: main },
        { id: 'context', label: 'Context', content: sidebar },
      ]}
    />
  );
}
