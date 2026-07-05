import Link from "next/link"

export default function AppsNotFound() {
  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-[#08070a] text-[#f4efe9] px-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/apps/defrag" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors">
            Sovereign.os
          </Link>
          <span className="text-[#4f4b47] text-xs">/</span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4f4b47]">Not found</span>
        </div>

        {/* Ambient */}
        <div className="relative">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">404</p>
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.5rem)] text-[#f4efe9] leading-tight tracking-[-0.02em] text-balance">
            This space doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-[13px] text-[#76716b] leading-relaxed">
            Return to Defrag and start from what is actually happening.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center mt-2">
          <Link
            href="/apps/defrag"
            className="h-9 px-5 bg-[#f4efe9] text-[#08070a] text-[12px] font-medium hover:opacity-90 transition-opacity flex items-center"
            style={{ borderRadius: "var(--radius-button)" }}
          >
            Open Defrag
          </Link>
          <Link
            href="/apps/alignment"
            className="h-9 px-5 border border-white/[0.1] text-[#76716b] text-[12px] hover:text-[#f4efe9] hover:border-white/[0.2] transition-colors flex items-center"
            style={{ borderRadius: "var(--radius-button)" }}
          >
            Alignment
          </Link>
        </div>
      </div>
    </div>
  )
}
