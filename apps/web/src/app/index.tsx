'use client';

import React, { useEffect, useRef } from 'react';
import Lottie from 'react-lottie-player';
import flipJson from '../../assets/lottie/FlipRotationGroup.lottie.json';
import haloJson from '../../assets/lottie/HaloBeam.lottie.json';
import styles from './hero.module.css';

/**
 * Hero
 * Sequence: CSS table fade -> hole deepen -> flip Lottie -> halo Lottie -> reveal copy/logo
 *
 * Accessibility:
 * - respects prefers-reduced-motion (CSS handles fallback)
 * - semantic headings and aria-labels included
 */
export default function Hero(): JSX.Element {
  const flipRef = useRef<any>(null);
  const haloRef = useRef<any>(null);

  useEffect(() => {
    // Sequence control: start flip after CSS animations complete
    const startDelay = 1600; // tableFade (900) + holeDeepen (700) + small buffer
    const startFlip = () => {
      try {
        flipRef.current?.play();
      } catch (e) {
        // no-op
      }
    };

    const onFlipComplete = () => {
      try {
        haloRef.current?.play();
        // add class to reveal headline/logo (CSS handles transitions)
        document.body.classList.add('sov-hero-halo');
      } catch (e) {
        // no-op
      }
    };

    // react-lottie-player exposes `setPlayerEvent` on the ref instance
    // guard in case the ref isn't ready immediately
    const attachFlipListener = () => {
      try {
        if (flipRef.current && typeof flipRef.current.setPlayerEvent === 'function') {
          flipRef.current.setPlayerEvent('complete', onFlipComplete);
          return true;
        }
      } catch (e) {}
      return false;
    };

    const tryAttach = () => {
      if (!attachFlipListener()) {
        // retry a couple times while component mounts
        const t = setTimeout(tryAttach, 120);
        return () => clearTimeout(t);
      }
    };
    tryAttach();

    const t = setTimeout(startFlip, startDelay);
    return () => {
      clearTimeout(t);
      try {
        flipRef.current?.stop();
        haloRef.current?.stop();
      } catch (e) {}
    };
  }, []);

  return (
    <section className={styles.hero} aria-label="Sovereign entry">
      <div className={styles.centeredFrame} aria-hidden="true">
        {/* Inline SVG can be replaced at build time with the exported circleFrame.svg */}
        <svg className={styles.circleSvg} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <mask id="holeMask">
              <rect x="0" y="0" width="200" height="200" fill="white" />
              <circle cx="100" cy="100" r="38" fill="black" />
            </mask>
          </defs>
          <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="1" mask="url(#holeMask)" />
        </svg>

        <div className={styles.holeDepth} aria-hidden="true" />
      </div>

      <div id="flipContainer" className={styles.lottieContainer} aria-hidden="true">
        <Lottie
          ref={flipRef}
          loop={false}
          animationData={flipJson}
          play={false}
          renderer="svg"
          style={{ width: '100%', height: '100%', maxWidth: 800, maxHeight: 800 }}
        />
      </div>

      <div id="haloContainer" className={styles.lottieContainer} aria-hidden="true">
        <Lottie
          ref={haloRef}
          loop={false}
          animationData={haloJson}
          play={false}
          renderer="svg"
          style={{ width: '100%', height: '100%', maxWidth: 800, maxHeight: 800 }}
        />
      </div>

      <div className={styles.copyBottomLeft} aria-hidden="true">
        <h6 className={styles.caption}>The Meeting</h6>
        <p className={styles.sub}>The moment you begin to see yourself from above.</p>
      </div>

      <div className={styles.centerHeadline} aria-hidden="true">
        <h1 className={styles.heroTitle} id="sov-hero-title">Where you put your focus is where you go.</h1>
      </div>

      <div className={styles.logoWrap} aria-hidden="true">
        <img src="/assets/svg/wordmark.svg" alt="Sovereign OS" />
      </div>
    </section>
  );
}