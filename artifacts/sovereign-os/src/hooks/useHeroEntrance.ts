import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

export interface HeroEntranceRefs {
  glowRef:       React.RefObject<HTMLDivElement | null>;
  lightBeamRef:  React.RefObject<HTMLDivElement | null>;
  imageOuterRef: React.RefObject<HTMLDivElement | null>;
  labelRef:      React.RefObject<HTMLParagraphElement | null>;
  line1Ref:      React.RefObject<HTMLSpanElement | null>;
  line2Ref:      React.RefObject<HTMLSpanElement | null>;
  subtextRef:    React.RefObject<HTMLParagraphElement | null>;
  ctaRef:        React.RefObject<HTMLDivElement | null>;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SESSION_KEY = 'sovereign:entrance-played';

/**
 * Cinematic hero entrance — plays once per session.
 *
 * Timeline (total ~2.6 s):
 *   0.00 – 0.65  Amber glow + light beam ignite
 *   0.30 – 1.10  Hero image reveals via clipPath wipe (right → left)
 *   0.90         sovereign:nav-reveal event fires → SiteShell animates header in
 *   0.95 – 1.30  Eyebrow label fades in
 *   1.10 – 1.75  H1 line 1 mask-reveal (translateY 105 % → 0 %)
 *   1.50 – 2.15  H1 line 2 mask-reveal (staggered 400 ms)
 *   1.90 – 2.35  Subtext fades up
 *   2.15 – 2.55  CTA fades in
 *
 * Skips (instant reveal + nav event) when:
 *   - sessionStorage flag is set (return visit)
 *   - prefers-reduced-motion is active
 */
export function useHeroEntrance(): HeroEntranceRefs {
  const glowRef       = useRef<HTMLDivElement>(null);
  const lightBeamRef  = useRef<HTMLDivElement>(null);
  const imageOuterRef = useRef<HTMLDivElement>(null);
  const labelRef      = useRef<HTMLParagraphElement>(null);
  const line1Ref      = useRef<HTMLSpanElement>(null);
  const line2Ref      = useRef<HTMLSpanElement>(null);
  const subtextRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadyPlayed = !!sessionStorage.getItem(SESSION_KEY);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Skip path ──────────────────────────────────────────────────────────
    if (alreadyPlayed || reducedMotion) {
      // Ensure everything is visible
      const allEls = [
        glowRef.current, lightBeamRef.current, imageOuterRef.current,
        labelRef.current, line1Ref.current, line2Ref.current,
        subtextRef.current, ctaRef.current,
      ];
      allEls.forEach(el => {
        if (!el) return;
        el.style.removeProperty('opacity');
        el.style.removeProperty('clip-path');
        el.style.removeProperty('transform');
      });

      if (reducedMotion && !alreadyPlayed) {
        // Gentle single fade for reduced-motion users
        allEls.forEach(el => { if (el) el.style.opacity = '0'; });
        animate(allEls.filter(Boolean) as HTMLElement[], { opacity: 1 }, { duration: 0.5, ease: 'easeOut' });
      }

      window.dispatchEvent(new CustomEvent('sovereign:nav-reveal', { detail: { instant: true } }));
      return;
    }

    // ── Set initial hidden states ──────────────────────────────────────────
    const setStyle = (el: HTMLElement | null, prop: string, val: string) => {
      if (el) el.style.setProperty(prop, val);
    };

    setStyle(glowRef.current,      'opacity', '0');
    setStyle(lightBeamRef.current, 'opacity', '0');
    setStyle(labelRef.current,     'opacity', '0');
    setStyle(subtextRef.current,   'opacity', '0');
    setStyle(ctaRef.current,       'opacity', '0');
    setStyle(imageOuterRef.current, 'clip-path', 'inset(0 0 0 100%)');
    setStyle(line1Ref.current,     'transform', 'translateY(105%)');
    setStyle(line2Ref.current,     'transform', 'translateY(105%)');

    // ── Animate ────────────────────────────────────────────────────────────
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const at = (ms: number, fn: () => void) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(id);
    };

    const go = (el: HTMLElement | null, kf: Record<string, unknown>, opts: Record<string, unknown>) => {
      if (!el || cancelled) return;
      animate(el as HTMLElement, kf, opts as Parameters<typeof animate>[2]);
    };

    // Phase 1 — Glow ignites (0 – 0.65 s)
    go(glowRef.current,      { opacity: 0.04 }, { duration: 0.65, ease: 'easeOut' });
    go(lightBeamRef.current, { opacity: 1    }, { duration: 0.65, ease: 'easeOut' });

    // Phase 2 — Image wipe reveals from right edge leftward (300 – 1100 ms)
    at(300, () =>
      go(imageOuterRef.current,
        { clipPath: 'inset(0 0 0 0%)' },
        { duration: 0.80, ease: EASE }),
    );

    // Phase 3 — Nav enters (900 ms)
    at(900, () => window.dispatchEvent(new CustomEvent('sovereign:nav-reveal')));

    // Phase 4 — Eyebrow label (950 – 1300 ms)
    at(950, () => go(labelRef.current, { opacity: 1 }, { duration: 0.35, ease: 'easeOut' }));

    // Phase 5 — H1 line 1 mask-reveal (1100 – 1750 ms)
    at(1100, () =>
      go(line1Ref.current,
        { transform: 'translateY(0%)' },
        { duration: 0.65, ease: EASE }),
    );

    // Phase 6 — H1 line 2 mask-reveal (1500 – 2150 ms)
    at(1500, () =>
      go(line2Ref.current,
        { transform: 'translateY(0%)' },
        { duration: 0.65, ease: EASE }),
    );

    // Phase 7 — Subtext (1900 – 2350 ms)
    at(1900, () => go(subtextRef.current, { opacity: 1 }, { duration: 0.45, ease: 'easeOut' }));

    // Phase 8 — CTA (2150 – 2550 ms)
    at(2150, () => go(ctaRef.current, { opacity: 1 }, { duration: 0.40, ease: 'easeOut' }));

    // Mark played after sequence completes
    at(2700, () => sessionStorage.setItem(SESSION_KEY, '1'));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { glowRef, lightBeamRef, imageOuterRef, labelRef, line1Ref, line2Ref, subtextRef, ctaRef };
}
