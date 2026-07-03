import React from 'react';

export default function Sharpened() {
  return (
    <div style={{ backgroundColor: '#08070a', color: '#f4efe9', fontFamily: "'Geist', 'Inter', sans-serif" }} className="min-h-screen selection:bg-[#e0743a]/30">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center">
        {/* Background & Image */}
        <div 
          className="absolute right-0 top-0 h-full w-[58%] object-cover z-0 pointer-events-none"
          style={{
            backgroundImage: "url('/__mockup/images/hero-hand.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #08070a 0%, rgba(8,7,10,0.35) 45%, transparent 100%)'
            }}
          />
        </div>
        
        {/* Amber Blob */}
        <div 
          className="absolute -top-60 right-0 w-[700px] h-[700px] z-0 pointer-events-none animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(224,116,58,0.07) 0%, transparent 70%)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-[580px] py-44 pl-8 lg:pl-16 xl:pl-24">
          <div className="font-mono text-[9px] tracking-[0.32em] uppercase text-[#4f4b47]/80 mb-10">
            Sovereign.os
          </div>
          <h1 
            className="font-light text-[#f4efe9] leading-[1.04] tracking-[-0.025em]"
            style={{ fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: "clamp(3.2rem, 7.5vw, 6rem)" }}
          >
            Your private operating<br />
            system for <span style={{ textShadow: '0 0 40px rgba(224,116,58,0.4), 0 0 80px rgba(200,100,40,0.15)' }}>becoming</span><br />
            clear to yourself.
          </h1>
          <p className="text-[15px] text-[#76716b] leading-[1.7] mt-7 max-w-sm">
            Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
          </p>
          <div className="mt-5 pl-4 border-l border-[#e0743a]/20 font-mono text-[10px] tracking-[0.1em] text-[#4f4b47] leading-relaxed max-w-xs">
            Most AI responds to what you type. Sovereign.os understands the pattern you're typing from.
          </div>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <button className="px-6 py-3 rounded-2xl bg-[#f4efe9] text-[#08070a] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold hover:opacity-92 transition-opacity">
              Enter Sovereign.os
            </button>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              Free to start
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="relative bg-[#09080c] py-32 lg:py-44 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(224,116,58,0.04) 0%, transparent 70%)'
          }}
        />
        
        <div className="relative z-10 max-w-xl mx-auto text-center mb-16 px-6">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">
            How it works
          </div>
          <h2 
            className="font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.08] whitespace-pre-line"
            style={{ fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            {"Your Baseline Design.\nActive beneath every thread."}
          </h2>
          <p className="mt-5 text-[15px] text-[#76716b] leading-relaxed max-w-sm mx-auto">
            Pattern recognition that reads what's active before you reply, react, or withdraw.
          </p>
        </div>

        {/* SpacePreview Mockup */}
        <div className="relative z-10 px-6">
          <div 
            className="max-w-lg mx-auto rounded-2xl overflow-hidden bg-[#0c0a0d]"
            style={{
              border: '1px solid rgba(224,116,58,0.1)',
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(224,116,58,0.08), 0 0 60px rgba(224,116,58,0.04)'
            }}
          >
            {/* Titlebar */}
            <div className="h-11 bg-[#08070a]/95 border-b border-white/[0.08] flex items-center px-4 gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#76716b]">
                  Sovereign.os
                </div>
              </div>
              <div className="flex gap-2">
                <div className="font-mono text-[9px] px-2 py-1 rounded bg-white/12 text-[#f4efe9] tracking-[0.1em] uppercase">Design</div>
                <div className="font-mono text-[9px] px-2 py-1 rounded text-[#76716b] tracking-[0.1em] uppercase">Result</div>
              </div>
            </div>

            {/* Baseline Active Row */}
            <div className="px-6 py-3 border-b border-white/[0.06] bg-[#e0743a]/[0.03] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-sm bg-[#e0743a]/60" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/70">Baseline Design Active</span>
                <span className="text-[11px] text-[#76716b] hidden sm:block">Your Baseline Design is active beneath every thread.</span>
              </div>
            </div>

            {/* Facts */}
            <div className="flex flex-col">
              <div className="px-6 py-4 border-b border-white/[0.05] flex items-start gap-4">
                <p className="text-[13px] text-[#d4cec8] leading-snug flex-1">
                  You process conflict through withdrawal before re-engagement.
                </p>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <span className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06] rounded-[4px]">DEFENSE</span>
                  <span className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06] rounded-[4px]">DELAY</span>
                </div>
              </div>
              
              <div className="px-6 py-4 border-b border-white/[0.05] flex items-start gap-4">
                <p className="text-[13px] text-[#d4cec8] leading-snug flex-1">
                  Boundaries collapse under sustained pressure from authority figures.
                </p>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <span className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06] rounded-[4px]">PATTERN</span>
                  <span className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06] rounded-[4px]">ROLE</span>
                </div>
              </div>

              <div className="px-6 py-4 flex items-start gap-4">
                <p className="text-[13px] text-[#d4cec8] leading-snug flex-1">
                  You repair through over-explanation rather than silence.
                </p>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <span className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06] rounded-[4px]">REPAIR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Spaces */}
      <section className="bg-[#0c0a0d] py-32 lg:py-44 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto mb-16 text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">
            The spaces
          </div>
          <h2 
            className="font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.08] whitespace-pre-line"
            style={{ fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            {"Three contexts.\nOne Baseline Design."}
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="group relative flex flex-col p-7 bg-[#0c0a0d] rounded-2xl transition-all duration-400 hover:-translate-y-[3px]"
            style={{ 
              border: '1px solid rgba(224,116,58,0.07)'
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
              style={{
                border: '1px solid rgba(224,116,58,0.16)',
                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(224,116,58,0.06)'
              }}
            />
            
            <div className="absolute top-6 right-6 font-mono text-[9px] text-[#e0743a]/30 tracking-[0.1em]">01</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#4f4b47] mb-4">free</div>
            <h3 className="text-xl text-[#f4efe9] mb-3" style={{ fontFamily: "'Fraunces', 'Playfair Display', serif" }}>Defrag</h3>
            <p className="text-[14px] text-[#76716b] leading-relaxed flex-1">
              Untangle the moment. For conversations, conflicts, and inner pressure that feel messy. Defrag shows what's happening, what pattern is forming, and what changes it.
            </p>
            <div className="border-t border-white/[0.05] mt-5 pt-5 flex flex-wrap gap-1.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">FREE</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">CORE</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">PATTERN RECOGNITION</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative flex flex-col p-7 bg-[#0c0a0d] rounded-2xl transition-all duration-400 hover:-translate-y-[3px]"
            style={{ 
              border: '1px solid rgba(224,116,58,0.07)'
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
              style={{
                border: '1px solid rgba(224,116,58,0.16)',
                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(224,116,58,0.06)'
              }}
            />
            <div className="absolute top-6 right-6 font-mono text-[9px] text-[#e0743a]/30 tracking-[0.1em]">02</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#4f4b47] mb-4">pro</div>
            <h3 className="text-xl text-[#f4efe9] mb-3" style={{ fontFamily: "'Fraunces', 'Playfair Display', serif" }}>Alignment</h3>
            <p className="text-[14px] text-[#76716b] leading-relaxed flex-1">
              Choose the cleaner move. For decisions, responses, and next steps. Alignment helps you see what is yours, what is not, and how to move without losing yourself.
            </p>
            <div className="border-t border-white/[0.05] mt-5 pt-5 flex flex-wrap gap-1.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">PRO</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">ACTION</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">RESPONSE</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative flex flex-col p-7 bg-[#0c0a0d] rounded-2xl transition-all duration-400 hover:-translate-y-[3px]"
            style={{ 
              border: '1px solid rgba(224,116,58,0.07)'
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
              style={{
                border: '1px solid rgba(224,116,58,0.16)',
                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(224,116,58,0.06)'
              }}
            />
            <div className="absolute top-6 right-6 font-mono text-[9px] text-[#e0743a]/30 tracking-[0.1em]">03</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#4f4b47] mb-4">pro</div>
            <h3 className="text-xl text-[#f4efe9] mb-3" style={{ fontFamily: "'Fraunces', 'Playfair Display', serif" }}>Covenant</h3>
            <p className="text-[14px] text-[#76716b] leading-relaxed flex-1">
              Understand what the moment belongs to. For reflection and deeper integration. Covenant helps you step back and see the larger pattern.
            </p>
            <div className="border-t border-white/[0.05] mt-5 pt-5 flex flex-wrap gap-1.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">PRO</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">REFLECTION</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">INTEGRATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="relative bg-[#0c0a0d] py-40 lg:py-56 overflow-hidden px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Rings & Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[400px] h-[400px] rounded-full" style={{ border: '1px solid rgba(224,116,58,0.07)' }} />
          <div className="absolute w-[650px] h-[650px] rounded-full" style={{ border: '1px solid rgba(224,116,58,0.07)' }} />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,116,58,0.06) 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">Begin</div>
          <h2 
            className="font-light text-[#f4efe9] tracking-[-0.025em] leading-[1.05]"
            style={{ fontFamily: "'Fraunces', 'Playfair Display', serif", fontSize: "clamp(2.4rem, 6vw, 4.8rem)" }}
          >
            <span style={{ textShadow: '0 0 40px rgba(224,116,58,0.35), 0 0 80px rgba(200,100,40,0.12)' }}>Return before</span> the pattern runs the room.
          </h2>
          <p className="mt-6 text-[15px] text-[#76716b] leading-relaxed max-w-md">
            Understand what's active, see what may be repeating, and choose the next move with more context.
          </p>
          <button className="mt-9 px-6 py-3 rounded-2xl bg-[#f4efe9] text-[#08070a] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold hover:opacity-92 transition-opacity relative z-10">
            Enter Sovereign.os
          </button>
          <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] relative z-10">
            Private by design · Free to start
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-[#08070a] py-12 px-6 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[9px] text-[#4f4b47]">
            Sovereign.os © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 font-mono text-[9px] text-[#4f4b47]">
            <a href="#" className="hover:text-[#76716b] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#76716b] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#76716b] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        .animate-blob {
          animation: float 28s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
