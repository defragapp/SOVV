"use client"
import * as React from "react"
import { PanelHeader, EvidenceChip } from "@/components/spaces/WorkspaceStates"
import Link from "next/link"

interface Baseline {
  dob: string
  tob: { type: "exact" | "approx"; value: string }
  pob: string
}

interface BaselineStatement {
  statement: string
  chips: string[]
}

interface BaselineSidebarProps {
  baseline: Baseline | null
  baselineLoading: boolean
  baselineStatements: BaselineStatement[]
  statementsLoading: boolean
  datasetStatus: "none" | "pending" | "ready" | "failed" | null
  recurringPattern: string | null
  sessionCount: number
  hasResult: boolean
  historyUsed: boolean
}

function formatBirthSummary(b: Baseline): string {
  const city = b.pob.split(",")[0].trim()
  return `${b.dob} · ${b.tob.value} · ${city}`
}

export function BaselineSidebar({
  baseline,
  baselineLoading,
  baselineStatements,
  statementsLoading,
  datasetStatus,
  recurringPattern,
  sessionCount,
  hasResult,
  historyUsed,
}: BaselineSidebarProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <PanelHeader label="Baseline" />
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.05]">
        {baselineLoading ? (
          <div className="flex flex-col gap-2.5 py-1">
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-4/5" />
            <div className="skeleton skeleton-text w-3/5" />
          </div>
        ) : baseline ? (
          <>
            <p className="font-mono text-[9px] text-[#4f4b47] mb-4 tracking-[0.1em]">{formatBirthSummary(baseline)}</p>
            {statementsLoading ? (
              <div className="flex flex-col gap-2.5 py-1">
                <div className="skeleton skeleton-text w-full" />
                <div className="skeleton skeleton-text w-4/5" />
                <div className="skeleton skeleton-text w-3/5" />
              </div>
            ) : baselineStatements.length > 0 ? (
              <div className="flex flex-col gap-0">
                {baselineStatements.map(({ statement, chips }, i) => (
                  <div key={i} className="py-3 border-b border-white/[0.04] last:border-0">
                    <p className="text-[12px] text-[#c8c2bc] leading-[1.6] mb-2">{statement}</p>
                    {chips.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {chips.map(chip => <EvidenceChip key={chip} label={chip} tone="accent" />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#76716b] leading-relaxed">Your Baseline is active. Behavioral profile is being derived.</p>
            )}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                {datasetStatus === "ready" && <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/50" />}
                {datasetStatus === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />}
                <p className="text-[10px] text-[#4f4b47]">
                  {datasetStatus === "ready" ? "Understanding model active." : datasetStatus === "pending" ? "Compiling…" : "Active in every result."}
                </p>
              </div>
              <a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#76716b] hover:text-[#a8a29a] transition-colors">Edit</a>
            </div>
          </>
        ) : (
          <div className="border border-white/[0.08] bg-white/[0.02] p-4" style={{ borderRadius: "var(--radius-container)" }}>
            <p className="text-[12px] text-[#a8a29a] mb-1">Baseline required</p>
            <p className="text-[12px] text-[#76716b] leading-relaxed mb-3">Add your date, time, and place of birth to begin. This private layer grounds every result.</p>
            <a href="/settings" className="inline-flex h-8 px-4 bg-[#f4efe9] text-[#08070a] text-[11px] font-medium items-center hover:opacity-90 transition-opacity" style={{ borderRadius: "var(--radius-button)" }}>Add birth data →</a>
          </div>
        )}
      </div>
      {baseline && (
        <div className="px-5 pt-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Pattern history</p>
            {sessionCount > 0 && <span className="font-mono text-[8px] text-[#4f4b47]">{sessionCount} session{sessionCount !== 1 ? "s" : ""}</span>}
          </div>
          {recurringPattern ? (
            <div>
              <p className="text-[11px] text-[#76716b] leading-relaxed mb-1">This pattern keeps appearing:</p>
              <p className="text-[11px] text-[#c8c2bc] leading-relaxed italic">"{recurringPattern.length > 80 ? recurringPattern.slice(0, 80) + "…" : recurringPattern}"</p>
            </div>
          ) : hasResult && historyUsed ? (
            <p className="text-[11px] text-[#76716b] leading-relaxed">Past patterns were used in this result.</p>
          ) : (
            <p className="text-[11px] text-[#4f4b47] leading-relaxed">Patterns from past sessions will inform future results.</p>
          )}
        </div>
      )}
      <div className="px-5 pt-4">
        <Link href="/apps/defrag" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">← Back to Defrag</Link>
      </div>
    </div>
  )
}
