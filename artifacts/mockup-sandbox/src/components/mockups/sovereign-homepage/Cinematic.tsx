import React from 'react';

export default function Cinematic() {
  return (
    <div className="min-h-screen bg-[#08070a] text-[#f4efe9] overflow-x-hidden selection:bg-[#e0743a]/30" style={{ fontFamily: "'Geist', Inter, sans-serif" }}>
      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.04); }
        }
        .font-serif-custom {
          font-family: 'Fraunces', 'Playfair Display', serif;
        }
        .font-mono-custom {
          font-family: 'JetBrains Mono', 'Geist Mono', monospace;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Background Image & Overlay */}
        <div className="absolute right-0 top-0 h-full w-[65%]">
          <img 
            src="/__mockup/images/hero-hand.webp" 
            alt="Hand in shadow" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08070a] via-[rgba(8,7,10,0.3)] to-transparent" />
        </div>

        {/* Ambient Blobs */}
        <div 
          className="absolute -top-80 -right-20 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(224,116,58,0.075) 0%, transparent 70%)',
            animation: 'blobFloat 32s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(224,116,58,0.03) 0%, transparent 70%)' }}
        />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[640px] pl-8 lg:pl-16 xl:pl-28 py-48">
          <h1 className="font-serif-custom font-light text-[#f4efe9] leading-[1.02] tracking-[-0.03em] text-[clamp(4rem,9vw,7rem)] flex flex-col">
            <span>Your private</span>
            <span>operating system for</span>
            <span style={{ textShadow: '0 0 50px rgba(224,116,58,0.5), 0 0 100px rgba(200,100,40,0.2)' }}>
              becoming clear
            </span>
            <span className="italic text-[#f4efe9]/65">to yourself.</span>
          </h1>

          <p className="text-[16px] text-[#76716b] leading-[1.75] mt-9 max-w-md">
            Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
          </p>

          <div className="mt-6 pl-4 border-l border-[#e0743a]/20 max-w-xs">
            <p className="font-mono-custom text-[10px] text-[#4f4b47] tracking-[0.1em] leading-relaxed">
              Most AI responds to what you type. Sovereign.os understands the pattern you're typing from.
            </p>
          </div>

          <div className="mt-11 flex items-center gap-7">
            <button className="px-6 py-3 rounded-2xl bg-[#f4efe9] text-[#08070a] font-mono-custom text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-white transition-colors duration-300">
              Enter Sovereign.os
            </button>
            <span className="font-mono-custom text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              Free to start
            </span>
          </div>

          <div className="mt-10 max-w-xs">
            <div className="border-t border-[#e0743a]/15 mb-3" />
            <div className="font-mono-custom text-[9px] tracking-[0.12em] text-[#4f4b47]">
              Free to start  ·  Private by design  ·  No history retained
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Baseline */}
      <section className="relative bg-[#09080c] border-t border-white/[0.04] py-44 lg:py-56 overflow-hidden">
        {/* Ambient Glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(224,116,58,0.055) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center mb-20 px-6">
          <div className="font-mono-custom text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-7">
            The Foundation
          </div>
          <h2 className="font-serif-custom font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.06] text-[clamp(2.5rem,6vw,4.2rem)]">
            Everything begins with your Baseline.
          </h2>
          <p className="mt-6 text-[16px] text-[#76716b] leading-relaxed max-w-sm mx-auto">
            Before it helps you navigate the world, it learns how you're built. Your natural advantages, your default stress responses, your core drives.
          </p>
        </div>

        {/* Space Preview Panel - Larger variation */}
        <div className="relative z-10 w-full max-w-xl mx-auto px-6">
          <div className="bg-[#131015] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#e0743a]/40" />
                <span className="font-mono-custom text-[11px] uppercase tracking-[0.1em] text-[#a8a29a]">Baseline Design</span>
              </div>
              <div className="font-mono-custom text-[10px] text-[#4f4b47]">74% mapped</div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Type Indicator */}
              <div className="flex justify-between items-end border-b border-white/[0.04] pb-4">
                <div>
                  <div className="font-mono-custom text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-2">Design Type</div>
                  <div className="font-serif-custom text-2xl text-[#f4efe9]">Projector</div>
                </div>
                <div className="text-right">
                  <div className="font-mono-custom text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-2">Authority</div>
                  <div className="font-mono-custom text-xs text-[#a8a29a]">Splenic</div>
                </div>
              </div>

              {/* Traits */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono-custom text-[10px] text-[#a8a29a] uppercase tracking-wider">Recognition Drive</span>
                    <span className="font-mono-custom text-[10px] text-[#e0743a]">High</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e0743a]/40 w-[85%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono-custom text-[10px] text-[#a8a29a] uppercase tracking-wider">Energy Consistency</span>
                    <span className="font-mono-custom text-[10px] text-[#76716b]">Variable</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                    <div className="h-full bg-white/[0.1] w-[40%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.03] rounded-xl">
                <p className="text-[13px] text-[#76716b] leading-relaxed">
                  <span className="text-[#a8a29a] block mb-1">Observation:</span>
                  You process information in bursts, requiring significant rest periods between deep engagements to maintain clarity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Spaces (Numbered Row List) */}
      <section className="bg-[#0c0a0d] border-t border-white/[0.04] py-32 lg:py-44 px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <div className="font-mono-custom text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-7">
            Architecture
          </div>
          <h2 className="font-serif-custom font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.06] text-[clamp(2.5rem,5vw,3.5rem)]">
            A structure for clarity.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Row 1 */}
          <div className="group flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-10 border-b border-white/[0.05] hover:bg-[#e0743a]/[0.015] transition-colors duration-300 rounded-xl px-4 -mx-4">
            <div className="font-serif-custom font-light text-[4rem] text-[#e0743a]/15 leading-none w-24 shrink-0 group-hover:text-[#e0743a]/30 transition-colors duration-300">
              01
            </div>
            <div className="flex-1">
              <h3 className="font-serif-custom text-[1.5rem] text-[#f4efe9] mb-2">Decisions Space</h3>
              <div className="font-mono-custom text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Free · core</div>
              <p className="text-[15px] text-[#76716b] leading-relaxed">
                Run major life choices through your unique authority filter. Stop agonizing over logic when your body already knows the answer.
              </p>
            </div>
            <div className="shrink-0 md:w-40 md:text-right flex flex-col space-y-1.5 mt-4 md:mt-0">
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Bias detection</span>
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Authority mapping</span>
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Clarity scoring</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="group flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-10 border-b border-white/[0.05] hover:bg-[#e0743a]/[0.015] transition-colors duration-300 rounded-xl px-4 -mx-4">
            <div className="font-serif-custom font-light text-[4rem] text-[#e0743a]/15 leading-none w-24 shrink-0 group-hover:text-[#e0743a]/30 transition-colors duration-300">
              02
            </div>
            <div className="flex-1">
              <h3 className="font-serif-custom text-[1.5rem] text-[#f4efe9] mb-2">Relational Space</h3>
              <div className="font-mono-custom text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Pro · action</div>
              <p className="text-[15px] text-[#76716b] leading-relaxed">
                Map the energetic dynamics between you and others. Understand why certain people drain you while others amplify your impact.
              </p>
            </div>
            <div className="shrink-0 md:w-40 md:text-right flex flex-col space-y-1.5 mt-4 md:mt-0">
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Energy dynamics</span>
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Friction points</span>
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Communication styles</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="group flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-10 hover:bg-[#e0743a]/[0.015] transition-colors duration-300 rounded-xl px-4 -mx-4">
            <div className="font-serif-custom font-light text-[4rem] text-[#e0743a]/15 leading-none w-24 shrink-0 group-hover:text-[#e0743a]/30 transition-colors duration-300">
              03
            </div>
            <div className="flex-1">
              <h3 className="font-serif-custom text-[1.5rem] text-[#f4efe9] mb-2">Deconditioning Space</h3>
              <div className="font-mono-custom text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Pro · reflection</div>
              <p className="text-[15px] text-[#76716b] leading-relaxed">
                Identify where you're operating from external programming rather than internal truth. Systematically shed what isn't yours.
              </p>
            </div>
            <div className="shrink-0 md:w-40 md:text-right flex flex-col space-y-1.5 mt-4 md:mt-0">
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Pattern recognition</span>
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Limiting beliefs</span>
              <span className="font-mono-custom text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]">Shadow work</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Editorial CTA */}
      <section className="relative bg-[#0c0a0d] border-t border-white/[0.04] py-44 lg:py-64 overflow-hidden px-6">
        {/* Ambient Glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(224,116,58,0.07) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="font-mono-custom text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">
            The Invitation
          </div>
          
          <h2 className="font-serif-custom font-light text-[#f4efe9] tracking-[-0.025em] leading-[1.03] text-[clamp(3rem,7.5vw,6.5rem)]">
            <span style={{ textShadow: '0 0 50px rgba(224,116,58,0.4), 0 0 100px rgba(200,100,40,0.15)' }}>Return before</span>
            <br />
            you respond.
          </h2>

          <div className="w-16 h-px bg-[#e0743a]/30 mx-auto mt-12" />

          <button className="mt-8 group flex items-center font-mono-custom text-[12px] uppercase tracking-[0.24em] text-[#a8a29a] hover:text-[#f4efe9] transition-colors duration-300">
            <span className="border-b border-transparent group-hover:border-[#f4efe9]/30 transition-colors duration-300 pb-1">
              Enter your domain &rarr;
            </span>
          </button>

          <div className="mt-6 font-mono-custom text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
            private by design · free to start
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#08070a] border-t border-white/[0.04] py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[#76716b]">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#e0743a] to-[#08070a] opacity-80" />
            <span className="font-serif-custom text-sm tracking-wide text-[#a8a29a]">Sovereign.os</span>
          </div>
          
          <div className="flex items-center gap-8 font-mono-custom text-[10px] uppercase tracking-[0.15em] text-[#4f4b47]">
            <a href="#" className="hover:text-[#a8a29a] transition-colors">Manifesto</a>
            <a href="#" className="hover:text-[#a8a29a] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#a8a29a] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
