export default function SpaceLoading() {
  return (
    <div className="flex h-[100dvh] w-screen bg-[#08070a] overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.05] p-5 gap-4">
        <div className="h-11 border-b border-white/[0.06] -mx-5 px-5 flex items-center mb-2">
          <div className="skeleton skeleton-text w-16" />
        </div>
        <div className="skeleton skeleton-text w-24" />
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="skeleton skeleton-text w-full" />
          <div className="skeleton skeleton-text w-4/5" />
          <div className="skeleton skeleton-text w-3/5" />
        </div>
      </div>

      {/* Main skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-[52px] border-b border-white/[0.05] px-6 flex items-center">
          <div className="skeleton skeleton-text w-20" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="w-5 h-5 border border-white/[0.12] border-t-[#e0743a]/40 rounded-full animate-spin" />
        </div>
      </div>

      {/* Right panel skeleton */}
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
