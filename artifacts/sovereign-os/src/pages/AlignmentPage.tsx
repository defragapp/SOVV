import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';
import { useUserTier } from '@/context/UserContext';

export function AlignmentPage() {
  const { isPremium } = useUserTier();

  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = isPremium ? (
    // Pro content placeholder — will be filled in a future phase
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-4">Alignment</p>
      <p className="font-serif text-xl text-[#f4efe9] mb-2">Your space is ready.</p>
      <p className="text-sm text-[#76716b] max-w-xs leading-relaxed">
        Response integration and action choice is coming in the next phase.
      </p>
    </div>
  ) : (
    <PremiumGate
      space="Alignment"
      tagline="Response integration. Action choice."
      description="Alignment shows you what is yours to carry and what belongs to the other side. Available on Pro."
    />
  );

  return (
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebar}
      main={main}
      mobileTabs={[
        { id: 'alignment', label: 'Alignment', content: main },
        { id: 'context', label: 'Context', content: sidebar },
      ]}
    />
  );
}
