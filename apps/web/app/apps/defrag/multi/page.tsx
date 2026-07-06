"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { MultiPersonDefrag } from "@/components/spaces/MultiPersonDefrag"
import Link from "next/link"

export default function DefragMultiPage() {
  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Multi-person</p>
      </div>
      <div className="px-5 pt-6 pb-5 flex flex-col gap-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50 mb-3">What this does</p>
          <p className="text-[12px] text-[#4f4b47] leading-relaxed">
            Read the patterns across three or more people in a shared situation — what each person likely has active, how the group dynamic forms, and your clearest next move.
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#2e2b28] mb-3">Use when</p>
          <div className="flex flex-col gap-0">
            {[
              "A family situation involves multiple people",
              "A workplace dynamic has more than two sides",
              "You're navigating a group conflict",
              "You want to see the system, not just the moment",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 py-2 border-b border-white/[0.03] last:border-0">
                <span className="text-[#e0743a]/30 text-[10px] mt-0.5 shrink-0">—</span>
                <span className="text-[11px] text-[#3a3733] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2 border-t border-white/[0.04]">
          <Link href="/apps/defrag/workspace" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#3a3733] hover:text-[#76716b] transition-colors">
            ← Solo Defrag
          </Link>
        </div>
      </div>
    </div>
  )

  const main = (
    <div className="flex flex-col h-full">
      <div className="h-11 border-b border-white/[0.06] px-6 flex items-center shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Defrag — Group</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <MultiPersonDefrag />
      </div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebar}
      contextPanel={<div />}
      main={main}
      mobileTabs={[
        { id: "thread", label: "Group", content: main },
        { id: "context", label: "About", content: sidebar },
      ]}
    />
  )
}