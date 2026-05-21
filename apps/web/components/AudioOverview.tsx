"use client";

import { useMemo, useRef, useState } from "react";

export function AudioOverview({ payload }: { payload: any }) {
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [rate, setRate] = useState(1);

  const script = payload?.script || "";

  function play() {
    if (!script) return;
    stop();

    const u = new SpeechSynthesisUtterance(script);
    u.rate = rate;
    u.onend = () => setPlaying(false);
    utterRef.current = u;

    speechSynthesis.speak(u);
    setPlaying(true);
  }

  function stop() {
    speechSynthesis.cancel();
    setPlaying(false);
  }

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="text-sm text-white/70 mb-2">Listen while you keep working</div>

      <div className="flex items-center gap-2">
        {!playing ? (
          <button onClick={play} className="rounded-lg bg-white px-3 py-1 text-black text-sm font-medium">
            Play
          </button>
        ) : (
          <button onClick={stop} className="rounded-lg border border-white/15 px-3 py-1 text-sm">
            Stop
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/50">Speed</span>
          {[1, 1.25, 1.5].map(v => (
            <button
              key={v}
              onClick={() => setRate(v)}
              className={`rounded-full px-2 py-1 text-xs border border-white/15 ${rate===v ? "bg-white text-black" : "text-white/80"}`}
            >
              {v}x
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-white/40 line-clamp-3">
        {script}
      </div>
    </div>
  );
}
