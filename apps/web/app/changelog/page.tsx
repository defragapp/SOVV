import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in Sovereign.os — platform updates, new features, and improvements.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

type ChangeType = "new" | "improved" | "fixed" | "infra"

interface ChangeEntry {
  date: string
  version?: string
  title: string
  body: string
  type: ChangeType
  space?: string
}

const TYPE_LABELS: Record<ChangeType, { label: string; color: string }> = {
  new:      { label: "New",      color: "text-[#e0743a]/80 border-[#e0743a]/25 bg-[#e0743a]/[0.06]" },
  improved: { label: "Improved", color: "text-[#a8a29a]/80 border-white/10 bg-white/[0.03]" },
  fixed:    { label: "Fixed",    color: "text-[#76716b] border-white/[0.06] bg-white/[0.02]" },
  infra:    { label: "Infra",    color: "text-[#4f4b47] border-white/[0.04] bg-transparent" },
}

const CHANGELOG: ChangeEntry[] = [
  {
    date: "2026-07-06",
    version: "0.9.0",
    title: "Pricing FAQ, founder story, and changelog",
    body: "Added a comprehensive FAQ section to the pricing page. Expanded the About page with founder story, mission statement, and values. Launched this changelog page. Added testimonial infrastructure (schema-ready, populates when real testimonials arrive).",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "Cookie consent banner (GDPR)",
    body: "Added a GDPR-compliant cookie consent banner with accept/decline controls. Preference is stored in localStorage and respected across sessions.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "Mobile nav animation polish",
    body: "Improved hamburger menu animation with smooth spring transitions, backdrop blur, and staggered link reveals on open.",
    type: "improved",
  },
  {
    date: "2026-07-06",
    title: "Loading skeleton states",
    body: "Added skeleton loading states to Library and workspace pages — replacing blank screens with animated placeholders that match the final layout.",
    type: "improved",
  },
  {
    date: "2026-07-06",
    title: "Referral dashboard",
    body: "Inviters can now see how many people they've brought in, their referral link, and conversion status from their account settings.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "UTM parameter tracking",
    body: "UTM parameters (source, medium, campaign, term, content) are now captured at signup and stored for attribution analysis.",
    type: "infra",
  },
  {
    date: "2026-07-06",
    title: "Admin cohort segmentation API",
    body: "New /api/admin/cohorts endpoint segments users by signup date, tier, and usage patterns. Supports date-range filtering.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "Stripe revenue dashboard",
    body: "Admin panel now includes a revenue dashboard showing MRR, ARR, active subscriptions, trial conversions, and churn.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "A/B test infrastructure",
    body: "Pricing page now supports A/B variant assignment via cookie-based bucketing. Variants are tracked through to conversion.",
    type: "infra",
  },
  {
    date: "2026-07-06",
    title: "Affiliate/partner link system",
    body: "Partners can generate tracked referral links. Conversions are attributed and tracked in the admin panel.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "Multi-person Defrag (3+ people)",
    body: "Defrag now supports comparing patterns across 3 or more people simultaneously — not just 2-person dynamics.",
    type: "new",
    space: "Defrag",
  },
  {
    date: "2026-07-06",
    title: "Baseline Design update flow",
    body: "Users can now re-run their Baseline Design after major life changes. The update flow preserves history and shows what changed.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "Pattern library",
    body: "Curated named patterns with descriptions are now available — browse common relational, emotional, and behavioral patterns with explanations.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "AI model fallback chain",
    body: "The AI layer now falls back gracefully through a model chain on failure — ensuring sessions complete even when the primary model is unavailable.",
    type: "infra",
  },
  {
    date: "2026-07-06",
    title: "Voice input (Web Speech API)",
    body: "Defrag workspace now supports voice input — tap the mic icon to speak your moment instead of typing it.",
    type: "new",
    space: "Defrag",
  },
  {
    date: "2026-07-06",
    title: "Cross-session insights API",
    body: "New /api/insights endpoint aggregates patterns across sessions — showing what's recurring, what's shifting, and what's resolved.",
    type: "new",
  },
  {
    date: "2026-07-06",
    title: "Defrag a message",
    body: "Paste any text message or conversation snippet directly into Defrag for a pattern read — no context-setting required.",
    type: "new",
    space: "Defrag",
  },
  {
    date: "2026-07-06",
    title: "Covenant scripture search by theme",
    body: "Covenant now supports searching scripture by theme (e.g. 'forgiveness', 'boundaries', 'grief') — not just free text.",
    type: "new",
    space: "Covenant",
  },
  {
    date: "2026-07-06",
    title: "PWA install prompt",
    body: "Mobile users are now prompted to install Sovereign.os as a PWA — with a native-feeling install flow and home screen icon.",
    type: "new",
  },
]

export default function ChangelogPage() {
  // Group by date
  const grouped = CHANGELOG.reduce<Record<string, ChangeEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-20 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>Changelog</MetaLabel>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-4">
            What&apos;s new.
          </h1>
          <p className="text-[#76716b] text-base leading-relaxed max-w-md">
            Platform updates, new features, and improvements — in reverse chronological order.
          </p>
        </Container>
      </section>

      {/* Entries */}
      <section className="w-full py-16 md:py-24 bg-[#08070a]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-16">
            {dates.map((date) => {
              const entries = grouped[date]
              const d = new Date(date)
              const formatted = d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })
              // Find version if any
              const version = entries.find((e) => e.version)?.version

              return (
                <div key={date} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-12">
                  {/* Date column */}
                  <div className="flex flex-col gap-1 md:pt-1">
                    <p className="font-mono text-[11px] text-[#f4efe9]/70">{formatted}</p>
                    {version && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#e0743a]/60">
                        v{version}
                      </span>
                    )}
                  </div>

                  {/* Entries column */}
                  <div className="flex flex-col gap-6">
                    {entries.map((entry, i) => {
                      const typeStyle = TYPE_LABELS[entry.type]
                      return (
                        <div
                          key={i}
                          className="border border-white/[0.06] bg-[#0c0a0d] p-6 flex flex-col gap-3"
                          style={{ borderRadius: 12 }}
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`font-mono text-[8px] uppercase tracking-[0.16em] border px-2 py-0.5 ${typeStyle.color}`}
                              style={{ borderRadius: 4 }}
                            >
                              {typeStyle.label}
                            </span>
                            {entry.space && (
                              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47]">
                                {entry.space}
                              </span>
                            )}
                          </div>
                          <h3 className="text-[15px] text-[#f4efe9] font-medium leading-snug">
                            {entry.title}
                          </h3>
                          <p className="text-[13px] text-[#76716b] leading-relaxed">
                            {entry.body}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}