"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ExplainResponse } from "@sovereign/core";
import { apiExplain, apiChips, apiCheckout, apiGetBaseline } from "@/lib/api";
import { Thread } from "@/components/Thread";
import { Composer } from "@/components/Composer";
import { StudioPanel } from "@/components/StudioPanel";

export default function AppPage() {
  const [mode, setMode] = useState<"self" | "situation" | "pair" | "group">("self");
  const [thread, setThread] = useState<any[]>([]);
  const [chips, setChips] = useState<{ title: string; chips: string[] }[]>([]);
  const [studio, setStudio] = useState<any>(null);
  const [baselineReady, setBaselineReady] = useState<boolean | null>(null);

  useEffect(() => {
    apiChips(mode).then((r) => setChips(r.groups));
  }, [mode]);import Link from "next/link";
import MemoryInsights from "../../components/MemoryInsights";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-5xl font-semibold leading-tight">
        The questions you don't
        <br />
        know how to ask <span className="text-white">anywhere else.</span>
      </h1>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-white/60 font-light">
        <ul className="space-y-4">
          <li>• Am I in alignment right now?</li>
          <li>• Why does this moment feel so intense?</li>
          <li>• Why do I keep reacting this way?</li>
          <li>• What's actually happening between us?</li>
        </ul>
        <ul className="space-y-4">
          <li>• Why does this keep happening to me?</li>
          <li>• What am I not seeing about myself?</li>
          <li>• What's the meaning of this moment?</li>
        </ul>
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/app"
          className="rounded-xl bg-white px-5 py-3 text-black font-medium"
        >
          Start
        </Link>
        <Link href="/app">See an example</Link>
      </div>

      <div className="mt-14 rounded-2xl border border-white/15 p-6">
        <p className="text-white/70 text-sm mb-3">Example output</p>
        <div className="space-y-2">
          <p><span className="font-semibold">What's going on:</span> One person wants reassurance. The other takes space.</p>
          <p><span className="font-semibold">Why it repeats:</span> Accusation triggers defensiveness. Defensiveness triggers escalation.</p>
          <p><span className="font-semibold">One better next step:</span> Replace blame with a direct feeling and a simple request.</p>
          <p className="text-white/50 text-sm">Confidence: Medium</p>
        </div>
      </div>

      <MemoryInsights />
    </main>
  );
}


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
      <aside className="border-r border-white/10 p-4">
        <div className="flex items-center justify-between gap-2 text-sm text-white/60">
          <span>Notebook</span>
          <Link href="/settings" className="text-xs uppercase tracking-[0.16em] text-white/80">
            Settings
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          <button className="w-full text-left rounded-lg px-3 py-2 bg-white/5">Baseline</button>
          <button className="w-full text-left rounded-lg px-3 py-2 bg-white/5">Moments</button>
          <button className="w-full text-left rounded-lg px-3 py-2 bg-white/5">People</button>
          <button className="w-full text-left rounded-lg px-3 py-2 bg-white/5">Exports</button>
        </div>

        <div className="mt-8 text-sm text-white/60">Mode</div>
        <div className="mt-3 space-y-2">
          {(["self", "situation", "pair", "group"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`w-full text-left rounded-lg px-3 py-2 border border-white/10 ${mode === m ? "bg-white text-black" : "bg-transparent text-white"}`}
            >
              {m === "self" ? "Me" : m === "situation" ? "Moment" : m === "pair" ? "1:1" : "Group"}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <button onClick={upgrade} className="w-full rounded-xl bg-white px-4 py-2 text-black font-medium">
            Upgrade
          </button>
        </div>
      </aside>

      <main className="p-6 overflow-y-auto">
        {statusMessage ? (
          <div className="mb-6 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-100">
            {statusMessage} <Link href="/settings" className="underline">Open Settings</Link>
          </div>
        ) : null}
        <Thread items={thread} chipGroups={chips} onChip={runExplain} />
        <Composer
          onSubmit={runExplain}
          disabled={baselineLocked}
          hint={baselineLocked ? "Set your hidden baseline in Settings before asking for an explanation." : undefined}
        />
      </main>

      <aside className="border-l border-white/10 p-4 overflow-y-auto">
        <StudioPanel payload={studio} onUpgrade={upgrade} />
      </aside>
    </div>
  );
}
