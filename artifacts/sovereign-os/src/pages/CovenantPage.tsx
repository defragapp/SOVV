import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { PremiumGate } from '@/components/spaces/PremiumGate';

export function CovenantPage() {
  const sidebar = (
    <Sidebar
      onSelectPerson={() => {}}
      selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }}
    />
  );

  const main = (
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
