import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawStar, drawAllStars, drawStroke } from '@/utils/canvasRenderer';
import type { Star, Point } from '@/types/star';

function createMockContext() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    globalAlpha: 1,
    strokeStyle: '',
    lineWidth: 0,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    shadowColor: '',
    shadowBlur: 0,
  } as unknown as CanvasRenderingContext2D;
}

describe('drawStar', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('does nothing with fewer than 2 points', () => {
    drawStar(ctx, [{ x: 0.5, y: 0.5 }], '#fff', 2, 800, 600);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('draws a path with correct scaled coordinates', () => {
    const path: Point[] = [
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 1 },
    ];
    drawStar(ctx, path, '#FF0000', 3, 800, 600);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(400, 300);
    expect(ctx.lineTo).toHaveBeenCalledWith(800, 600);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('#FF0000');
    expect(ctx.lineWidth).toBe(3);
  });

  it('applies glow effect by default', () => {
    const path: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    drawStar(ctx, path, '#FFD700', 2, 800, 600);
    expect(ctx.shadowColor).toBe('#FFD700');
    expect(ctx.shadowBlur).toBe(12);
  });

  it('skips glow when glow=false', () => {
    const path: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    drawStar(ctx, path, '#FFD700', 2, 800, 600, 1, false);
    expect(ctx.shadowColor).toBe('');
    expect(ctx.shadowBlur).toBe(0);
  });
});

describe('drawAllStars', () => {
  it('clears canvas and draws each star', () => {
    const ctx = createMockContext();
    const stars: Star[] = [
      {
        id: '1',
        path_data: [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }],
        color: '#FFF',
        stroke_width: 2,
        session_id: 'a',
        created_at: '',
      },
      {
        id: '2',
        path_data: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }],
        color: '#F00',
        stroke_width: 3,
        session_id: 'b',
        created_at: '',
      },
    ];

    drawAllStars(ctx, stars, 1000, 800);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 1000, 800);
    expect(ctx.beginPath).toHaveBeenCalledTimes(2);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });
});

describe('drawStroke', () => {
  it('clears canvas and draws in-progress path', () => {
    const ctx = createMockContext();
    const points: Point[] = [
      { x: 0.1, y: 0.2 },
      { x: 0.3, y: 0.4 },
      { x: 0.5, y: 0.6 },
    ];

    drawStroke(ctx, points, '#00FF00', 2, 800, 600);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.moveTo).toHaveBeenCalledWith(80, 120);
    expect(ctx.lineTo).toHaveBeenCalledWith(240, 240);
    expect(ctx.lineTo).toHaveBeenCalledWith(400, 360);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('only clears when fewer than 2 points', () => {
    const ctx = createMockContext();
    drawStroke(ctx, [{ x: 0.5, y: 0.5 }], '#FFF', 2, 800, 600);

    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});
