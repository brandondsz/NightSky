import { useRef, useEffect, useCallback } from 'react';
import { useDrawing } from '@/hooks/useDrawing';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useSession } from '@/hooks/useSession';
import { useStarsContext } from '@/hooks/useStarsContext';
import { drawStroke } from '@/utils/canvasRenderer';
import { simplifyPath } from '@/utils/pathSimplify';
import { DrawingPhase } from '@/types/drawing';
import { SIMPLIFY_TOLERANCE, DEFAULT_STROKE_WIDTH } from '@/utils/constants';
import type { StarInsert } from '@/types/star';

interface DrawingLayerProps {
  color: string;
  onError: (msg: string) => void;
}

export function DrawingLayer({ color, onError }: DrawingLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionId = useSession();
  const { addStar } = useStarsContext();
  const { state, startDrawing, addPoint, finishDrawing, submitSuccess, submitError } = useDrawing();
  const { checkAndConsume } = useRateLimit();

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

  // Render in-progress stroke
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (state.phase === DrawingPhase.Drawing) {
      drawStroke(ctx, state.currentPath, color, DEFAULT_STROKE_WIDTH, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [state.currentPath, state.phase, color]);

  // Submit star when entering Submitting phase
  useEffect(() => {
    if (state.phase !== DrawingPhase.Submitting) return;

    const simplified = simplifyPath(state.currentPath, SIMPLIFY_TOLERANCE / Math.max(window.innerWidth, 1));

    const star: StarInsert = {
      path_data: simplified,
      color,
      stroke_width: DEFAULT_STROKE_WIDTH,
      session_id: sessionId,
    };

    addStar(star)
      .then(() => submitSuccess())
      .catch((err) => {
        const msg = err?.message ?? 'Failed to save star';
        submitError(msg);
        onError(msg);
      });
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (state.phase !== DrawingPhase.Idle) return;

    if (!checkAndConsume()) {
      onError('Please wait before drawing another star');
      return;
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startDrawing();
    addPoint({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, [state.phase, checkAndConsume, onError, startDrawing, addPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (state.phase !== DrawingPhase.Drawing) return;
    addPoint({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, [state.phase, addPoint]);

  const handlePointerUp = useCallback(() => {
    if (state.phase !== DrawingPhase.Drawing) return;
    finishDrawing();
  }, [state.phase, finishDrawing]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        cursor: 'crosshair',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
