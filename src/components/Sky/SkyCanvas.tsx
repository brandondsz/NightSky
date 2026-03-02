import { useRef, useCallback } from 'react';
import { BackgroundStars } from './BackgroundStars';
import { StarLayer } from './StarLayer';
import { ShootingStars } from './ShootingStars';
import { DrawingLayer } from './DrawingLayer';
import type { DrawingState } from '@/types/drawing';
import type { Point } from '@/types/star';

interface SkyCanvasProps {
  color: string;
  drawing: DrawingState;
  onPlace: (point: Point) => void;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  onSubmitError: (error: string) => void;
  onError: (msg: string) => void;
}

const BG_PARALLAX_MAX = 8; // px
const STAR_PARALLAX_MAX = 4; // px

export function SkyCanvas({ color, drawing, onPlace, onCancel, onSubmitSuccess, onSubmitError, onError }: SkyCanvasProps) {
  const bgParallaxRef = useRef<HTMLDivElement>(null);
  const starParallaxRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;  // -1 to 1
    const ny = (e.clientY / window.innerHeight) * 2 - 1;

    if (bgParallaxRef.current) {
      bgParallaxRef.current.style.transform = `translate(${nx * BG_PARALLAX_MAX}px, ${ny * BG_PARALLAX_MAX}px)`;
    }
    if (starParallaxRef.current) {
      starParallaxRef.current.style.transform = `translate(${nx * STAR_PARALLAX_MAX}px, ${ny * STAR_PARALLAX_MAX}px)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (bgParallaxRef.current) {
      bgParallaxRef.current.style.transform = 'translate(0px, 0px)';
    }
    if (starParallaxRef.current) {
      starParallaxRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, []);

  return (
    <div
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={bgParallaxRef}
        style={{
          position: 'absolute',
          inset: `-${BG_PARALLAX_MAX}px`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <BackgroundStars />
      </div>
      <div
        ref={starParallaxRef}
        style={{
          position: 'absolute',
          inset: `-${STAR_PARALLAX_MAX}px`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <StarLayer />
      </div>
      <ShootingStars />
      <DrawingLayer
        color={color}
        drawing={drawing}
        onPlace={onPlace}
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitError={onSubmitError}
        onError={onError}
      />
    </div>
  );
}
