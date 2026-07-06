"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;       // ISO datetime
  end: string;
  isAllDay: boolean;
  attendees?: number;
  alignmentSuggestion?: string; // AI suggestion for when to do Alignment
}

interface CalendarData {
  connected: boolean;
  events: CalendarEvent[];
  suggestedAlignmentTime?: string; // ISO datetime
  suggestedReason?: string;
}

function formatEventTime(start: string, isAllDay: boolean): string {
  if (isAllDay) return "All day";
  return new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatEventDate(start: string): string {
  return new Date(start).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function CalendarIntegration() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/alignment/calendar")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); else setData({ connected: false, events: [] }); })
      .catch(() => setData({ connected: false, events: [] }))
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    // Redirect to Google OAuth flow
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const redirectUri = `${window.location.origin}/api/alignment/calendar/callback`;
    const scope = "https://www.googleapis.com/auth/calendar.readonly";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-16 bg-white/[0.03] rounded-xl" />
        <div className="h-12 bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="border border-white/[0.07] bg-[#0c0a0d] p-6 flex flex-col gap-4" style={{ borderRadius: 12 }}>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">
            Calendar integration
          </p>
          <p className="text-[14px] text-[#c8c2bc] leading-relaxed">
            Connect Google Calendar to see upcoming events and get Alignment timing suggestions — before the hard conversation, after the conflict.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            "See which events might need Alignment prep",
            "Get timing suggestions based on your schedule",
            "Read-only access — we never modify your calendar",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[#e0743a]/50 text-[10px] mt-0.5">✓</span>
              <p className="text-[13px] text-[#76716b]">{item}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="h-10 px-5 text-[12px] border border-white/[0.10] text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/[0.18] transition-colors duration-200 disabled:opacity-40 self-start flex items-center gap-2"
          style={{ borderRadius: 8 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 1v3M10 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {connecting ? "Connecting…" : "Connect Google Calendar"}
        </button>
        <p className="text-[11px] text-[#4f4b47]">Read-only · Disconnect anytime</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      {/* Alignment timing suggestion */}
      {data.suggestedAlignmentTime && (
        <div className="border border-[#e0743a]/20 bg-[#e0743a]/[0.04] p-5 flex flex-col gap-2" style={{ borderRadius: 12 }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">
            Suggested Alignment time
          </p>
          <p className="text-[15px] text-[#f4efe9]">
            {formatEventDate(data.suggestedAlignmentTime)} · {formatEventTime(data.suggestedAlignmentTime, false)}
          </p>
          {data.suggestedReason && (
            <p className="text-[13px] text-[#a8a29a] leading-relaxed">{data.suggestedReason}</p>
          )}
        </div>
      )}

      {/* Upcoming events */}
      {data.events.length > 0 && (
        <div className="border border-white/[0.07] bg-[#0c0a0d] overflow-hidden" style={{ borderRadius: 12 }}>
          <div className="px-5 py-3 border-b border-white/[0.05]">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
              Upcoming ({data.events.length})
            </p>
          </div>
          {data.events.map((event, i) => (
            <div
              key={event.id}
              className="px-5 py-4 border-b border-white/[0.04] last:border-0 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] text-[#c8c2bc] leading-snug flex-1">{event.title}</p>
                {event.attendees && event.attendees > 1 && (
                  <span className="font-mono text-[8px] text-[#4f4b47] shrink-0">
                    {event.attendees} people
                  </span>
                )}
              </div>
              <p className="font-mono text-[9px] text-[#4f4b47]">
                {formatEventDate(event.start)} · {formatEventTime(event.start, event.isAllDay)}
              </p>
              {event.alignmentSuggestion && (
                <p className="text-[11px] text-[#e0743a]/60 leading-relaxed mt-0.5">
                  {event.alignmentSuggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.events.length === 0 && (
        <p className="text-[13px] text-[#4f4b47]">No upcoming events in the next 7 days.</p>
      )}
    </motion.div>
  );
}