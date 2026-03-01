import { useRef, useEffect } from 'react';
import { useStarsContext } from '@/hooks/useStarsContext';
import { drawAllStars } from '@/utils/canvasRenderer';

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
  const rafRef = useRef(0);

  // Keep phase offsets in sync with star count (append new, trim old)
  useEffect(() => {
    const current = phasesRef.current;
    if (current.length < stars.length) {
      phasesRef.current = [...current, ...buildPhaseOffsets(stars.length - current.length)];
    } else if (current.length > stars.length) {
      phasesRef.current = current.slice(0, stars.length);
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
      const opacities = stars.map((_, i) => {
        // Oscillate between 0.15 and 1.0 with faster, varied speeds
        const phase = phases[i] ?? 0;
        const speed = 2.5 + Math.sin(phase) * 1.2;
        return 0.575 + 0.425 * Math.sin(t * speed + phase);
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
