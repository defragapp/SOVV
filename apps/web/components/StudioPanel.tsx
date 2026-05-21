"use client";

import { useEffect, useMemo, useState } from "react";
import { AudioOverview } from "./AudioOverview";
import { AnimatedOverview } from "./AnimatedOverview";
import { ArtifactList } from "./ArtifactList";
import { saveArtifact } from "@/lib/storage";

export function StudioPanel({
  payload,
  onUpgrade
}: {
  payload: any;
  onUpgrade: () => void;
}) {
  const [audioFormat, setAudioFormat] = useState<"overview"|"two-view"|"repair">("overview");
  const [steer, setSteer] = useState("");
  const [generating, setGenerating] = useState(false);

  const isFree = payload?.type === "ok" ? payload.plan === "free" : true;

  // “Generate” in Studio should not block thread use.
  async function generateStudio() {
    if (!payload || payload.type !== "ok") return;
    setGenerating(true);

    // v1: reuse existing audio/video; steering prompt can be used later.
    // We preserve NotebookLM behavior: generate while user keeps working. 
    setTimeout(() => setGenerating(false), 600);
  }

  function saveCurrent() {
    if (!payload || payload.type !== "ok") return;
    saveArtifact({
      id: crypto.randomUUID(),
      type: "audio",
      title: "Audio overview",
      createdAt: Date.now(),
      payload: payload.audio
    });
    saveArtifact({
      id: crypto.randomUUID(),
      type: "video",
      title: "Video overview",
      createdAt: Date.now(),
      payload: payload.video
    });
    alert("Saved to your library.");
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-white/60">Studio</div>
        <div className="mt-2 text-white/80 text-sm">
          Create audio and video versions you can replay while you keep working.
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Audio overview</div>
          {generating ? <span className="text-xs text-white/50">Generating…</span> : null}
        </div>

        <div className="mt-3 flex gap-2">
          {(["overview","two-view","repair"] as const).map(f => (
            <button
              key={f}
              onClick={() => setAudioFormat(f)}
              className={`rounded-full px-3 py-1 text-xs border border-white/15 ${audioFormat===f ? "bg-white text-black" : "text-white/80"}`}
            >
              {f === "overview" ? "Overview" : f === "two-view" ? "Two views" : "Repair"}
            </button>
          ))}
        </div>

        <input
          value={steer}
          onChange={(e) => setSteer(e.target.value)}
          placeholder="Optional: focus on what I should say next"
          className="mt-3 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none"
        />

        <div className="mt-3 flex gap-2">
          <button
            onClick={generateStudio}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm"
          >
            Generate
          </button>
          {isFree ? (
            <button
              onClick={onUpgrade}
              className="rounded-xl bg-white px-4 py-2 text-black text-sm font-medium"
            >
              Upgrade
            </button>
          ) : null}
        </div>

        <div className="mt-4">
          <AudioOverview payload={payload?.type === "ok" ? payload.audio : null} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
        <div className="font-medium">Video overview</div>
        <div className="mt-3">
          <AnimatedOverview scenes={payload?.type === "ok" ? payload.video?.scenes || [] : []} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={saveCurrent} className="rounded-xl border border-white/15 px-4 py-2 text-sm">
          Save to library
        </button>
      </div>

      <ArtifactList />
    </div>
  );
}
