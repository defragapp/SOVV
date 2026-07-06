export default function LibraryLoading() {
  return (
    <div className="flex h-[100dvh] w-screen bg-[#08070a] overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.05] p-5 gap-4">
        <div className="h-11 border-b border-white/[0.06] -mx-5 px-5 flex items-center mb-2">
          <div className="skeleton skeleton-text w-20" />
        </div>
        <div className="skeleton skeleton-text w-32" />
        <div className="skeleton skeleton-text w-24" />
      </div>

      {/* Main skeleton */}
      <div className="flex-1 flex flex-col p-6 md:p-10 max-w-3xl mx-auto w-full">
        <div className="skeleton skeleton-text w-16 mb-6" />
        <div className="skeleton skeleton-heading w-48 mb-3" />
        <div className="skeleton skeleton-text w-64 mb-10" />
        <div className="flex flex-col gap-0 border border-white/[0.06] overflow-hidden" style={{ borderRadius: 14 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="px-6 py-5 border-b border-white/[0.05] last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="skeleton skeleton-text w-16" />
                <div className="skeleton skeleton-text w-12" />
              </div>
              <div className="skeleton skeleton-text w-full mb-1" />
              <div className="skeleton skeleton-text w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
