"use client"
import * as React from "react"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AlignmentPage() {
  const [input, setInput] = React.useState("")

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em]">Library</h3>
      </div>
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-mono text-[#3F3F46]">No recent sessions.</p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-px">
      <div className="border border-white/[0.06] bg-[#080808] p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Baseline Design</p>
        <p className="text-xs text-[#71717A]">Your core context is active.</p>
      </div>
      <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5 opacity-40">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Save to Sovereign</p>
        <p className="text-xs text-[#52525B]">Requires Pro</p>
      </div>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 max-w-sm mx-auto opacity-50">
        <div className="w-10 h-10 border border-white/[0.08] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#71717A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="gap-2 flex flex-col">
          <h2 className="text-base font-medium text-[#FAFAFA] tracking-tight">Align your focus.</h2>
          <p className="text-xs text-[#52525B] font-mono leading-relaxed">
            Describe your priorities,<br />or set your path forward.
          </p>
        </div>
      </div>

      <div className="border border-white/[0.08] bg-[#080808] focus-within:border-white/[0.18] transition-colors duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste here..."
          className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3F3F46] resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-[#3F3F46] font-mono tracking-wide">ENTER TO ALIGN</span>
          <Button
            size="sm"
            disabled={!input}
            className="rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            Generate Brief
          </Button>
        </div>
      </div>
    </div>
  )

  const mainResultArea = (
    <div className="border border-white/[0.06] bg-[#080808] p-6">
      <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em] mb-3">Alignment Brief</p>
      <p className="text-xs text-[#52525B] font-mono">Results will appear here after aligning.</p>
    </div>
  )

  const mobileTabs = [
    { id: "input", label: "Input", content: mainInputArea },
    { id: "result", label: "Result", content: mainResultArea },
    { id: "context", label: "Context", content: contextContent }
  ]

  return (
    <WorkspaceShell
      spaceName="Alignment"
      sidebar={sidebarContent}
      main={mainInputArea}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
