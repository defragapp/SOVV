"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedOverview({ scenes }: { scenes: any[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const total = scenes?.length || 0;

  useEffect(() => {
    if (!playing || total === 0) return;
    const sec = Math.max(2, scenes[index]?.seconds || 4);
    const t = setTimeout(() => {
      setIndex((i) => (i + 1 < total ? i + 1 : i));
    }, sec * 600); // keep snappy for v1
    return () => clearTimeout(t);
  }, [playing, index, total, scenes]);

  function toggle() {
    setPlaying((p) => !p);
  }

  function restart() {
    setIndex(0);
    setPlaying(true);
  }

  if (!scenes || scenes.length === 0) {
    return <div className="text-white/50 text-sm">No video yet.</div>;
    }

  const s = scenes[index];

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="rounded-lg border border-white/15 px-3 py-1 text-sm">
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={restart} className="rounded-lg border border-white/15 px-3 py-1 text-sm">
          Restart
        </button>
        <div className="ml-auto text-xs text-white/50">
          {index + 1}/{total}
        </div>
      </div>

      <div className="mt-3 h-2 w-full rounded bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/50"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-4 space-y-2"
      >
        <div className="text-xs text-white/50 uppercase tracking-wide">{s.type}</div>
        <div className="text-sm font-medium">{s.title}</div>
        <div className="text-white/80 text-sm">{s.text}</div>

        {s.type === "action" && (
          <div className="mt-2 rounded-xl bg-white text-black px-3 py-2 text-sm font-medium">
            {s.text}
          </div>
        )}
      </motion.div>
    </div>
  );
}
