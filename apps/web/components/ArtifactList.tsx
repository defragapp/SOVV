"use client";

import { useEffect, useState } from "react";
import { loadArtifacts } from "@/lib/storage";

export function ArtifactList() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(loadArtifacts());
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="font-medium">Library</div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-white/50">Nothing saved yet.</div>
        ) : (
          items.slice(0, 8).map((a) => (
            <div key={a.id} className="rounded-xl border border-white/10 p-3">
              <div className="text-xs text-white/50">{a.type.toUpperCase()}</div>
              <div className="text-sm">{a.title}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
