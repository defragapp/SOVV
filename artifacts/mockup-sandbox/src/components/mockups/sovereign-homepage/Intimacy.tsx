import React from 'react';

export default function Intimacy() {
  return (
    <div style={{ background: '#08070a', minHeight: '100vh', color: '#f4efe9', fontFamily: "'Geist', Inter, sans-serif" }}>
      <style>{`
        @keyframes ambFloat { 
          0%,100% { transform: translate(0,0) scale(1) } 
          50% { transform: translate(-18px,15px) scale(1.05) } 
        }
      `}</style>
      
      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden bg-[#08070a]">
        <img 
          src="/__mockup/images/hero-hand.webp" 
          alt="" 
          className="absolute right-0 top-0 h-full w-[60%] object-cover" 
        />
        <div 
          className="absolute right-0 top-0 h-full w-[60%]" 
          style={{ background: 'linear-gradient(to right, #08070a 0%, rgba(15,10,8,0.55) 42%, transparent 100%)' }} 
        />
        <div 
          className="absolute -top-40 right-[-100px] w-[650px] h-[650px] rounded-full pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, rgba(224,116,58,0.08) 0%, transparent 70%)',
            animation: 'ambFloat 26s ease-in-out infinite' 
          }} 
        />
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[640px] pl-10 lg:pl-20 xl:pl-28 py-36">
            <div className="font-mono text-[9px] uppercase tracking-[0.34em] text-[#4f4b47]/80 mb-8">
              Sovereign.os
            </div>
            
            <h1 
              className="font-light text-[#f4efe9] leading-[1.06] tracking-[-0.025em]"
              style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2.8rem, 6.5vw, 5rem)' }}
            >
              Your private operating<br />
              system for <span style={{ textShadow: '0 0 30px rgba(224,116,58,0.45)' }}>becoming</span><br />
              clear to yourself.
            </h1>
            
            <p className="mt-7 text-[17px] text-[#76716b] leading-[1.75] max-w-sm">
              Sovereign.os uses your Baseline Design to understand your patterns across relationships, decisions, and pressure — so guidance starts from who you are.
            </p>
            
            <p className="mt-5 text-[13px] text-[#4f4b47] leading-relaxed max-w-xs pl-1">
              Most AI responds to what you type. Sovereign.os understands the pattern you're typing from.
            </p>
            
            <div className="mt-10 flex items-center gap-6">
              <button className="px-6 py-3 rounded-2xl border border-[#e0743a]/40 bg-[#e0743a]/[0.10] text-[#f4efe9] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-[#e0743a]/[0.18] transition-colors duration-300">
                Enter Sovereign.os
              </button>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                Free to start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Baseline */}
      <section className="relative border-t border-[#e0743a]/[0.10] bg-[#08070a] py-32 lg:py-44 overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 45% at 50% 50%, rgba(224,116,58,0.05) 0%, transparent 70%)' }}
        />
        
        <div className="relative z-10 max-w-xl mx-auto text-center mb-16 px-6">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">
            The Foundation
          </div>
          <h2 
            className="font-light italic text-[#f4efe9] tracking-[-0.02em] leading-[1.08]"
            style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Your Baseline Design.<br/>Active beneath every thread.
          </h2>
          <p className="mt-5 text-[15px] text-[#76716b] leading-relaxed max-w-sm mx-auto">
            The dynamic is one of accumulated pressure seeking relief through the relationship. The pattern is not new.
          </p>
        </div>

        {/* SpacePreview panel */}
        <div 
          className="max-w-lg mx-auto bg-[#0c0a0d] rounded-2xl overflow-hidden border border-[#e0743a]/15 relative z-10"
          style={{ boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(224,116,58,0.12), 0 0 80px rgba(224,116,58,0.06)' }}
        >
          {/* Header */}
          <div className="border-b border-[#e0743a]/15 p-4 flex gap-6 px-6">
            <div className="text-[11px] font-mono text-[#f4efe9] uppercase tracking-widest border-b border-[#e0743a] pb-1">
              Design
            </div>
            <div className="text-[11px] font-mono text-[#4f4b47] uppercase tracking-widest pb-1">
              Context
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-white/[0.03]">
                <div className="flex-1 text-[13px] text-[#a8a29a] leading-relaxed">
                  You process conflict through withdrawal before re-engagement.
                </div>
                <div className="flex gap-1.5 flex-wrap w-[120px] justify-end">
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Defense</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Delay</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 pb-4 border-b border-white/[0.03]">
                <div className="flex-1 text-[13px] text-[#a8a29a] leading-relaxed">
                  Boundaries collapse under sustained pressure from authority figures.
                </div>
                <div className="flex gap-1.5 flex-wrap w-[120px] justify-end">
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Pattern</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Role</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 pb-4 border-b border-white/[0.03]">
                <div className="flex-1 text-[13px] text-[#a8a29a] leading-relaxed">
                  You repair through over-explanation rather than silence.
                </div>
                <div className="flex gap-1.5 flex-wrap w-[120px] justify-end">
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Repair</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#e0743a] mb-2">Best Next Response</div>
              <div className="text-[13px] text-[#f4efe9] font-medium mb-1">Pause before repair</div>
              <div className="text-[13px] text-[#76716b] leading-relaxed">
                Hold the impulse to fix immediately. Name what you noticed before you respond.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Spaces */}
      <section className="border-t border-[#e0743a]/[0.10] bg-[#0c0a0d] py-32 lg:py-44 px-6">
        <div className="max-w-xl mx-auto text-center mb-14">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">
            The Spaces
          </div>
          <h2 
            className="font-light text-[#f4efe9] tracking-[-0.02em] leading-[1.08]"
            style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Where patterns resolve.
          </h2>
        </div>
        
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          {/* Defrag row */}
          <div className="p-7 border border-[#e0743a]/[0.10] rounded-2xl hover:border-[#e0743a]/[0.22] transition-all duration-500 hover:-translate-y-0.5 bg-[#0c0a0d]">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10">
              <div className="flex-1">
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#e0743a]/40 mb-2">Free</div>
                <h3 className="text-2xl text-[#f4efe9] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Defrag</h3>
                <p className="text-[15px] text-[#76716b] leading-relaxed max-w-2xl">
                  Untangle the moment. For conversations, conflicts, and inner pressure that feel messy. Defrag shows what's happening, what pattern is forming, and what changes it.
                </p>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Core</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Pattern Recognition</span>
              </div>
            </div>
          </div>
          
          {/* Alignment + Covenant row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-7 border border-white/[0.07] rounded-2xl hover:border-[#e0743a]/[0.14] transition-all duration-500 hover:-translate-y-0.5 bg-[#0c0a0d] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#4f4b47] mb-2">Pro</div>
                <h3 className="text-xl text-[#f4efe9] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Alignment</h3>
                <p className="text-[13px] text-[#76716b] leading-relaxed mb-6">
                  Choose the cleaner move. For decisions, responses, and next steps. Alignment helps you see what is yours, what is not, and how to move without losing yourself.
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Action</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Response</span>
              </div>
            </div>
            
            <div className="p-7 border border-white/[0.07] rounded-2xl hover:border-[#e0743a]/[0.14] transition-all duration-500 hover:-translate-y-0.5 bg-[#0c0a0d] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#4f4b47] mb-2">Pro</div>
                <h3 className="text-xl text-[#f4efe9] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Covenant</h3>
                <p className="text-[13px] text-[#76716b] leading-relaxed mb-6">
                  Understand what the moment belongs to. For reflection and deeper integration. Covenant helps you step back and see the larger pattern.
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Reflection</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05] rounded-[3px]">Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — CTA */}
      <section className="relative border-t border-[#e0743a]/[0.10] bg-[#08070a] py-40 lg:py-56 overflow-hidden px-6 flex flex-col items-center text-center">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(224,116,58,0.09) 0%, transparent 70%)' }}
        />
        
        <div className="relative z-10">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#4f4b47] mb-8">
            Begin
          </div>
          
          <h2 
            className="font-light italic text-[#f4efe9] leading-[1.05] max-w-2xl mx-auto"
            style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2.4rem, 6vw, 4.8rem)' }}
          >
            <span style={{ textShadow: '0 0 30px rgba(224,116,58,0.45)' }}>Return before</span> you respond.
          </h2>
          
          <p className="mt-6 text-[15px] text-[#76716b] max-w-md mx-auto leading-relaxed">
            Sovereign.os helps you integrate what you learn into how you live.
          </p>
          
          <div className="mt-9">
            <button className="px-6 py-3 rounded-2xl border border-[#e0743a]/40 bg-[#e0743a]/[0.10] text-[#f4efe9] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-[#e0743a]/[0.18] transition-colors duration-300">
              Enter Sovereign.os
            </button>
            <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              Private by design · Free to start
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0743a]/[0.08] bg-[#08070a] py-12 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="font-mono text-[9px] text-[#4f4b47] tracking-[0.28em] uppercase mb-2">
              Sovereign.os
            </div>
            <div className="font-mono text-[9px] text-[#4f4b47]/60 mb-6">
              Pattern clarity before response.
            </div>
            <div className="font-mono text-[9px] text-[#4f4b47]/40">
              © 2024 Sovereign. All rights reserved.
            </div>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="font-mono text-[9px] text-[#4f4b47] hover:text-[#76716b] uppercase tracking-widest transition-colors">Product</a>
            <a href="#" className="font-mono text-[9px] text-[#4f4b47] hover:text-[#76716b] uppercase tracking-widest transition-colors">How it works</a>
            <a href="#" className="font-mono text-[9px] text-[#4f4b47] hover:text-[#76716b] uppercase tracking-widest transition-colors">Pricing</a>
            <a href="#" className="font-mono text-[9px] text-[#4f4b47] hover:text-[#76716b] uppercase tracking-widest transition-colors">Sign in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
