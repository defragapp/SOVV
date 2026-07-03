import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';

export function AlignmentPage() {
  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = (
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
