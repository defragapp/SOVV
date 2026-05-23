'use client';

import { useState, useEffect } from 'react';
import { Composer } from '@/components/Composer';
import { Thread } from '@/components/Thread';
import { StudioPanel } from '@/components/StudioPanel';

export default function AppPage() {
  const [mode, setMode] = useState('self');
  const [threadItems, setThreadItems] = useState<any[]>([]);
  const [chipGroups, setChipGroups] = useState<any[]>([]);
  const [latestPayload, setLatestPayload] = useState(null);
  const [hasBaseline, setHasBaseline] = useState<boolean | null>(null);

  const handleExplain = async (text: string) => {
    setThreadItems(items => [...items, { type: 'user', text }]);
    const payload = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, question: text, text }),
    }).then(res => res.json());
    setThreadItems(items => [...items, { type: 'system', payload }]);
    setLatestPayload(payload);
  };

  const handleUpgrade = async () => {
    const { url } = await fetch('/api/billing/checkout', { method: 'POST' }).then(res => res.json());
    if (url) {
      window.location.href = url;
    }
  };

  useEffect(() => {
    fetch(`/api/chips?mode=${mode}`).then(res => res.json()).then(data => setChipGroups(data.groups || []));
  }, [mode]);

  useEffect(() => {
    fetch('/api/baseline').then(res => res.json()).then(data => setHasBaseline(!!data?.baseline)).catch(() => setHasBaseline(false));
  }, []);

  const composerDisabled = hasBaseline !== true;
  const composerHint = hasBaseline === null ? 'Checking hidden baseline...' : !hasBaseline ? 'Hidden baseline required. Visit Settings to configure your DOB/TOB/POB.' : undefined;

  return (
    <div className="h-screen grid grid-cols-[1fr_360px]">
      <main className="p-6 overflow-y-auto flex flex-col">
        <div className="flex-1">
            <Thread items={threadItems} chipGroups={chipGroups} onChip={handleExplain} />
        </div>
        <Composer onSubmit={handleExplain} disabled={composerDisabled} hint={composerHint} />
      </main>
      <aside className="border-l border-white/10 p-4 overflow-y-auto">
        <StudioPanel payload={latestPayload} onUpgrade={handleUpgrade} />
      </aside>
    </div>
  );
}