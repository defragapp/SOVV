export default function WorkspaceLoading() {
  return (
    <div className="flex h-[100dvh] w-screen bg-[#08070a] overflow-hidden">
      <div className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.05] p-5 gap-4">
        <div className="h-11 border-b border-white/[0.06] -mx-5 px-5 flex items-center mb-2">
          <div className="skeleton skeleton-text w-16" />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-4/5" />
          <div className="skeleton skeleton-text w-3/5" />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-11 border-b border-white/[0.05] px-6 flex items-center">
          <div className="skeleton skeleton-text w-16" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-5 h-5 border border-white/[0.12] border-t-[#e0743a]/40 rounded-full animate-spin" />
            <div className="skeleton skeleton-text w-32" />
          </div>
        </div>
        <div className="flex-none px-6 pb-6">
          <div className="border border-white/[0.06] rounded-[16px] p-5 flex flex-col gap-3">
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-2/3" />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-col w-[300px] border-l border-white/[0.05] p-5 gap-3">
        <div className="h-11 border-b border-white/[0.06] -mx-5 px-5 flex items-center mb-2">
          <div className="skeleton skeleton-text w-16" />
        </div>
        <div className="skeleton skeleton-text w-full" />
        <div className="skeleton skeleton-text w-3/4" />
      </div>
    </div>
  )
}
