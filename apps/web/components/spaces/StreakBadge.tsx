"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakActive: boolean; // true if used today
}

function FlameIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1C7 1 9.5 3.5 9.5 6C9.5 6 8.5 5.5 8 5C8 5 9 7 7.5 8.5C7.5 8.5 7.5 7 6.5 6.5C6.5 6.5 7 8 5.5 9C4.5 9.7 4 10.5 4 11.5C4 12.3 4.5 13 7 13C9.5 13 10 12.3 10 11.5C10 10 9 9 9 9C9 9 10.5 8.5 10.5 6.5C10.5 4 7 1 7 1Z"
        fill={active ? "rgba(224,116,58,0.8)" : "rgba(255,255,255,0.15)"}
        stroke={active ? "rgba(224,116,58,0.4)" : "rgba(255,255,255,0.08)"}
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function StreakBadge({ compact = false }: { compact?: boolean }) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/streak")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setStreak(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !streak) return null;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 border border-white/[0.07] bg-[#0c0a0d] px-2.5 py-1.5"
        style={{ borderRadius: 6 }}
        title={`${streak.currentStreak}-day streak`}
      >
        <FlameIcon active={streak.streakActive} />
        <span className="font-mono text-[10px] text-[#76716b]">{streak.currentStreak}</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-white/[0.07] bg-[#0c0a0d] p-5 flex flex-col gap-4"
        style={{ borderRadius: 12 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Streak</p>
          <FlameIcon active={streak.streakActive} />
        </div>

        {/* Current streak */}
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-4xl text-[#f4efe9]">{streak.currentStreak}</span>
          <span className="text-[13px] text-[#76716b]">
            {streak.currentStreak === 1 ? "day" : "days"}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-sm ${streak.streakActive ? "bg-[#e0743a]/70" : "bg-white/[0.12]"}`}
          />
          <span className="text-[11px] text-[#76716b]">
            {streak.streakActive ? "Active today" : "Use Sovereign.os today to keep your streak"}
          </span>
        </div>

        {/* Longest streak */}
        {streak.longestStreak > 0 && (
          <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">Longest</span>
            <span className="font-mono text-[11px] text-[#76716b]">{streak.longestStreak} days</span>
          </div>
        )}

        {/* Visual streak dots — last 7 days */}
        <StreakDots streak={streak} />
      </motion.div>
    </AnimatePresence>
  );
}

function StreakDots({ streak }: { streak: StreakData }) {
  // Generate last 7 days labels
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      active: i >= 7 - streak.currentStreak,
      isToday: i === 6,
    };
  });

  return (
    <div className="flex items-center gap-1.5">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className={`w-full h-1.5 rounded-sm ${
              day.active
                ? "bg-[#e0743a]/70"
                : "bg-white/[0.06]"
            } ${day.isToday && !day.active ? "border border-white/[0.12]" : ""}`}
          />
          <span className={`font-mono text-[8px] ${day.isToday ? "text-[#76716b]" : "text-[#4f4b47]"}`}>
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}