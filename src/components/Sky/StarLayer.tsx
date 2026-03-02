import { useRef, useEffect } from 'react';
import { useStarsContext } from '@/hooks/useStarsContext';
import { drawAllStars } from '@/utils/canvasRenderer';

const FADE_IN_DURATION = 1; // seconds

/** Each star gets a random phase offset so they don't all pulse in sync. */
function buildPhaseOffsets(count: number): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < count; i++) {
    offsets.push(Math.random() * Math.PI * 2);
  }
  return offsets;
}

export function StarLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stars } = useStarsContext();
  const phasesRef = useRef<number[]>([]);
  const birthTimesRef = useRef<number[]>([]);
  const rafRef = useRef(0);

  // Keep phase offsets and birth times in sync with star count
  useEffect(() => {
    const currentPhases = phasesRef.current;
    const currentBirths = birthTimesRef.current;
    const now = performance.now() / 1000;

    if (currentPhases.length < stars.length) {
      const newCount = stars.length - currentPhases.length;
      phasesRef.current = [...currentPhases, ...buildPhaseOffsets(newCount)];
      // On initial load (no existing phases), set birthTime=0 (instant, no fade)
      // On realtime insert, set birthTime to now
      const birthTime = currentPhases.length === 0 ? 0 : now;
      const newBirths = new Array(newCount).fill(birthTime);
      birthTimesRef.current = [...currentBirths, ...newBirths];
    } else if (currentPhases.length > stars.length) {
      phasesRef.current = currentPhases.slice(0, stars.length);
      birthTimesRef.current = currentBirths.slice(0, stars.length);
    }
  }, [stars.length]);

  // Resize canvas to fill viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Twinkle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function animate(time: number) {
      const t = time / 1000; // seconds
      const phases = phasesRef.current;
      const births = birthTimesRef.current;
      const opacities = stars.map((_, i) => {
        // Oscillate between 0.15 and 1.0 with faster, varied speeds
        const phase = phases[i] ?? 0;
        const speed = 2.5 + Math.sin(phase) * 1.2;
        const twinkle = 0.575 + 0.425 * Math.sin(t * speed + phase);
        // Fade-in: birthTime=0 means instant (age is huge), otherwise fade over FADE_IN_DURATION
        const birthTime = births[i] ?? 0;
        const age = birthTime === 0 ? FADE_IN_DURATION : t - birthTime;
        const fadeIn = Math.min(1, Math.max(0, age / FADE_IN_DURATION));
        return twinkle * fadeIn;
      });
      drawAllStars(ctx!, stars, canvas!.width, canvas!.height, opacities);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  );
}
