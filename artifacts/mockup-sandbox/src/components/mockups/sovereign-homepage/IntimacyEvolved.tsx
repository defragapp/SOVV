import React from 'react';

export default function IntimacyEvolved() {
  return (
    <div style={{ background: '#08070a', minHeight: '100vh', color: '#f4efe9', fontFamily: "'Geist', Inter, sans-serif", position: 'relative' }}>
      <style>{`
        @keyframes ambFloat {
          0%,100% { transform: translate(0,0) scale(1) }
          50% { transform: translate(-22px,18px) scale(1.06) }
        }
        @keyframes ambPulse {
          0%,100% { opacity: 0.07 }
          50% { opacity: 0.13 }
        }
        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.032;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
        }
        .amber-rule {
          display: block;
          width: 24px;
          height: 1px;
          background: rgba(224,116,58,0.5);
          margin-bottom: 18px;
        }
        .tag {
          font-family: 'Geist Mono', 'JetBrains Mono', monospace;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #4f4b47;
          padding: 2px 8px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 100px;
          border: 1px solid rgba(224,116,58,0.38);
          background: rgba(224,116,58,0.09);
          color: #f4efe9;
          font-family: 'Geist Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(224,116,58,0.06), 0 0 0 10px rgba(224,116,58,0.025);
          transition: background 0.35s ease, box-shadow 0.35s ease;
        }
        .cta-btn:hover {
          background: rgba(224,116,58,0.15);
          box-shadow: 0 0 0 4px rgba(224,116,58,0.10), 0 0 0 10px rgba(224,116,58,0.045);
        }
        .space-card {
          transition: border-color 0.5s ease, transform 0.5s ease;
        }
        .space-card:hover {
          transform: translateY(-2px);
        }
        .insight-row {
          position: relative;
          padding-left: 16px;
        }
        .insight-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background: rgba(224,116,58,0.35);
          border-radius: 2px;
        }
      `}</style>

      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#08070a' }}>

        {/* Image — warmer grade */}
        <img
          src="/__mockup/images/hero-hand.webp"
          alt=""
          style={{
            position: 'absolute', right: 0, top: 0,
            height: '100%', width: '62%',
            objectFit: 'cover',
            filter: 'sepia(0.18) brightness(0.82)'
          }}
        />
        {/* Amber-warm gradient over image */}
        <div style={{
          position: 'absolute', right: 0, top: 0,
          height: '100%', width: '62%',
          background: 'linear-gradient(to right, #08070a 0%, rgba(10,7,5,0.62) 38%, rgba(14,9,6,0.18) 70%, transparent 100%)'
        }} />
        {/* Ambient orb */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-60px',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,116,58,0.10) 0%, transparent 68%)',
          animation: 'ambFloat 28s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        {/* Content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '600px', paddingLeft: 'clamp(2rem, 6vw, 7rem)', paddingTop: '9rem', paddingBottom: '9rem' }}>
            <span className="amber-rule" />
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.34em', color: 'rgba(79,75,71,0.85)', marginBottom: '2rem' }}>
              Sovereign.os
            </div>

            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(3rem, 7.2vw, 5.8rem)',
              fontWeight: 300,
              lineHeight: 1.04,
              letterSpacing: '-0.028em',
              color: '#f4efe9',
              margin: 0
            }}>
              Your private<br />
              operating system<br />
              for{' '}
              <span style={{ fontStyle: 'italic', textShadow: '0 0 40px rgba(224,116,58,0.55)' }}>becoming<br />
              clear</span> to yourself.
            </h1>

            <p style={{ marginTop: '1.75rem', fontSize: '16px', color: '#76716b', lineHeight: 1.8, maxWidth: '340px' }}>
              Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
            </p>

            <p style={{ marginTop: '1rem', fontSize: '12px', color: '#4f4b47', lineHeight: 1.7, maxWidth: '300px', paddingLeft: '2px' }}>
              Most AI responds to what you type.<br />Sovereign.os understands the pattern you're typing from.
            </p>

            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button className="cta-btn">Enter Sovereign.os</button>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#4f4b47' }}>
                Free to start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Baseline ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', borderTop: '1px solid rgba(224,116,58,0.10)', background: '#08070a', padding: 'clamp(5rem, 10vw, 11rem) 1.5rem', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,116,58,0.055) 0%, transparent 70%)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#4f4b47', marginBottom: '1.25rem' }}>
            The Foundation
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#f4efe9',
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            margin: 0
          }}>
            Your Baseline Design.<br />Active beneath every thread.
          </h2>
          <p style={{ marginTop: '1.25rem', fontSize: '15px', color: '#76716b', lineHeight: 1.75, maxWidth: '340px', margin: '1.25rem auto 0' }}>
            The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.
          </p>
        </div>

        {/* Private document card */}
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '520px', margin: '0 auto',
          background: '#0d0b0e',
          borderRadius: '18px',
          border: '1px solid rgba(224,116,58,0.14)',
          overflow: 'hidden',
          boxShadow: '0 50px 120px -24px rgba(0,0,0,0.85), 0 0 0 1px rgba(224,116,58,0.10), 0 0 100px rgba(224,116,58,0.055)'
        }}>
          {/* Card header */}
          <div style={{ borderBottom: '1px solid rgba(224,116,58,0.12)', padding: '14px 24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#f4efe9', borderBottom: '1px solid rgba(224,116,58,0.7)', paddingBottom: '3px' }}>Design</div>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#4f4b47', paddingBottom: '3px' }}>Context</div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

              {[
                { text: "You process conflict through withdrawal before re-engagement.", tags: ["Defense", "Delay"] },
                { text: "Boundaries collapse under sustained pressure from authority figures.", tags: ["Pattern", "Role"] },
                { text: "You repair through over-explanation rather than silence.", tags: ["Repair"] },
              ].map((row, i) => (
                <div key={i} className="insight-row" style={{ padding: '14px 0 14px 16px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.025)' : 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#a8a29a', lineHeight: 1.65, flex: 1 }}>
                    {row.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', minWidth: '80px' }}>
                    {row.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Best Next Response */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(224,116,58,0.18)', paddingTop: '18px' }}>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#e0743a', marginBottom: '8px' }}>
                Best Next Response
              </div>
              <div style={{ fontSize: '14px', color: '#f4efe9', fontWeight: 500, marginBottom: '6px' }}>Pause before repair</div>
              <div style={{ fontSize: '13px', color: '#76716b', lineHeight: 1.7 }}>
                Hold the impulse to fix immediately. Name what you noticed before you respond.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pull Quote ────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(224,116,58,0.08)', background: '#06050a', padding: 'clamp(5rem, 11vw, 14rem) clamp(1.5rem, 8vw, 10rem)', textAlign: 'center' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(79,75,71,0.5)', marginBottom: '2.5rem' }}>
            On pattern
          </div>
          <blockquote style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(1.7rem, 4.5vw, 3.2rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#f4efe9',
            lineHeight: 1.16,
            letterSpacing: '-0.018em',
            margin: 0
          }}>
            The pattern you are repeating is{' '}
            <span style={{ color: 'rgba(244,239,233,0.45)' }}>not</span> new.{' '}
            <br />
            The clarity can be.
          </blockquote>
        </div>
      </section>

      {/* ─── Spaces ────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(224,116,58,0.10)', background: '#0c0a0d', padding: 'clamp(5rem, 10vw, 11rem) 1.5rem' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#4f4b47', marginBottom: '1.25rem' }}>
            The Spaces
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 300,
            color: '#f4efe9',
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            margin: 0
          }}>
            Where patterns resolve.
          </h2>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Defrag — amber left-border accent */}
          <div className="space-card" style={{
            padding: '32px 32px 32px 28px',
            border: '1px solid rgba(224,116,58,0.12)',
            borderLeft: '3px solid rgba(224,116,58,0.55)',
            borderRadius: '16px',
            background: '#0c0a0d'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: '11px', color: 'rgba(224,116,58,0.45)', letterSpacing: '0.06em' }}>01</span>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#f4efe9', fontWeight: 400, margin: 0 }}>Defrag</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#76716b', lineHeight: 1.72, maxWidth: '560px', margin: 0 }}>
                  Untangle the moment. For conversations, conflicts, and inner pressure that feel messy. Defrag shows what's happening, what pattern is forming, and what changes it.
                </p>
              </div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(224,116,58,0.5)', whiteSpace: 'nowrap', paddingTop: '4px' }}>
                Free
              </div>
            </div>
          </div>

          {/* 2-col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {[
              {
                n: '02', name: 'Alignment', tier: 'Pro',
                desc: 'Choose the cleaner move. For decisions, responses, and next steps. Alignment helps you see what is yours, what is not, and how to move without losing yourself.'
              },
              {
                n: '03', name: 'Covenant', tier: 'Pro',
                desc: 'Understand what the moment belongs to. For reflection and deeper integration. Covenant helps you step back and see the larger pattern.'
              }
            ].map(s => (
              <div key={s.n} className="space-card" style={{
                padding: '28px',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                background: '#0c0a0d',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '2rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em' }}>{s.n}</span>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '19px', color: '#f4efe9', fontWeight: 400, margin: 0 }}>{s.name}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#76716b', lineHeight: 1.72, margin: 0 }}>{s.desc}</p>
                </div>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4f4b47' }}>
                  {s.tier}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        borderTop: '1px solid rgba(224,116,58,0.10)',
        background: '#08070a',
        padding: 'clamp(6rem, 13vw, 14rem) 1.5rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 65% 65% at 50% 50%, rgba(224,116,58,0.10) 0%, transparent 68%)',
          animation: 'ambPulse 8s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#4f4b47', marginBottom: '2.5rem' }}>
            Begin
          </div>

          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2.2rem, 6vw, 4.6rem)',
            fontWeight: 300,
            lineHeight: 1.06,
            letterSpacing: '-0.022em',
            maxWidth: '760px',
            margin: '0 auto'
          }}>
            The pattern is not new.<br />
            <span style={{ fontStyle: 'italic', textShadow: '0 0 40px rgba(224,116,58,0.5)' }}>The clarity can be.</span>
          </h2>

          <p style={{ marginTop: '1.5rem', fontSize: '15px', color: '#76716b', maxWidth: '380px', margin: '1.5rem auto 0', lineHeight: 1.75 }}>
            Sovereign.os helps you integrate what you learn into how you live.
          </p>

          <div style={{ marginTop: '2.5rem' }}>
            <button className="cta-btn">Enter Sovereign.os</button>
            <div style={{ marginTop: '1.5rem', fontFamily: 'Geist Mono, monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#4f4b47' }}>
              Private by design · Free to start
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(224,116,58,0.08)', background: '#08070a', padding: '3.5rem clamp(1.5rem, 5vw, 3rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', color: '#4f4b47', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Sovereign.os
              </div>
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '15px',
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'rgba(79,75,71,0.7)',
                letterSpacing: '-0.01em'
              }}>
                Pattern clarity before response.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              {['Product', 'How it works', 'Pricing', 'Sign in'].map(l => (
                <a key={l} href="#" style={{ fontFamily: 'Geist Mono, monospace', fontSize: '9px', color: '#4f4b47', textTransform: 'uppercase', letterSpacing: '0.14em', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1.5rem', fontFamily: 'Geist Mono, monospace', fontSize: '9px', color: 'rgba(79,75,71,0.4)' }}>
            © 2025 Sovereign. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
