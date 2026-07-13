import type { ReactNode } from "react"
import ManageSubscription from "@/components/spaces/ManageSubscription"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <div className="bg-[#08070a] px-6 pb-20">
        <div className="mx-auto max-w-2xl border-t border-white/[0.06] pt-10">
          <ManageSubscription />
        </div>
      </div>
    </>
  )
}
