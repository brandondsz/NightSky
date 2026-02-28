import { useRef, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { useStarsContext } from '@/hooks/useStarsContext';
import { drawStar } from '@/utils/canvasRenderer';
import { offsetShapeToPlacement } from '@/utils/normalizeShape';
import { DrawingPhase } from '@/types/drawing';
import { DEFAULT_STROKE_WIDTH } from '@/utils/constants';
import type { DrawingState } from '@/types/drawing';
import type { Point, StarInsert } from '@/types/star';

interface DrawingLayerProps {
  color: string;
  drawing: DrawingState;
  onPlace: (point: Point) => void;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  onSubmitError: (error: string) => void;
  onError: (msg: string) => void;
}

export function DrawingLayer({ color, drawing, onPlace, onCancel, onSubmitSuccess, onSubmitError, onError }: DrawingLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const sessionId = useSession();
  const { addStar } = useStarsContext();

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

  // Placing phase: render shape preview following cursor
  useEffect(() => {
    if (drawing.phase !== DrawingPhase.Placing) {
      // Clear canvas when not placing
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    function renderPreview() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const placed = offsetShapeToPlacement(drawing.pendingShape, mouseRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStar(ctx, placed, color, DEFAULT_STROKE_WIDTH, canvas.width, canvas.height);
      rafRef.current = requestAnimationFrame(renderPreview);
    }

    rafRef.current = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawing.phase, drawing.pendingShape, color]);

  // Submit star when entering Submitting phase
  useEffect(() => {
    if (drawing.phase !== DrawingPhase.Submitting || !drawing.placementPoint) return;

    const placed = offsetShapeToPlacement(drawing.pendingShape, drawing.placementPoint);

    const star: StarInsert = {
      path_data: placed,
      color,
      stroke_width: DEFAULT_STROKE_WIDTH,
      session_id: sessionId,
    };

    addStar(star)
      .then(() => onSubmitSuccess())
      .catch((err) => {
        const msg = err?.message ?? 'Failed to save star';
        onSubmitError(msg);
        onError(msg);
      });
  }, [drawing.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Escape key during placing phase
  useEffect(() => {
    if (drawing.phase !== DrawingPhase.Placing) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawing.phase, onCancel]);

  const handleMouseMove = useCallback((e: React.PointerEvent) => {
    mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (drawing.phase !== DrawingPhase.Placing) return;
    const point = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    onPlace(point);
  }, [drawing.phase, onPlace]);

  const isPlacing = drawing.phase === DrawingPhase.Placing;

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
        cursor: isPlacing ? 'crosshair' : 'default',
        touchAction: 'none',
        pointerEvents: isPlacing ? 'auto' : 'none',
      }}
      onPointerMove={handleMouseMove}
      onClick={handleClick}
    />
  );
}
