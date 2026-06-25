"use client"

/**
 * OsHeader
 *
 * Persistent OS-level context bar showing current space + last input.
 * Additive -- does not replace SpaceShell header yet.
 * Reads from systemStore -- no props needed.
 */

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSystemStore } from "@/state/systemStore"

function resolveSpaceFromPath(pathname: string): string {
  if (pathname.includes("/defrag")) return "Defrag"
  if (pathname.includes("/alignment")) return "Alignment"
  if (pathname.includes("/covenant")) return "Covenant"
  if (pathname.includes("/app")) return "Library"
  return "Sovereign.os"
}

export function OsHeader() {
  const pathname = usePathname()
  const { lastInput, isProcessing } = useSystemStore()
  const spaceName = resolveSpaceFromPath(pathname)

  const inputPreview = lastInput
    ? lastInput.type === "freeform"
      ? lastInput.rawText.slice(0, 60) + (lastInput.rawText.length > 60 ? "..." : "")
      : lastInput.selectedPreset
    : null

  return (
    <div className="h-9 border-b border-white/[0.06] bg-[#08070a]/95 backdrop-blur-md flex items-center px-5 gap-4 shrink-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#f4efe9]/60 shrink-0">
        {spaceName}
      </span>
      <span className="text-white/[0.12] text-xs shrink-0">/</span>
      <span className="font-mono text-[9px] text-[#4f4b47] truncate flex-1 min-w-0">
        {isProcessing
          ? "Processing..."
          : inputPreview ?? "No input yet"}
      </span>
      {isProcessing && (
        <span className="w-1.5 h-1.5 rounded-sm bg-[#c8c2bc]/40 shrink-0 animate-pulse" />
      )}
    </div>
  )
}

export default OsHeader