"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SessionOfWeekData {
  session: {
    id: string;
    space: "defrag" | "covenant" | "alignment";
    title: string;
    keyInsight: string;
    bestNextResponse: string;
    createdAt: string;
  } | null;
  prompt: string;
  lastActiveAt: string | null;
}

const SPACE_LABELS: Record<string, string> = {
  defrag: "Defrag",
  covenant: "Covenant",
  alignment: "Alignment",
};

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function SessionOfWeek() {
  const [data, setData] = useState<SessionOfWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this week
    const dismissedAt = localStorage.getItem("sovv_sotw_dismissed");
    if (dismissedAt) {
      const days = daysSince(dismissedAt);
      if (days < 7) {
        setLoading(false);
        setDismissed(true);
        return;
      }
    }

    fetch("/api/notifications/session-of-week")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("sovv_sotw_dismissed", new Date().toISOString());
    setDismissed(true);
  };

  if (loading || dismissed || !data) return null;

  // Only show if user has been dormant (no session in 3+ days)
  const isDormant = data.lastActiveAt
    ? daysSince(data.lastActiveAt) >= 3
    : true;

  if (!isDormant && !data.session) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="border border-[#e0743a]/20 bg-[#e0743a]/[0.04] p-5 flex flex-col gap-4"
        style={{ borderRadius: 12 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-1">
              Session of the week
            </p>
            <p className="text-[13px] text-[#a8a29a] leading-relaxed">
              {data.prompt || "Something from last week worth returning to."}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#4f4b47] hover:text-[#76716b] transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Session card */}
        {data.session && (
          <div className="border border-white/[0.07] bg-[#0c0a0d] p-4 flex flex-col gap-3" style={{ borderRadius: 8 }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#e0743a]/60">
                {SPACE_LABELS[data.session.space] || data.session.space}
              </span>
              <span className="text-[#4f4b47] text-[10px]">·</span>
              <span className="font-mono text-[9px] text-[#4f4b47]">
                {new Date(data.session.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-[14px] text-[#f4efe9] leading-snug">{data.session.title}</p>
            <p className="text-[13px] text-[#a8a29a] leading-relaxed">{data.session.keyInsight}</p>
            {data.session.bestNextResponse && (
              <div className="pt-3 border-t border-white/[0.05]">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#76716b] mb-1.5">
                  Next move
                </p>
                <p className="text-[13px] text-[#c8c2bc] leading-relaxed">
                  {data.session.bestNextResponse}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href={data.session ? `/apps/${data.session.space}/workspace` : "/apps/defrag/workspace"}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors"
          >
            Return to this →
          </Link>
          <button
            onClick={handleDismiss}
            className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}