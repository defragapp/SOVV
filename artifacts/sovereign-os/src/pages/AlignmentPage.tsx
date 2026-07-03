import { SpaceShell } from '@/components/spaces/space-shell';
import Sidebar from '@/components/spaces/Sidebar';
import { Link } from 'wouter';

function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-4">Alignment</p>
      <h2 className="font-serif text-xl text-[#f4efe9] mb-2">Response integration. Action choice.</h2>
      <p className="text-sm text-[#76716b] max-w-xs leading-relaxed mb-8">
        Alignment shows you what is yours to carry and what belongs to the other side. Available on Pro.
      </p>
      <Link href="/pricing" className="btn-primary">Upgrade to Pro</Link>
    </div>
  );
}

export function AlignmentPage() {
  const sidebar = <Sidebar onSelectPerson={() => {}} selectedPerson={{ id: 'self', name: 'Self', relation: 'self' }} />;
  const main = <ProGate />;

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
