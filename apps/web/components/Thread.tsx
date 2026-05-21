"use client";

import { Chips } from "./Chips";
import { AnimatedOverview } from "./AnimatedOverview";

export function Thread({
  items,
  chipGroups,
  onChip
}: {
  items: any[];
  chipGroups: { title: string; chips: string[] }[];
  onChip: (q: string) => void;
}) {
  return (
    <div className="space-y-6">
      {items.length === 0 && (
        <div className="text-white/70">
          Ask something real. Keep it simple. We’ll make it clearer and give you one better next step.
        </div>
      )}

      {items.map((it, idx) => {
        if (it.type === "user") {
          return (
            <div key={idx} className="rounded-2xl bg-white/5 p-4">
              <div className="text-white/60 text-xs mb-2">You</div>
              <div className="text-white">{it.text}</div>
            </div>
          );
        }

        const payload = it.payload;
        if (!payload) return null;

        if (payload.type === "support") {
          return (
            <div key={idx} className="rounded-2xl border border-white/15 p-4 bg-red-500/10">
              <div className="text-white/60 text-xs mb-2">Sovereign</div>
              <div className="text-white mb-3">{payload.message}</div>
              <div className="text-white/70 text-sm">Resources</div>
              <ul className="list-disc list-inside text-white/70 text-sm">
                {payload.resources?.map((r: any, i: number) => (
                  <li key={i}>
                    <a href={r.link} className="underline text-white/80">
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-white/50">Confidence: Support mode</div>
            </div>
          );
        }

        const r = payload.result;

        return (
          <div key={idx} className="rounded-2xl border border-white/10 p-5 bg-white/5">
            <div className="text-white/60 text-xs mb-2">Sovereign</div>

            <div className="space-y-3">
              <p><span className="font-semibold">What’s going on:</span> {r.whatsGoingOn}</p>
              <p><span className="font-semibold">Why it keeps repeating:</span> {r.whyRepeating}</p>
              <p><span className="font-semibold">One better next step:</span> {r.nextStep}</p>
              <p className="text-white/70 text-sm">{r.limits}</p>
              <p className="text-xs text-white/50">Confidence: {r.confidence}</p>
            </div>

            <div className="mt-5">
              <Chips groups={chipGroups} onPick={onChip} />
            </div>

            <div className="mt-6">
              <AnimatedOverview scenes={payload.video?.scenes || []} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
