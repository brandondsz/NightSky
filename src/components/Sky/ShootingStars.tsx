import { useRef, useEffect } from 'react';

interface ShootingStar {
  startX: number;
  startY: number;
  angle: number;
  speed: number;
  length: number;
  birthTime: number;
  duration: number;
}

const STREAK_DURATION = 0.8; // seconds
const MIN_INTERVAL = 5000; // ms
const MAX_INTERVAL = 10000; // ms

function spawnStar(time: number): ShootingStar {
  return {
    startX: 0.1 + Math.random() * 0.8,
    startY: Math.random() * 0.3,
    angle: Math.PI / 6 + Math.random() * (Math.PI / 4), // 30-75 degrees
    speed: 0.8 + Math.random() * 0.4,
    length: 0.08 + Math.random() * 0.06,
    birthTime: time,
    duration: STREAK_DURATION,
  };
}

export function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef<ShootingStar[]>([]);
  const nextSpawnRef = useRef(performance.now() + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL));

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

    function animate(time: number) {
      const t = time / 1000;
      const w = canvas!.width;
      const h = canvas!.height;

      // Spawn new shooting star if it's time
      if (time >= nextSpawnRef.current) {
        activeRef.current.push(spawnStar(t));
        nextSpawnRef.current = time + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      }

      ctx!.clearRect(0, 0, w, h);

      // Draw and cull active shooting stars
      const alive: ShootingStar[] = [];
      for (const star of activeRef.current) {
        const age = t - star.birthTime;
        const progress = age / star.duration;
        if (progress > 1) continue;

        alive.push(star);

        // Quadratic fade-out
        const fade = 1 - progress * progress;
        const travel = progress * star.speed;

        const headX = (star.startX + Math.cos(star.angle) * travel) * w;
        const headY = (star.startY + Math.sin(star.angle) * travel) * h;
        const tailX = (star.startX + Math.cos(star.angle) * Math.max(0, travel - star.length)) * w;
        const tailY = (star.startY + Math.sin(star.angle) * Math.max(0, travel - star.length)) * h;

        // Gradient trail
        const gradient = ctx!.createLinearGradient(tailX, tailY, headX, headY);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${fade})`);

        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(headX, headY);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 2;
        ctx!.lineCap = 'round';
        ctx!.stroke();

        // Glow head
        ctx!.save();
        ctx!.shadowColor = '#ffffff';
        ctx!.shadowBlur = 8;
        ctx!.beginPath();
        ctx!.arc(headX, headY, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx!.fill();
        ctx!.restore();
      }

      activeRef.current = alive;
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
        zIndex: 3,
        pointerEvents: 'none',
      }}
    />
  );
}
