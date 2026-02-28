import { useRef, useCallback, useEffect } from 'react';
import { drawStroke } from '@/utils/canvasRenderer';
import { simplifyPath } from '@/utils/pathSimplify';
import { normalizeShapeForPlacement } from '@/utils/normalizeShape';
import { MODAL_CANVAS_SIZE, SIMPLIFY_TOLERANCE, MIN_POINTS, DEFAULT_STROKE_WIDTH } from '@/utils/constants';
import type { Point } from '@/types/star';

const COLORS = ['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

interface DrawingModalProps {
  color: string;
  onColorChange: (color: string) => void;
  onConfirm: (shape: Point[]) => void;
  onCancel: () => void;
}

export function DrawingModal({ color, onColorChange, onConfirm, onCancel }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawStroke(ctx, pointsRef.current, color, DEFAULT_STROKE_WIDTH, MODAL_CANVAS_SIZE, MODAL_CANVAS_SIZE);
  }, [color]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    pointsRef.current = [];
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    pointsRef.current.push({ x, y });
    redraw();
  }, [redraw]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    pointsRef.current.push({ x, y });
    redraw();
  }, [redraw]);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const handleConfirm = useCallback(() => {
    const points = pointsRef.current;
    if (points.length < MIN_POINTS) return;
    const tolerance = SIMPLIFY_TOLERANCE / MODAL_CANVAS_SIZE;
    const simplified = simplifyPath(points, tolerance);
    const normalized = normalizeShapeForPlacement(simplified);
    onConfirm(normalized);
  }, [onConfirm]);

  // Handle Escape key to cancel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Draw your star</h3>
        <div className="modal-color-picker">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`color-swatch ${c === color ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onColorChange(c)}
              aria-label={`Select color ${c}`}
              title={c}
            />
          ))}
        </div>
        <canvas
          ref={canvasRef}
          width={MODAL_CANVAS_SIZE}
          height={MODAL_CANVAS_SIZE}
          className="modal-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        <div className="modal-buttons">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
