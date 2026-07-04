import { cookies } from "next/headers"
import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import AdminPromoPanel from "@/components/marketing/AdminPromoPanel"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Admin — Sovereign.os",
  description: "Owner admin panel for generating ambassador promo codes.",
}

async function getAdminUser() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const headers = new Headers()
  if (cookieHeader) headers.set("cookie", cookieHeader)

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || ""
  const res = await fetch(`${base}/api/admin/me`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  if (!res.ok) return null
  return res.json()
}

export default async function AdminPage() {
  const admin = await getAdminUser()

  if (!admin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-white">
          <h1 className="font-serif text-[28px] tracking-[-0.02em]">Owner access required</h1>
          <p className="mt-4 text-sm text-[#a8a29a]">
            This page is only available to Sovereign.os owners. Please sign in with an owner account or return to the main site.
          </p>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-24 space-y-10">
        <div className="space-y-4">
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Admin</h1>
          <p className="text-sm text-[#a8a29a]">
            Signed in as <span className="text-[#f4efe9]">{admin.email}</span> — role <span className="text-[#f4efe9]">{admin.role}</span>.
          </p>
        </div>

        <div className="rounded-[14px] border border-white/[0.06] bg-white/5 p-8">
          <h2 className="text-[18px] font-medium tracking-[-0.01em]">Ambassador promo codes</h2>
          <p className="mt-2 text-sm text-[#76716b]">
            Generate one-time ambassador promo codes that can be redeemed publicly via the promo redeem API.
          </p>
          <AdminPromoPanel />
        </div>
      </div>
    </SiteShell>
  )
}
