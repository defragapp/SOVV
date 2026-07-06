"use client";

import { motion } from "framer-motion";

// ── Primitive shimmer block ──────────────────────────────────────────────────
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-white/[0.04] relative overflow-hidden ${className}`}
      style={{ borderRadius: 6 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// ── Library skeleton ─────────────────────────────────────────────────────────
export function LibrarySkeleton() {
  return (
    <div className="flex flex-col gap-0 animate-pulse" aria-label="Loading library…" aria-busy="true">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-16" />
      </div>

      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] last:border-0"
        >
          <div className="flex items-center gap-4 flex-1">
            <Shimmer className="h-2.5 w-12 shrink-0" />
            <Shimmer className="h-3 w-48" />
          </div>
          <Shimmer className="h-2.5 w-10 shrink-0" />
        </div>
      ))}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/[0.05]">
        <Shimmer className="h-2.5 w-40" />
      </div>
    </div>
  );
}

// ── Defrag workspace skeleton ────────────────────────────────────────────────
export function DefragWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-0 animate-pulse" aria-label="Loading workspace…" aria-busy="true">
      {/* Input area */}
      <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <Shimmer className="w-1.5 h-1.5 mt-2 shrink-0 rounded-sm" />
          <div className="flex-1 flex flex-col gap-2">
            <Shimmer className="h-3.5 w-full" />
            <Shimmer className="h-3.5 w-4/5" />
            <Shimmer className="h-3.5 w-3/5" />
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-sm bg-[#e0743a]/30"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
        <Shimmer className="h-2.5 w-36" />
      </div>

      {/* Result rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-6 py-5 border-b border-white/[0.05] last:border-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-2.5 w-20" />
            <div className="flex gap-1.5">
              <Shimmer className="h-5 w-16 rounded" />
              <Shimmer className="h-5 w-14 rounded" />
            </div>
          </div>
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-4/5" />
        </div>
      ))}
    </div>
  );
}

// ── Alignment workspace skeleton ─────────────────────────────────────────────
export function AlignmentWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-0 animate-pulse" aria-label="Loading alignment…" aria-busy="true">
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <Shimmer className="h-3 w-32 mb-2" />
        <Shimmer className="h-2.5 w-48" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-6 py-6 border-b border-white/[0.05] flex flex-col gap-3">
          <Shimmer className="h-2.5 w-24" />
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-3/4" />
          <div className="flex gap-2 mt-1">
            <Shimmer className="h-8 w-24 rounded-lg" />
            <Shimmer className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Covenant workspace skeleton ───────────────────────────────────────────────
export function CovenantWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-0 animate-pulse" aria-label="Loading covenant…" aria-busy="true">
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <Shimmer className="h-3 w-28 mb-2" />
        <Shimmer className="h-2.5 w-40" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-6 py-5 border-b border-white/[0.05] flex flex-col gap-2.5">
          <Shimmer className="h-2.5 w-20" />
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ── Generic page skeleton ─────────────────────────────────────────────────────
export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse" aria-busy="true">
      <Shimmer className="h-6 w-48 mb-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-4/5" />
        </div>
      ))}
    </div>
  );
}