"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalInvited: number;
  totalConverted: number;
  totalPro: number;
  recentReferrals: Array<{
    email: string; // masked: j***@gmail.com
    joinedAt: string;
    tier: "free" | "pro";
  }>;
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="border border-white/[0.07] bg-[#0c0a0d] p-5 flex flex-col gap-2" style={{ borderRadius: 12 }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">{label}</p>
      <p className="font-serif text-3xl text-[#f4efe9]">{value}</p>
      {sub && <p className="text-[11px] text-[#76716b]">{sub}</p>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="h-8 px-4 text-[11px] font-mono uppercase tracking-[0.14em] border border-white/[0.08] text-[#76716b] hover:text-[#f4efe9] hover:border-white/[0.16] transition-colors duration-200 shrink-0"
      style={{ borderRadius: 6 }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// Mask email for privacy: john@example.com → j***@example.com
function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local[0]}***@${domain}`;
}

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/referral/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setStats(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/[0.03] rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    // Graceful fallback with placeholder UI
    const fallbackLink = typeof window !== "undefined"
      ? `${window.location.origin}/invite/your-code`
      : "https://defrag.app/invite/your-code";

    return (
      <div className="flex flex-col gap-6">
        <div className="border border-white/[0.06] bg-[#0c0a0d] p-5 flex flex-col gap-3" style={{ borderRadius: 12 }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Your referral link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[12px] text-[#a8a29a] font-mono bg-[#08070a] px-3 py-2 border border-white/[0.06] truncate" style={{ borderRadius: 6 }}>
              {fallbackLink}
            </code>
            <CopyButton text={fallbackLink} />
          </div>
          <p className="text-[11px] text-[#4f4b47]">Share this link to invite people to Sovereign.os.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Invited" value="—" />
          <StatCard label="Joined" value="—" />
          <StatCard label="Pro" value="—" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6"
    >
      {/* Referral link */}
      <div className="border border-white/[0.06] bg-[#0c0a0d] p-5 flex flex-col gap-3" style={{ borderRadius: 12 }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Your referral link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[12px] text-[#a8a29a] font-mono bg-[#08070a] px-3 py-2 border border-white/[0.06] truncate" style={{ borderRadius: 6 }}>
            {stats.referralLink}
          </code>
          <CopyButton text={stats.referralLink} />
        </div>
        <p className="text-[11px] text-[#4f4b47]">
          Code: <span className="text-[#76716b] font-mono">{stats.referralCode}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Invited" value={stats.totalInvited} sub="people reached" />
        <StatCard label="Joined" value={stats.totalConverted} sub="signed up" />
        <StatCard label="Pro" value={stats.totalPro} sub="upgraded" />
      </div>

      {/* Recent referrals */}
      {stats.recentReferrals.length > 0 && (
        <div className="border border-white/[0.06] bg-[#0c0a0d] overflow-hidden" style={{ borderRadius: 12 }}>
          <div className="px-5 py-3 border-b border-white/[0.05]">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Recent referrals</p>
          </div>
          {stats.recentReferrals.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] last:border-0"
            >
              <span className="text-[13px] text-[#a8a29a] font-mono">{maskEmail(r.email)}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#4f4b47]">
                  {new Date(r.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span
                  className={`font-mono text-[8px] uppercase tracking-[0.14em] border px-2 py-0.5 ${
                    r.tier === "pro"
                      ? "text-[#e0743a]/70 border-[#e0743a]/25"
                      : "text-[#4f4b47] border-white/[0.06]"
                  }`}
                  style={{ borderRadius: 3 }}
                >
                  {r.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}