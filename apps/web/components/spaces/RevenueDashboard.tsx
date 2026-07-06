"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RevenueMetrics {
  mrr: number;           // Monthly Recurring Revenue in cents
  arr: number;           // Annual Recurring Revenue in cents
  activeSubscriptions: number;
  activeTrials: number;
  trialConversionRate: number; // 0–1
  monthlyChurnRate: number;    // 0–1
  newThisMonth: number;
  cancelledThisMonth: number;
  revenueByMonth: Array<{ month: string; mrr: number }>;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function pct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-5 flex flex-col gap-2 ${
        highlight
          ? "border-[#e0743a]/25 bg-[#e0743a]/[0.04]"
          : "border-white/[0.07] bg-[#0c0a0d]"
      }`}
      style={{ borderRadius: 12 }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">{label}</p>
      <p className={`font-serif text-3xl ${highlight ? "text-[#e0743a]" : "text-[#f4efe9]"}`}>{value}</p>
      {sub && <p className="text-[11px] text-[#76716b]">{sub}</p>}
    </div>
  );
}

// Minimal bar chart for MRR trend
function MRRChart({ data }: { data: Array<{ month: string; mrr: number }> }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.mrr), 1);

  return (
    <div className="border border-white/[0.06] bg-[#0c0a0d] p-5" style={{ borderRadius: 12 }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">MRR trend</p>
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const height = Math.max((d.mrr / max) * 100, 4);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-[#e0743a]/40 rounded-sm"
                title={`${d.month}: ${fmt(d.mrr)}`}
              />
              <span className="font-mono text-[7px] text-[#4f4b47] truncate w-full text-center">
                {d.month.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RevenueDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setMetrics(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/[0.03] rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="border border-white/[0.06] bg-[#0c0a0d] p-6 text-center" style={{ borderRadius: 12 }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Revenue</p>
        <p className="text-[13px] text-[#76716b]">Connect Stripe to see revenue metrics.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      {/* Primary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="MRR" value={fmt(metrics.mrr)} highlight />
        <MetricCard label="ARR" value={fmt(metrics.arr)} />
        <MetricCard label="Active subs" value={String(metrics.activeSubscriptions)} />
        <MetricCard label="Active trials" value={String(metrics.activeTrials)} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Trial → Pro"
          value={pct(metrics.trialConversionRate)}
          sub="conversion rate"
        />
        <MetricCard
          label="Monthly churn"
          value={pct(metrics.monthlyChurnRate)}
          sub="cancellation rate"
        />
        <MetricCard
          label="New this month"
          value={String(metrics.newThisMonth)}
          sub="new subscribers"
        />
        <MetricCard
          label="Cancelled"
          value={String(metrics.cancelledThisMonth)}
          sub="this month"
        />
      </div>

      {/* MRR chart */}
      {metrics.revenueByMonth?.length > 0 && (
        <MRRChart data={metrics.revenueByMonth} />
      )}
    </motion.div>
  );
}