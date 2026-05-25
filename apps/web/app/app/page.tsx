"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ExplainResponse } from "@sovereign/core";
import { apiExplain, apiChips, apiCheckout, apiGetBaseline } from "@/lib/api";
import { Thread } from "@/components/Thread/Thread";
import { Composer } from "@/components/Composer/Composer";
import { StudioPanel } from "@/components/StudioPanel/StudioPanel";
import MemoryInsights from "../../components/MemoryInsights";

export default function AppPage() {
  const [mode, setMode] = useState<"self" | "situation" | "pair" | "group">("self");
  const [thread, setThread] = useState<any[]>([]);
  const [chips, setChips] = useState<{ title: string; chips: string[] }[]>([]);
  const [studio, setStudio] = useState<any>(null);
  const [baselineReady, setBaselineReady] = useState<boolean | null>(null);

  useEffect(() => {
    apiChips(mode).then((r) => setChips(r.groups));
  }, [mode]);

  useEffect(() => {
    apiGetBaseline()
      .then((result) => setBaselineReady(Boolean(result?.baseline)))
      .catch(() => setBaselineReady(false));
  }, []);

  async function runExplain(q: string) {
    setThread((t) => [...t, { type: "user", text: q }]);

    const resp = (await apiExplain({ mode, question: q, text: q })) as ExplainResponse;
    setThread((t) => [...t, { type: "system", payload: resp }]);
    setStudio(resp);
  }

  async function upgrade() {
    const r = await apiCheckout();
    if (r?.url) window.location.href = r.url;
  }

  const baselineLocked = baselineReady !== true;
  const statusMessage =
    baselineReady === null
      ? "Checking hidden baseline..."
      : baselineReady === false
      ? "Hidden baseline required. Visit Settings to configure your DOB/TOB/POB."
      : "";

  return (
    <div className="h-screen grid grid-cols-[280px_1fr_360px]">
      <aside className="border-r border-white/10 p-6 flex flex-col gap-8 bg-black/20">
        <div className="flex items-center justify-between gap-2 text-sm text-white/60">
          <span>Notebook</span>
          <Link href="/settings" className="text-xs uppercase tracking-[0.16em] text-white/40 hover:text-white/60">
            Settings
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {chips.map((group) => (
            <div key={group.title}>
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-white/20 mb-2">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-1">
                {group.chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => runExplain(chip)}
                    disabled={baselineLocked}
                    className="px-2 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex flex-col min-h-0 bg-black/20">
        <header className="p-8 pb-0 space-y-4">
          <div className="flex gap-2">
            {(["self", "situation", "pair", "group"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  mode === m
                    ? "bg-white text-black border-white"
                    : "text-white/40 border-white/10 hover:border-white/30"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white/90">
            Sovereign Oracle
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Thread messages={thread} />
          {baselineLocked && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-4">
              <p className="text-sm text-amber-500/90 font-medium">
                {statusMessage}
              </p>
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-white/5 bg-black/40">
          <div className="max-w-2xl mx-auto">
            <Composer 
              onSend={runExplain} 
              disabled={baselineLocked} 
              placeholder={baselineLocked ? "Configure baseline to start..." : "Ask the oracle..."} 
            />
          </div>
        </footer>
      </main>

      <StudioPanel data={studio} />
    </div>
  );
}
