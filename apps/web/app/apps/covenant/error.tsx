"use client"

import * as React from "react"
import Link from "next/link"
import { PremiumErrorState } from "@/components/spaces/WorkspaceStates"

export default function SpaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[Covenant error]", error)
  }, [error])

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-[#08070a] text-[#f4efe9]">
      <PremiumErrorState
        label="Covenant interrupted"
        title="The workspace hit a recoverable error."
        body="Your session is still intact. Try reopening the workspace, or return to the Covenant entry surface."
        action={(
          <>
            <button
              onClick={reset}
              className="inline-flex h-10 w-full items-center justify-center bg-[#f4efe9] px-5 text-sm font-medium text-[#08070a] transition-opacity hover:opacity-90"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              Try again
            </button>
            <Link
              href="/apps/covenant"
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] transition-colors hover:text-[#76716b]"
            >
              Return to Covenant
            </Link>
          </>
        )}
      />
    </div>
  )
}
