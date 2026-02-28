import { useRef, useEffect } from 'react';
import { useStarsContext } from '@/hooks/useStarsContext';
import { drawAllStars } from '@/utils/canvasRenderer';

export function StarLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stars } = useStarsContext();

  // Resize canvas to fill viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;

      // Redraw after resize
      const ctx = canvas!.getContext('2d');
      if (ctx) {
        drawAllStars(ctx, stars, canvas!.width, canvas!.height);
      }
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [stars]);

  // Redraw when stars change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawAllStars(ctx, stars, canvas.width, canvas.height);
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
