"use client"
import * as React from "react"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DefragPage() {
  const [input, setInput] = React.useState("")

  const sidebarContent = (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-[#A1A1AA] uppercase tracking-widest">Library</h3>
        <p className="text-sm text-[#52525B]">No recent sessions.</p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="p-6 space-y-6">
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-sm">Baseline Design</CardTitle>
          <CardDescription className="text-xs mt-1">Your core context is active.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="premium" className="opacity-50">
        <CardHeader>
          <CardTitle className="text-sm">Save to Sovereign</CardTitle>
          <CardDescription className="text-xs mt-1">Requires Pro</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end space-y-6">
       <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto opacity-60">
          <svg className="w-12 h-12 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-xl font-medium">What is happening right now?</h2>
          <p className="text-sm text-[#A1A1AA]">Paste a message, describe a conflict, or share a repeating dynamic.</p>
       </div>
       <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/25 transition-all">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste here..."
            className="w-full bg-transparent text-[#FDFDFD] placeholder:text-[#52525B] resize-none outline-none min-h-[120px] text-[16px]"
          />
          <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
             <span className="text-xs text-[#52525B]">Press Enter to Defrag</span>
             <Button size="sm" disabled={!input}>Defrag Pattern</Button>
          </div>
       </div>
    </div>
  )

  const mainResultArea = (
    <div className="space-y-6">
       <Card variant="elevated">
          <CardHeader>
             <CardTitle>Structured Output</CardTitle>
             <CardDescription>Results will appear here after running Defrag.</CardDescription>
          </CardHeader>
       </Card>
    </div>
  )

  const mobileTabs = [
    { id: "input", label: "Input", content: mainInputArea },
    { id: "result", label: "Result", content: mainResultArea },
    { id: "context", label: "Context", content: contextContent }
  ]

  return (
    <WorkspaceShell 
      spaceName="Defrag"
      sidebar={sidebarContent}
      main={mainInputArea}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
