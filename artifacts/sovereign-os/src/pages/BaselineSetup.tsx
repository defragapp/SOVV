import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveBaseline } from '@/lib/baseline';
import type { BaselineData } from '@/lib/baseline';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Topology SVG — slow-breathing contour map ─────────────────────────────────
function TopologyMap({ step }: { step: number }) {
  // Scale and rotate advance with each step to simulate "mapping in progress"
  const scale = 1 + step * 0.05;
  const rotate = step * 3;

  return (
    <motion.div
      animate={{ scale, rotate }}
      transition={{ duration: 1.4, ease }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full opacity-100"
      >
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 20 + i * 26;
          const amp = 12 + (i % 4) * 6;
          const freq = 0.008 + (i % 3) * 0.003;
          // Sinusoidal contour paths
          const points = Array.from({ length: 17 }, (__, j) => {
            const x = j * 50;
            const dy = Math.sin(j * freq * 100 + i * 0.7) * amp;
            return `${x},${y + dy}`;
          });
          return (
            <polyline
              key={i}
              points={points.join(' ')}
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="1"
              fill="none"
            />
          );
        })}
        {/* Sparse amber accent lines */}
        {[3, 9, 16].map(i => {
          const y = 20 + i * 26;
          return (
            <polyline
              key={`accent-${i}`}
              points={Array.from({ length: 17 }, (_, j) => {
                const x = j * 50;
                const dy = Math.sin(j * 0.01 * 100 + i * 0.7) * 14;
                return `${x},${y + dy}`;
              }).join(' ')}
              stroke="rgba(224,116,58,0.06)"
              strokeWidth="1"
              fill="none"
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  {
    index: '01/03',
    tag: 'DEFAULT RETREAT',
    question: 'When conflict spikes, where do you instinctively go?',
    placeholder: 'I tend to withdraw into...',
    field: 'defaultRetreat' as keyof BaselineData,
  },
  {
    index: '02/03',
    tag: 'CORE BOUNDARY',
    question: 'What is the line that, when crossed, collapses your clarity?',
    placeholder: 'My clarity breaks when...',
    field: 'coreBoundary' as keyof BaselineData,
  },
  {
    index: '03/03',
    tag: 'REPAIR MECHANIC',
    question: 'How do you attempt to fix the break?',
    placeholder: 'I try to repair by...',
    field: 'repairMechanic' as keyof BaselineData,
  },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface BaselineSetupProps {
  onComplete: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BaselineSetup({ onComplete }: BaselineSetupProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<BaselineData>>({});
  const [value, setValue] = useState('');
  const [sealing, setSealing] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canAdvance = value.trim().length > 0;

  const advance = async () => {
    if (!canAdvance || sealing) return;

    const updated = { ...answers, [currentStep.field]: value.trim() };
    setAnswers(updated);

    if (isLast) {
      setSealing(true);
      // Simulate backend POST (real: POST /api/user/baseline)
      await new Promise(r => setTimeout(r, 700));
      saveBaseline(updated as BaselineData);
      onComplete();
    } else {
      setDirection(1);
      setStep(s => s + 1);
      setValue('');
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#08070a]">
      {/* Topology background — reacts to step progress */}
      <TopologyMap step={step} />

      {/* Ambient glow */}
      <div
        className="absolute -top-40 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,116,58,0.10) 0%, transparent 70%)', animation: 'ambientDrift 25s ease-in-out infinite' }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] px-6">
        {/* Wordmark */}
        <div className="text-center mb-12">
          <span className="font-mono text-[10px] tracking-[0.28em] text-[#4f4b47] uppercase">
            SOVEREIGN.OS
          </span>
        </div>

        {/* Step indicator */}
        <div className="mb-6 text-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60">
            [{currentStep.index}] {currentStep.tag}
          </span>
        </div>

        {/* Animated question card */}
        <div
          className="rounded-3xl ring-1 ring-inset ring-white/[0.05] overflow-hidden"
          style={{ background: '#1C1C1E' }}
        >
          {/* Question area */}
          <div className="px-8 pt-8 pb-5 border-b border-white/[0.05]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.h2
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease }}
                className="font-serif text-3xl text-[#f4efe9] tracking-[-0.015em] leading-tight"
              >
                {currentStep.question}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Input area */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`input-${step}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease }}
            >
              <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={currentStep.placeholder}
                rows={3}
                autoFocus
                className="w-full px-8 pt-5 pb-5 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none resize-none leading-relaxed"
                style={{ fontFamily: 'var(--app-font-sans)' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) advance();
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Action footer */}
          <div className="flex items-center justify-between px-8 pb-7 border-t border-white/[0.05] pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              {sealing ? 'SEALING BASELINE...' : canAdvance ? 'INPUT ACTIVE' : 'AWAITING INPUT'}
            </span>
            <button
              onClick={advance}
              disabled={!canAdvance || sealing}
              className="px-6 py-2.5 rounded-2xl font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 disabled:opacity-30"
              style={{
                background: canAdvance && !sealing ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: canAdvance && !sealing ? '#f4efe9' : '#4f4b47',
                boxShadow: canAdvance && !sealing
                  ? '0 0 0 1px rgba(255,255,255,0.10) inset'
                  : '0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              {sealing ? '···' : isLast ? 'Seal Baseline' : 'Continue →'}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? '#e0743a' : '#2a2826',
                boxShadow: i === step ? '0 0 6px rgba(224,116,58,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Skip — light touch for users who want to explore first */}
        <div className="text-center mt-5">
          <button
            onClick={() => { saveBaseline({ defaultRetreat: '', coreBoundary: '', repairMechanic: '' }); onComplete(); }}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#2a2826] hover:text-[#4f4b47] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
