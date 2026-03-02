import { useRef, useEffect } from 'react';

interface BgStar {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinkleSpeed: number;
  phase: number;
  twinkles: boolean;
}

const STAR_COUNT = 200;

function generateStars(): BgStar[] {
  const stars: BgStar[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      radius: 0.5 + Math.random() * 1,
      baseOpacity: 0.2 + Math.random() * 0.4,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      twinkles: Math.random() < 0.3,
    });
  }
  return stars;
}

export function BackgroundStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<BgStar[]>(generateStars());
  const rafRef = useRef(0);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars = starsRef.current;

    function animate(time: number) {
      const t = time / 1000;
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        let opacity = s.baseOpacity;
        if (s.twinkles) {
          opacity *= 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
        }

        ctx!.beginPath();
        ctx!.arc(s.x * w, s.y * h, s.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
