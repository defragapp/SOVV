"use client"
import * as React from "react"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CovenantPage() {
  const [input, setInput] = React.useState("")

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em]">Covenant Briefs</h3>
      </div>
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-mono text-[#3F3F46]">No saved briefs.</p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-px">
      <div className="border border-white/[0.06] bg-[#080808] p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Baseline Design</p>
        <p className="text-xs text-[#71717A]">Context active.</p>
      </div>
      <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5 opacity-40">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Save to Library</p>
        <p className="text-xs text-[#52525B]">Requires Pro</p>
      </div>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 max-w-sm mx-auto opacity-50">
        <div className="w-10 h-10 border border-white/[0.08] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#71717A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="gap-2 flex flex-col">
          <h2 className="text-base font-medium text-[#FAFAFA] tracking-tight">Faith connected to repair.</h2>
          <p className="text-xs text-[#52525B] font-mono leading-relaxed">
            Reflect on responsibility<br />and the next honest step.
          </p>
        </div>
      </div>

      <div className="border border-white/[0.08] bg-[#080808] focus-within:border-white/[0.18] transition-colors duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share the situation here..."
          className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3F3F46] resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-[#3F3F46] font-mono tracking-wide">ENTER TO REFLECT</span>
          <Button
            size="sm"
            variant="secondary"
            disabled={!input}
            className="rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            Generate Brief
          </Button>
        </div>
      </div>
    </div>
  )

  const mobileTabs = [
    { id: "input", label: "Input", content: mainInputArea },
    {
      id: "result",
      label: "Brief",
      content: (

        <div className="flex flex-col gap-6 p-4">
          <div className="border-b border-white/[0.04] pb-6">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em] mb-4">The Story in Plain Language</p>
            <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed">The desire to fix it immediately is bypassing the need for actual repair. True repair requires waiting for the other person to be ready to hear it.</p>
          </div>
          <div className="border-b border-white/[0.04] pb-6">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em] mb-4">The Scripture Connection</p>
            <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed opacity-80">&quot;Let every person be quick to hear, slow to speak, slow to anger.&quot;<br/>— James 1:19</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em] mb-4">One Grounded Response</p>
            <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed">Wait. When the time is right, take responsibility for your part without expecting them to fix theirs.</p>
          </div>
        </div>

      )
    },
    { id: "context", label: "Context", content: contextContent }
  ]

  return (
    <WorkspaceShell
      spaceName="Covenant"
      sidebar={sidebarContent}
      main={mainInputArea}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
