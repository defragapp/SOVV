import { PanelHeader, PremiumLoadingState } from "@/components/spaces/WorkspaceStates"

export default function SpaceLoading() {
  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#08070a] text-[#f4efe9]">
      <div className="hidden w-[260px] flex-col border-r border-white/[0.05] lg:flex">
        <PanelHeader label="Baseline Design" />
        <div className="flex flex-col gap-2.5 p-5">
          <div className="skeleton skeleton-text w-24" />
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-4/5" />
          <div className="skeleton skeleton-text w-3/5" />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <PanelHeader label="Defrag" detail="Preparing the workspace" />
        <PremiumLoadingState
          label="Opening Defrag"
          body="Sovereign is preparing the private context layer before the workspace appears."
        />
      </div>

      <div className="hidden w-[300px] flex-col border-l border-white/[0.05] lg:flex">
        <PanelHeader label="Saved results" />
        <div className="flex flex-col gap-3 p-5">
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-3/4" />
        </div>
      </div>
    </div>
  )
}
