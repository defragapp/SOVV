import { DefragWorkspaceSkeleton } from "@/components/spaces/SkeletonLoader"

export default function WorkspaceLoading() {
  return (
    <div className="flex h-[100dvh] w-screen bg-[#08070a] overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.05] p-5 gap-4">
        <div className="h-11 border-b border-white/[0.06] -mx-5 px-5 flex items-center mb-2">
          <div className="skeleton skeleton-text w-16" />
        </div>
        <div className="flex flex-col gap-2.5">
          {[1, 0.8, 0.6].map((w, i) => (
            <div key={i} className="h-3 bg-white/[0.04] rounded relative overflow-hidden" style={{ width: `${w * 100}%` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.4s_linear_infinite]" />
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <div className="h-11 border-b border-white/[0.05] px-6 flex items-center">
          <div className="skeleton skeleton-text w-16" />
        </div>
        <div className="flex-1 overflow-hidden">
          <DefragWorkspaceSkeleton />
        </div>
        {/* Input bar skeleton */}
        <div className="flex-none px-6 pb-6 pt-3">
          <div className="border border-white/[0.06] p-5 flex flex-col gap-3" style={{ borderRadius: 16 }}>
            <div className="h-3.5 bg-white/[0.04] rounded w-full" />
            <div className="h-3.5 bg-white/[0.04] rounded w-2/3" />
            <div className="flex justify-end mt-1">
              <div className="h-8 w-20 bg-white/[0.04] rounded-lg" />
            </div>
          </div>
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