import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveBaseline } from '@/lib/baseline';
import type { BaselineData } from '@/lib/baseline';

const ease = [0.16, 1, 0.3, 1] as const;

// ── Topology SVG — slow-breathing contour map ─────────────────────────────────
function TopologyMap({ step }: { step: number }) {
  const scale = 1 + step * 0.05;
  const rotate = step * 3;
  return (
    <motion.div
      animate={{ scale, rotate }}
      transition={{ duration: 1.4, ease }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 20 + i * 26;
          const amp = 12 + (i % 4) * 6;
          const points = Array.from({ length: 17 }, (__, j) => {
            const x = j * 50;
            const dy = Math.sin(j * (0.008 + (i % 3) * 0.003) * 100 + i * 0.7) * amp;
            return `${x},${y + dy}`;
          });
          return (
            <polyline key={i} points={points.join(' ')}
              stroke="rgba(255,255,255,0.025)" strokeWidth="1" fill="none" />
          );
        })}
        {[3, 9, 16].map(i => (
          <polyline
            key={`accent-${i}`}
            points={Array.from({ length: 17 }, (_, j) => {
              const x = j * 50;
              const dy = Math.sin(j * 0.01 * 100 + i * 0.7) * 14;
              return `${x},${(20 + i * 26) + dy}`;
            }).join(' ')}
            stroke="rgba(224,116,58,0.06)" strokeWidth="1" fill="none"
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ── Validation ─────────────────────────────────────────────────────────────────
// Strict calendar validation — no rollover accepted (e.g. Feb 31 is invalid).
function isStrictDate(v: string): boolean {
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
}

function validateDob(val: string): string | null {
  const v = val.trim();
  if (!v) return 'Birth date is required.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Use YYYY-MM-DD format\u2002\u00b7\u2002e.g. 1990-03-15';
  if (!isStrictDate(v)) return 'Please enter a valid calendar date.';
  const yr = parseInt(v.slice(0, 4), 10);
  if (yr < 1900 || yr > new Date().getFullYear()) return 'Please enter a realistic birth year.';
  return null;
}

function validatePob(val: string): string | null {
  return val.trim().length >= 2 ? null : 'Place of birth is required.';
}

// ── Step definitions ──────────────────────────────────────────────────────────
// 3 data steps; step === STEPS.length is the review/confirmation step
const STEPS = [
  {
    index: '01',
    tag:      'BIRTH DATE',
    optional: false,
    question: 'When were you born?',
    hint:     'Your birth date anchors your pattern signature. Never shown in outputs.',
    placeholder: 'YYYY-MM-DD',
    field: 'dob' as keyof BaselineData,
  },
  {
    index: '02',
    tag:      'BIRTH PLACE',
    optional: false,
    question: 'Where were you born?',
    hint:     'Your birthplace seeds the geographical layer of your design. Never exposed in outputs.',
    placeholder: 'City, Region, Country',
    field: 'pob' as keyof BaselineData,
  },
  {
    index: '03',
    tag:      'BIRTH TIME',
    optional: true,
    question: 'What time were you born?',
    hint:     'Approximate is fine\u2002\u00b7\u2002morning, 14:30, afternoon. Leave blank if unknown.',
    placeholder: 'e.g. 14:30 or morning',
    field: 'tob' as keyof BaselineData,
  },
] as const;

// Total dots = 3 data steps + 1 review
const TOTAL_DOTS = STEPS.length + 1;

// ── Props ─────────────────────────────────────────────────────────────────────
interface BaselineSetupProps {
  onComplete: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BaselineSetup({ onComplete }: BaselineSetupProps) {
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers]     = useState<Partial<BaselineData>>({});
  const [value, setValue]         = useState('');
  const [attempted, setAttempted] = useState(false); // show error only after a failed advance
  const [sealing, setSealing]     = useState(false);

  const isReview = step === STEPS.length; // step 3
  const currentStep = isReview ? null : STEPS[step];

  // Per-step validation (null = valid)
  function getError(stepIdx: number, val: string): string | null {
    if (stepIdx === 0) return validateDob(val);
    if (stepIdx === 1) return validatePob(val);
    return null; // TOB is optional
  }

  const currentError = isReview || !currentStep ? null : getError(step, value);

  const advance = async () => {
    if (sealing) return;
    if (isReview) {
      setSealing(true);
      await saveBaseline({
        dob: String(answers.dob ?? ''),
        pob: String(answers.pob ?? ''),
        tob: String(answers.tob ?? ''),
      });
      onComplete();
      return;
    }
    if (currentError) {
      setAttempted(true);
      return;
    }
    const field = STEPS[step].field;
    setAnswers(prev => ({ ...prev, [field]: value.trim() }));
    setAttempted(false);
    setDirection(1);
    setStep(s => s + 1);
    setValue('');
  };

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ?  40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -40 :  40, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#08070a]">
      <TopologyMap step={step} />

      {/* Ambient glow */}
      <div
        className="absolute -top-40 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(224,116,58,0.10) 0%, transparent 70%)',
          animation: 'ambientDrift 25s ease-in-out infinite',
        }}
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
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="inline-block font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60"
            >
              {isReview
                ? '[REVIEW] BASELINE SUMMARY'
                : `[${currentStep!.index}/03] ${currentStep!.tag}${currentStep!.optional ? ' · OPTIONAL' : ''}`}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl ring-1 ring-inset ring-white/[0.05] overflow-hidden"
          style={{ background: '#1C1C1E' }}
        >
          {/* Question / review header */}
          <div className="px-8 pt-8 pb-5 border-b border-white/[0.05]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease }}
              >
                {isReview ? (
                  <>
                    <h2 className="font-serif text-3xl text-[#f4efe9] tracking-[-0.015em] leading-tight">
                      Here&rsquo;s what you entered.
                    </h2>
                    <p className="mt-2 text-[13px] text-[#4f4b47] leading-relaxed">
                      Review before sealing your Baseline Design. You can edit this later in Settings.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-3xl text-[#f4efe9] tracking-[-0.015em] leading-tight">
                      {currentStep!.question}
                    </h2>
                    <p className="mt-2 text-[13px] text-[#4f4b47] leading-relaxed">
                      {currentStep!.hint}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Input / review body */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`body-${step}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease }}
            >
              {isReview ? (
                /* ── Review summary ── */
                <div className="px-8 pt-5 pb-5 flex flex-col gap-4">
                  {[
                    { label: 'Birth Date',  value: answers.dob || '\u2014' },
                    { label: 'Birth Place', value: answers.pob || '\u2014' },
                    { label: 'Birth Time',  value: answers.tob || 'Not provided' },
                  ].map(({ label, value: v }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
                        {label}
                      </p>
                      <p className="text-[17px] text-[#f4efe9] font-sans leading-snug">{v}</p>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Text input ── */
                <div>
                  <input
                    type="text"
                    value={value}
                    onChange={e => {
                      setValue(e.target.value);
                      // Clear error once user makes the field valid
                      if (attempted && getError(step, e.target.value) === null) setAttempted(false);
                    }}
                    placeholder={currentStep!.placeholder}
                    autoFocus
                    className="w-full px-8 pt-6 pb-4 bg-transparent text-[17px] text-[#f4efe9] placeholder:text-[#4f4b47] outline-none border-none leading-normal"
                    style={{ fontFamily: 'var(--app-font-sans)' }}
                    onKeyDown={e => { if (e.key === 'Enter') advance(); }}
                  />
                  {/* Inline error */}
                  <AnimatePresence>
                    {attempted && currentError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="px-8 pb-3 font-mono text-[9px] tracking-[0.08em] text-red-400/70"
                      >
                        {currentError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {/* Bottom spacer when no error */}
                  {!(attempted && currentError) && <div className="pb-4" />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action footer */}
          <div className="flex items-center justify-between px-8 pb-7 border-t border-white/[0.05] pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              {sealing
                ? 'SEALING BASELINE\u2026'
                : isReview
                ? 'READY TO SEAL'
                : currentError === null && value !== ''
                ? 'INPUT ACTIVE'
                : STEPS[step]?.optional
                ? 'OPTIONAL FIELD'
                : 'AWAITING INPUT'}
            </span>
            <button
              onClick={advance}
              disabled={sealing}
              className="px-6 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 disabled:opacity-30"
              style={{
                background: (!sealing && (isReview || currentError === null))
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: (!sealing && (isReview || currentError === null)) ? '#f4efe9' : '#4f4b47',
                boxShadow: (!sealing && (isReview || currentError === null))
                  ? '0 0 0 1px rgba(255,255,255,0.10) inset'
                  : '0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              {sealing ? '\u00b7\u00b7\u00b7' : isReview ? 'Seal Baseline \u2192' : 'Continue \u2192'}
            </button>
          </div>
        </div>

        {/* Progress dots — 3 data + 1 review = 4 total */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
            <span
              key={i}
              className="transition-all duration-300"
              style={{
                width:  i === step ? '18px' : '6px',
                height: '6px',
                borderRadius: '99px',
                background: i <= step ? '#e0743a' : '#2a2826',
                boxShadow: i === step ? '0 0 6px rgba(224,116,58,0.55)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
