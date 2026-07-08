"use client"

import * as React from "react"

interface PanelHeaderProps {
  label: string
  title?: string
  detail?: string
  right?: React.ReactNode
}

interface EvidenceChipProps {
  label: string
  tone?: "neutral" | "accent"
}

interface PremiumStateProps {
  label: string
  title: string
  body: string
  action?: React.ReactNode
}

interface PremiumLoadingStateProps {
  label?: string
  body?: string
}

interface OsHintCardProps {
  label: string
  body: string
  action?: React.ReactNode
}

export function PanelHeader({ label, title, detail, right }: PanelHeaderProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-b border-white/[0.06] px-5">
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">{label}</p>
        {title && <p className="mt-0.5 truncate text-[12px] leading-snug text-[#c8c2bc]">{title}</p>}
        {detail && <p className="mt-0.5 truncate text-[10px] leading-snug text-[#4f4b47]">{detail}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

export function EvidenceChip({ label, tone = "neutral" }: EvidenceChipProps) {
  const accent = tone === "accent"
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] ${
        accent
          ? "border-[#e0743a]/20 bg-[#e0743a]/[0.04] text-[#e0743a]/60"
          : "border-white/[0.08] bg-white/[0.03] text-[#4f4b47]"
      }`}
      style={{ borderRadius: "var(--radius-minimal)" }}
    >
      {label}
    </span>
  )
}

export function PremiumEmptyState({ label, title, body, action }: PremiumStateProps) {
  return (
    <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center">
      <div className="relative max-w-sm overflow-hidden border border-white/[0.08] bg-white/[0.025] px-6 py-7 backdrop-blur-sm" style={{ borderRadius: "var(--radius-container)" }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e0743a]/50 to-transparent" />
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">{label}</p>
        <p className="text-[15px] leading-snug text-[#f4efe9]">{title}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-[#76716b]">{body}</p>
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  )
}

export function PremiumLoadingState({ label = "Reading the signal", body = "The system is separating the moment from the pattern." }: PremiumLoadingStateProps) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute h-9 w-9 rounded-full border border-white/[0.08]" />
        <span className="absolute h-9 w-9 animate-spin rounded-full border border-transparent border-t-[#e0743a]/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#e0743a]/60" />
      </div>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">{label}</p>
        <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#76716b]">{body}</p>
      </div>
    </div>
  )
}

export function PremiumErrorState({ label, title, body, action }: PremiumStateProps) {
  return (
    <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center">
      <div className="max-w-sm border border-white/[0.08] bg-white/[0.025] px-6 py-7" style={{ borderRadius: "var(--radius-container)" }}>
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">{label}</p>
        <p className="text-[15px] leading-snug text-[#f4efe9]">{title}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-[#76716b]">{body}</p>
        {action && <div className="mt-5 flex flex-col items-center gap-3">{action}</div>}
      </div>
    </div>
  )
}

export function OsHintCard({ label, body, action }: OsHintCardProps) {
  return (
    <div className="border border-white/[0.07] bg-white/[0.025] px-4 py-3" style={{ borderRadius: "var(--radius-container)" }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">{label}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-[#76716b]">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
