"use client";

import Link from "next/link";
import { pricingTiers } from "../data/marketing";

const USE_CASES = [
  "Relationship", "Family", "Boundary", "Message",
  "Grief", "Parenting", "Team", "Repair",
];

const REAL_MOMENTS = [
  { label: "The message", body: "You have reread it too many times. You do not know if you are reacting or responding. Before you send it, understand the pattern." },
  { label: "The family role", body: "The conversation pulled you back into something older than the argument. Some family roles survive long after childhood." },
  { label: "The boundary", body: "It is clear in your body. It is impossible in your mouth. A boundary is not a punishment. It is a return to alignment." },
  { label: "The grief", body: "Grief changes how everything lands. The same words hit differently. The same people feel further away." },
  { label: "The relationship pattern", body: "You can feel it before you can explain it. The same dynamic. The same outcome. The pattern is louder than the moment." },
  { label: "The other side", body: "Two people can live through the same conversation and leave with completely different truths. The other side may not be lying. They may be living from another map." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05070B", color: "#F6F5F3", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid rgba(246,245,243,0.08)",
        background: "rgba(5,7,11,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem", display: "flex", height: "56px", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.80)", textDecoration: "none" }}>
            SOVEREIGN.OS
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <Link href="/product" style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.35)", textDecoration: "none" }}>Product</Link>
            <Link href="/pricing" style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.35)", textDecoration: "none" }}>Pricing</Link>
            <Link href="/covenant" style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.35)", textDecoration: "none" }}>Covenant</Link>
            <Link href="https://app.defrag.app/app/login" style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#05070B", background: "#F6F5F3", border: "1px solid #F6F5F3", padding: "0.625rem 1.25rem", textDecoration: "none", display: "inline-block" }}>
              Enter Sovereign.os
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
        paddingTop: "80px", paddingBottom: "80px",
        backgroundImage: "linear-gradient(rgba(246,245,243,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(246,245,243,0.025) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ maxWidth: "56rem" }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "2rem", display: "block" }}>
              The Platform
            </p>
            <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1.04, marginBottom: "1.5rem", margin: "0 0 1.5rem 0" }}>
              Healing isn't optional.
              <br />
              <span style={{ color: "rgba(246,245,243,0.38)" }}>Holding the pain is.</span>
            </h1>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", maxWidth: "40rem", marginBottom: "1rem", margin: "0 0 1rem 0" }}>
              Sovereign.os is a private place to work through the patterns that keep showing up in your life.
            </p>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "rgba(246,245,243,0.35)", maxWidth: "36rem", marginBottom: "3rem", margin: "0 0 3rem 0" }}>
              For the moments you keep replaying, the patterns you keep meeting, and the responses you are ready to change.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "3rem" }}>
              <Link href="https://app.defrag.app/app/login" style={{
                fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#05070B", background: "#F6F5F3", border: "1px solid #F6F5F3",
                padding: "0.875rem 2rem", textDecoration: "none", display: "inline-block",
              }}>
                Start Baseline Design
              </Link>
              <Link href="https://app.defrag.app/apps/defrag" style={{
                fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.75)", background: "transparent", border: "1px solid rgba(246,245,243,0.18)",
                padding: "0.875rem 2rem", textDecoration: "none", display: "inline-block",
              }}>
                Enter Defrag space
              </Link>
              <Link href="/product" style={{
                fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.30)", background: "transparent", border: "none",
                padding: "0.875rem 0", textDecoration: "none", display: "inline-block",
              }}>
                See how it works →
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {USE_CASES.map((uc) => (
                <span key={uc} style={{
                  fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "rgba(246,245,243,0.30)", border: "1px solid rgba(246,245,243,0.10)",
                  padding: "0.2rem 0.6rem", display: "inline-block",
                }}>{uc}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Real moments ───────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1rem" }}>The real moments</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "3rem", maxWidth: "40rem" }}>
            The moment happened once.<br />The pattern keeps happening until you can see it.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0 }}>
            {REAL_MOMENTS.map((m, i) => (
              <div key={m.label} style={{
                border: "1px solid rgba(246,245,243,0.08)",
                borderLeft: i % 2 === 1 ? "none" : "1px solid rgba(246,245,243,0.08)",
                borderTop: i >= 2 ? "none" : "1px solid rgba(246,245,243,0.08)",
                padding: "2rem",
              }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 300, color: "rgba(246,245,243,0.75)", marginBottom: "0.75rem", margin: "0 0 0.75rem 0" }}>{m.label}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(246,245,243,0.38)", margin: 0 }}>{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Baseline Design ────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1rem" }}>The Source</p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                Your Baseline Design<br />is the source.
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "1rem" }}>
                It gives the system a starting point for how you tend to process pressure, conflict, connection, timing, repair, and alignment.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.28)", marginBottom: "1rem" }}>
                Not as a label. Not as an excuse. As context.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "2rem" }}>
                So the work does not begin with "what is wrong with me?" It begins with "what pattern is active, and what response would actually change it?"
              </p>
              <Link href="https://app.defrag.app/settings" style={{
                fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.75)", border: "1px solid rgba(246,245,243,0.18)",
                padding: "0.875rem 1.5rem", textDecoration: "none", display: "inline-block",
              }}>
                Set Your Baseline Design
              </Link>
            </div>
            <div style={{ background: "#0D0F14", border: "1px solid rgba(246,245,243,0.08)", padding: "2rem" }}>
              <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", marginBottom: "1.5rem" }}>Active in this moment</p>
              {[
                { label: "Pattern", value: "Repeating loop — boundary negotiation" },
                { label: "Active role", value: "Fixer / carrier / peacekeeper" },
                { label: "What repeats", value: "Pressure → protect → distance → repair" },
                { label: "Next response", value: "Name the pattern before the conversation" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(246,245,243,0.06)" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.18)", width: "6rem", flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: "0.875rem", color: "rgba(246,245,243,0.38)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Defrag ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
            <div>
              <span style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.55)", border: "1px solid rgba(246,245,243,0.22)", padding: "0.2rem 0.6rem", display: "inline-block", marginBottom: "1.5rem" }}>Defrag space</span>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                The moment that will not<br />leave you alone.
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "1rem" }}>
                A conversation. A message. A family pattern. A boundary. A loss. A role you keep carrying. A reaction that felt bigger than the situation.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "2rem" }}>
                Defrag helps you slow the moment down, separate what happened from what repeated, and find the next response that does not keep feeding the same pattern.
              </p>
              <Link href="https://app.defrag.app/apps/defrag" style={{
                fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.75)", border: "1px solid rgba(246,245,243,0.18)",
                padding: "0.875rem 1.5rem", textDecoration: "none", display: "inline-block",
              }}>
                Enter Defrag space
              </Link>
            </div>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", marginBottom: "1rem" }}>Use Defrag when</p>
              {[
                "You are about to send the message.",
                "You cannot tell if you are reacting or responding.",
                "A family conversation pulled you back into an old role.",
                "A boundary feels clear in your body but impossible in your mouth.",
                "You keep replaying what someone said.",
                "You want to understand the other side without abandoning your own.",
                "You are grieving and everything sounds different.",
                "You know the pattern, but not the next move.",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.75rem", padding: "0.625rem 0", borderBottom: "1px solid rgba(246,245,243,0.06)" }}>
                  <div style={{ width: "0.75rem", height: "1px", background: "rgba(246,245,243,0.18)", flexShrink: 0, marginTop: "0.6rem" }} />
                  <span style={{ fontSize: "0.875rem", color: "rgba(246,245,243,0.38)", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What you learned to carry ──────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ maxWidth: "48rem" }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1rem" }}>What you learned to carry</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
              What you learned to carry<br />does not have to lead.
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "1rem" }}>
              Some reactions are not only about the present. They come from the part of you that learned to stay ready. The part that learned to please, prove, defend, disappear, fix, perform, or carry the room.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)" }}>
              Defrag does not turn that into a label. It helps you see when an old survival role is running a new moment — so you can choose a response that belongs to who you are becoming.
            </p>
          </div>
        </div>
      </section>

      {/* ── Covenant ───────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
            <div>
              <span style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.35)", border: "1px solid rgba(246,245,243,0.12)", padding: "0.2rem 0.6rem", display: "inline-block", marginBottom: "1.5rem" }}>Covenant space</span>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                Faith connected<br />to the work.
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "1rem" }}>
                Covenant is for the user who wants faith to stay connected to the work. Not as certainty. Not as performance. Not as a spiritual shortcut.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "2rem" }}>
                Covenant helps bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
              </p>
              <Link href="/covenant" style={{
                fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.75)", border: "1px solid rgba(246,245,243,0.18)",
                padding: "0.875rem 1.5rem", textDecoration: "none", display: "inline-block",
              }}>
                Learn about Covenant
              </Link>
            </div>
            <div style={{ border: "1px solid rgba(246,245,243,0.08)", padding: "2rem" }}>
              <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", marginBottom: "1rem" }}>Covenant is not</p>
              {["Certainty", "Performance", "A spiritual shortcut", "A sermon", "A verdict"].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(246,245,243,0.06)" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.625rem", color: "rgba(246,245,243,0.20)" }}>✕</span>
                  <span style={{ fontSize: "0.875rem", color: "rgba(246,245,243,0.38)" }}>{item}</span>
                </div>
              ))}
              <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", margin: "1.5rem 0 1rem 0" }}>Covenant is</p>
              {["Faith connected to repair", "Grounded discernment", "Honest next steps", "Reflection without performance"].map((item) => (
                <div key={item} style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(246,245,243,0.06)" }}>
                  <div style={{ width: "0.75rem", height: "1px", background: "rgba(246,245,243,0.18)", flexShrink: 0, marginTop: "0.6rem" }} />
                  <span style={{ fontSize: "0.875rem", color: "rgba(246,245,243,0.38)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── When both sides matter ─────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ maxWidth: "48rem" }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1rem" }}>When both sides matter</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
              The other side may not be lying.<br />They may be living from another map.
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "1rem" }}>
              Two people can live through the same conversation and leave with completely different truths. With permission, Sovereign.os can help compare two Baseline Designs — not to decide who is right, not to score compatibility, and not to diagnose the relationship.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.28)" }}>
              When both sides matter, invite privately.
            </p>
          </div>
        </div>
      </section>

      {/* ── Library ────────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1rem" }}>The Library</p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                Your Library keeps what<br />the moment taught you.
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", marginBottom: "1rem" }}>
                The response you found. The pattern you finally saw. The boundary that became clear. The reflection you do not want to lose.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.28)" }}>
                Save to Sovereign before the moment disappears.
              </p>
            </div>
            <div style={{ background: "#0D0F14", border: "1px solid rgba(246,245,243,0.08)", padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)" }}>Sovereign.os Library</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.18)" }}>Private</span>
              </div>
              {[
                { space: "Defrag", label: "Boundary — what I keep negotiating with myself", date: "Jun 6" },
                { space: "Defrag", label: "Family role — the fixer pattern", date: "Jun 4" },
                { space: "Covenant", label: "Covenant Brief — discernment before the decision", date: "Jun 2" },
                { space: "Defrag", label: "Message — before I sent it", date: "May 30" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid rgba(246,245,243,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: item.space === "Covenant" ? "rgba(246,245,243,0.35)" : "rgba(246,245,243,0.55)", border: `1px solid ${item.space === "Covenant" ? "rgba(246,245,243,0.12)" : "rgba(246,245,243,0.22)"}`, padding: "0.2rem 0.5rem" }}>{item.space}</span>
                    <span style={{ fontSize: "0.75rem", color: "rgba(246,245,243,0.38)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: "0.625rem", color: "rgba(246,245,243,0.18)", flexShrink: 0, marginLeft: "1rem" }}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(246,245,243,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1rem" }}>Pro</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "3rem", maxWidth: "40rem" }}>
            Free is for beginning the work.<br />Pro is for the patterns that need more than one pass.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: "48rem", gap: 0 }}>
            {pricingTiers.map((tier, i) => (
              <div key={tier.name} style={{
                border: "1px solid rgba(246,245,243,0.10)",
                borderLeft: i === 1 ? "none" : "1px solid rgba(246,245,243,0.10)",
                padding: "2.5rem",
                display: "flex", flexDirection: "column", gap: "1.5rem",
              }}>
                {tier.highlight && (
                  <div style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#05070B", background: "#F6F5F3", padding: "0.2rem 0.6rem", display: "inline-block", alignSelf: "flex-start" }}>
                    Recommended
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.18)", marginBottom: "1rem" }}>{tier.name}</p>
                  <div style={{ fontSize: "3rem", fontWeight: 300, letterSpacing: "-0.02em" }}>
                    {tier.price}<span style={{ fontSize: "0.875rem", color: "rgba(246,245,243,0.28)", fontWeight: 400, marginLeft: "0.5rem" }}>{tier.period}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", color: "rgba(246,245,243,0.38)" }}>{tier.description}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <div style={{ width: "1rem", height: "1px", background: "rgba(246,245,243,0.15)", flexShrink: 0, marginTop: "0.5rem" }} />
                      <span style={{ fontSize: "0.75rem", color: "rgba(246,245,243,0.40)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} style={{
                  display: "block", textAlign: "center",
                  fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
                  padding: "0.875rem",
                  textDecoration: "none",
                  background: tier.highlight ? "#F6F5F3" : "transparent",
                  color: tier.highlight ? "#05070B" : "rgba(246,245,243,0.65)",
                  border: tier.highlight ? "1px solid #F6F5F3" : "1px solid rgba(246,245,243,0.15)",
                }}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 0", borderTop: "1px solid rgba(246,245,243,0.08)", textAlign: "center" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.25)", marginBottom: "1.5rem" }}>Start here</p>
          <h2 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1.04, marginBottom: "1.5rem" }}>
            Healing isn't optional.
            <br />
            <span style={{ color: "rgba(246,245,243,0.38)" }}>Holding the pain is.</span>
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.50)", maxWidth: "32rem", margin: "0 auto 2.5rem auto" }}>
            Enter Sovereign.os. Set your Baseline Design. Work through what is active. Save what changes.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="https://app.defrag.app/app/login" style={{
              fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
              color: "#05070B", background: "#F6F5F3", border: "1px solid #F6F5F3",
              padding: "0.875rem 2.5rem", textDecoration: "none", display: "inline-block",
            }}>
              Enter Sovereign.os
            </Link>
            <Link href="https://app.defrag.app/app/login" style={{
              fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(246,245,243,0.75)", border: "1px solid rgba(246,245,243,0.18)",
              padding: "0.875rem 2.5rem", textDecoration: "none", display: "inline-block",
            }}>
              Start Baseline Design
            </Link>
          </div>
          <p style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.18)", marginTop: "1.5rem" }}>
            Free tier · No credit card required · 5 sessions/day
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(246,245,243,0.08)", padding: "2.5rem 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", margin: "0 0 0.25rem 0" }}>Sovereign.os</p>
            <p style={{ fontFamily: "monospace", fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.18)", margin: 0 }}>Defrag · Covenant · Baseline Design · Library</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {[
              { href: "/about", label: "About" },
              { href: "/product", label: "Product" },
              { href: "/pricing", label: "Pricing" },
              { href: "/covenant", label: "Covenant" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ fontFamily: "monospace", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", textDecoration: "none" }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}