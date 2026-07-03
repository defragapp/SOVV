"use client"
import * as React from "react"
import Link from "next/link"

export default function SpaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[Space error]", error)
  }, [error])

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-[#08070a] text-[#f4efe9]">
      <div className="text-center px-6 max-w-sm">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-6">
          Something went wrong
        </p>
        <p className="text-[14px] text-[#76716b] leading-relaxed mb-8">
          The Space encountered an error. Your session is intact.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={reset}
            className="btn-primary w-full"
          >
            Try again
          </button>
          <Link
            href="/apps/defrag"
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            Return to Defrag
          </Link>
        </div>
      </div>
    </div>
  )
}
