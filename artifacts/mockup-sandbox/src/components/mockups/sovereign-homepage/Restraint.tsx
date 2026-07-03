import React from 'react';

export default function Restraint() {
  return (
    <div style={{ background: '#08070a', minHeight: '100vh', color: '#f4efe9', fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <style>{`
        .cta-link {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: rgba(255, 255, 255, 0.25);
          transition: text-decoration-color 0.3s ease, color 0.3s ease;
        }
        .cta-link:hover {
          text-decoration-color: rgba(224, 116, 58, 0.6) !important;
          color: #f4efe9 !important;
        }
        .space-row {
          transition: color 0.3s ease;
        }
        .space-row:hover .space-name {
          color: #f4efe9;
        }
      `}</style>

      {/* Hero Section */}
      <section className="min-h-screen overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-full lg:w-[52%]">
          <img 
            src="/__mockup/images/hero-hand.webp" 
            alt="Hand" 
            className="w-full h-full object-cover grayscale-[20%] opacity-80"
          />
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(to right, #08070a 0%, rgba(8,7,10,0.5) 38%, transparent 100%)'
            }}
          />
          <div className="absolute inset-0 bg-[#08070a]/20 pointer-events-none" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[520px] pl-8 sm:pl-10 lg:pl-16 xl:pl-24 py-36 relative z-10 w-full">
            <div className="font-mono text-[9px] uppercase tracking-[0.36em] text-[#4f4b47] mb-12">
              Sovereign.os
            </div>
            <h1 className="font-['Fraunces'] font-light text-[#f4efe9] leading-[1.07] tracking-[-0.02em] text-[clamp(2.6rem,6vw,4.8rem)]">
              Your private operating<br />
              system for becoming<br />
              clear to yourself.
            </h1>
            <p className="mt-8 text-[15px] text-[#a8a29a] leading-[1.75] max-w-xs">
              Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
            </p>
            <div className="mt-12 flex items-center gap-8">
              <a href="#" className="cta-link font-mono text-[11px] uppercase tracking-[0.18em] text-[#f4efe9]">
                Enter Sovereign.os →
              </a>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                Free to start
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Baseline */}
      <section className="border-t border-white/[0.04] py-32 lg:py-44 px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center mb-16">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">
            Baseline Design
          </div>
          <h2 className="font-['Fraunces'] font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.08] text-[clamp(1.9rem,4.5vw,3.2rem)]">
            Most AI responds to what you type.<br />
            Sovereign.os understands the pattern you're typing from.
          </h2>
          <p className="mt-5 text-[15px] text-[#76716b] leading-relaxed max-w-sm mx-auto">
            Your Baseline Design is active beneath every thread.
          </p>
        </div>

        {/* SpacePreview panel */}
        <div className="max-w-lg mx-auto border border-white/[0.08] rounded-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] bg-[#0c0a0d] p-8 lg:p-10 relative overflow-hidden text-left">
          <div className="mb-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-6 border-b border-white/[0.05] pb-4">
              Baseline Patterns
            </div>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 justify-between">
                <p className="text-[14px] text-[#a8a29a] leading-snug max-w-[280px]">
                  You process conflict through withdrawal before re-engagement.
                </p>
                <div className="font-mono text-[9px] text-[#4f4b47] uppercase tracking-[0.1em] shrink-0 mt-2 sm:mt-0">
                  DEFENSE, DELAY
                </div>
              </div>
              <div className="w-full h-px bg-white/[0.03]"></div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 justify-between">
                <p className="text-[14px] text-[#a8a29a] leading-snug max-w-[280px]">
                  Boundaries collapse under sustained pressure from authority figures.
                </p>
                <div className="font-mono text-[9px] text-[#4f4b47] uppercase tracking-[0.1em] shrink-0 mt-2 sm:mt-0">
                  PATTERN, ROLE
                </div>
              </div>
              <div className="w-full h-px bg-white/[0.03]"></div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 justify-between">
                <p className="text-[14px] text-[#a8a29a] leading-snug max-w-[280px]">
                  You repair through over-explanation rather than silence.
                </p>
                <div className="font-mono text-[9px] text-[#4f4b47] uppercase tracking-[0.1em] shrink-0 mt-2 sm:mt-0">
                  REPAIR
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-[#08070a] border border-white/[0.04] p-6 rounded-xl">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-3">
              Analysis
            </div>
            <p className="text-[14px] text-[#a8a29a] leading-relaxed mb-6">
              The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.
            </p>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-3">
              Best next response
            </div>
            <p className="text-[14px] text-[#f4efe9] leading-relaxed">
              <span className="text-[#e0743a] mr-2">Pause before repair.</span> 
              Hold the impulse to fix immediately. Name what you noticed before you respond.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Spaces */}
      <section className="border-t border-white/[0.04] py-32 lg:py-44 px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center mb-24">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">
            Spaces
          </div>
          <h2 className="font-['Fraunces'] font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.08] text-[clamp(1.9rem,4.5vw,3.2rem)]">
            A structure for every state.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-row py-10 border-b border-white/[0.05] flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 group">
            <div className="w-32 shrink-0">
              <h3 className="space-name font-['Fraunces'] text-[1.3rem] text-[#d4cec8] transition-colors duration-300">
                Defrag
              </h3>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#76716b] group-hover:text-[#a8a29a] transition-colors duration-300 leading-relaxed max-w-md">
                Untangle the moment. For conversations, conflicts, and inner pressure that feel messy. Defrag shows what's happening, what pattern is forming, and what changes it.
              </p>
            </div>
            <div className="w-40 md:w-32 shrink-0 md:text-right font-mono text-[9px] text-[#4f4b47] uppercase tracking-[0.1em] leading-[1.8] mt-2 md:mt-0">
              Free · core<br className="hidden md:block" />
              <span className="md:hidden"> · </span>pattern recognition
            </div>
          </div>

          <div className="space-row py-10 border-b border-white/[0.05] flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 group">
            <div className="w-32 shrink-0">
              <h3 className="space-name font-['Fraunces'] text-[1.3rem] text-[#d4cec8] transition-colors duration-300">
                Alignment
              </h3>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#76716b] group-hover:text-[#a8a29a] transition-colors duration-300 leading-relaxed max-w-md">
                Choose the cleaner move. For decisions, responses, and next steps. Alignment helps you see what is yours, what is not, and how to move without losing yourself.
              </p>
            </div>
            <div className="w-40 md:w-32 shrink-0 md:text-right font-mono text-[9px] text-[#4f4b47] uppercase tracking-[0.1em] leading-[1.8] mt-2 md:mt-0">
              Pro · action<br className="hidden md:block" />
              <span className="md:hidden"> · </span>response
            </div>
          </div>

          <div className="space-row py-10 flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 group">
            <div className="w-32 shrink-0">
              <h3 className="space-name font-['Fraunces'] text-[1.3rem] text-[#d4cec8] transition-colors duration-300">
                Covenant
              </h3>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#76716b] group-hover:text-[#a8a29a] transition-colors duration-300 leading-relaxed max-w-md">
                Understand what the moment belongs to. For reflection and deeper integration. Covenant helps you step back and see the larger pattern.
              </p>
            </div>
            <div className="w-40 md:w-32 shrink-0 md:text-right font-mono text-[9px] text-[#4f4b47] uppercase tracking-[0.1em] leading-[1.8] mt-2 md:mt-0">
              Pro · reflection<br className="hidden md:block" />
              <span className="md:hidden"> · </span>integration
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — CTA */}
      <section className="border-t border-white/[0.04] py-44 lg:py-60 relative px-6 lg:px-8 overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(224,116,58,0.04) 0%, transparent 70%)'
          }}
        />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-10">
            The Next Step
          </div>
          <h2 className="font-['Fraunces'] font-light text-[#f4efe9] tracking-[-0.025em] leading-[1.05] text-[clamp(2.8rem,7vw,6rem)]">
            Return before the pattern runs the room.
          </h2>
          
          <div className="mt-10 w-12 h-px bg-[#e0743a]/25 mx-auto" />
          
          <div className="mt-10">
            <a href="#" className="cta-link font-mono text-[11px] uppercase tracking-[0.22em] text-[#a8a29a]">
              Enter Sovereign.os →
            </a>
          </div>
          <div className="mt-6 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
            Private by design · Free to start
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[9px] uppercase tracking-[0.36em] text-[#4f4b47]">
            Sovereign.os
          </div>
          <div className="flex items-center gap-8">
            {['Manifesto', 'Privacy', 'Twitter', 'Log In'].map((link) => (
              <a 
                key={link}
                href="#" 
                className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#4f4b47] hover:text-[#a8a29a] transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
