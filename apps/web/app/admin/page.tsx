import { cookies } from "next/headers"
import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import AdminPromoPanel from "@/components/marketing/AdminPromoPanel"
import { RevenueDashboard } from "@/components/spaces/RevenueDashboard"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Admin — Sovereign.os",
  description: "Owner admin panel — revenue, cohorts, and promo codes.",
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

async function getAdminStats() {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    const headers = new Headers()
    if (cookieHeader) headers.set("cookie", cookieHeader)
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || ""
    const res = await fetch(`${base}/api/admin/stats`, { headers, cache: "no-store" })
    if (!res.ok) return null
    return res.json() as Promise<{ total_users: number; pro_users: number; active_sessions: number; interactions_24h: number }>
  } catch { return null }
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-[18px] font-medium tracking-[-0.01em] text-[#f4efe9]">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-[#76716b] leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export default async function AdminPage() {
  const [admin, stats] = await Promise.all([getAdminUser(), getAdminStats()])

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
      <div className="mx-auto max-w-4xl px-6 py-24 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Admin</span>
          </div>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Sovereign.os Admin</h1>
          <p className="text-sm text-[#a8a29a]">
            Signed in as <span className="text-[#f4efe9]">{admin.email}</span>{" "}
            — role <span className="text-[#e0743a]/80">{admin.role}</span>
          </p>
        </div>

        {/* Live platform stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total users", value: stats.total_users },
              { label: "Pro users", value: stats.pro_users },
              { label: "Active sessions", value: stats.active_sessions },
              { label: "Sessions (24h)", value: stats.interactions_24h },
            ].map(({ label, value }) => (
              <div key={label} className="border border-white/[0.08] bg-white/[0.02] p-4 rounded-[var(--radius-container)]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-1">{label}</p>
                <p className="text-2xl text-[#f4efe9] font-light">{value?.toLocaleString() ?? "—"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Stripe Revenue Dashboard */}
        <SectionCard
          title="Revenue"
          description="Stripe MRR, ARR, active subscriptions, trial conversions, and churn."
        >
          <RevenueDashboard />
        </SectionCard>

        {/* Cohort Segmentation */}
        <SectionCard
          title="User cohorts"
          description="Segment users by signup date, tier, and usage. Use the API directly."
        >
          <div className="flex flex-col gap-3">
            <div className="border border-white/[0.06] bg-[#08070a] p-4 font-mono text-[12px] text-[#76716b]" style={{ borderRadius: 8 }}>
              <p className="text-[#4f4b47] mb-2"># Example queries</p>
              <p>GET /api/admin/cohorts?tier=pro&amp;from=2026-01-01</p>
              <p>GET /api/admin/cohorts?tier=free&amp;min_sessions=10</p>
              <p>GET /api/admin/cohorts?from=2026-06-01&amp;to=2026-07-01</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "All users", query: "" },
                { label: "Pro users", query: "?tier=pro" },
                { label: "Active free", query: "?tier=free&min_sessions=5" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={`/api/admin/cohorts${item.query}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/[0.07] bg-[#0c0a0d] px-4 py-3 text-center text-[12px] text-[#76716b] hover:text-[#a8a29a] hover:border-white/[0.12] transition-colors"
                  style={{ borderRadius: 8 }}
                >
                  {item.label} ↗
                </a>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Ambassador promo codes */}
        <SectionCard
          title="Ambassador promo codes"
          description="Generate one-time ambassador promo codes that can be redeemed publicly via the promo redeem API."
        >
          <AdminPromoPanel />
        </SectionCard>

        {/* Quick links */}
        <SectionCard title="Quick links">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Cohorts API", href: "/api/admin/cohorts" },
              { label: "Revenue API", href: "/api/admin/revenue" },
              { label: "Changelog", href: "/changelog" },
              { label: "Launch page", href: "/launch" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/[0.06] bg-[#08070a] px-4 py-3 text-center text-[12px] text-[#4f4b47] hover:text-[#76716b] hover:border-white/[0.10] transition-colors"
                style={{ borderRadius: 8 }}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </SectionCard>

      </div>
    </SiteShell>
  )
}