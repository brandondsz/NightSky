import { describe, it, expect } from 'vitest';
import { validateStarShape } from '@/utils/validateStarShape';
import type { Point } from '@/types/star';

/** Generate a 5-pointed star centered at (cx, cy) with given outer/inner radii and numPoints tips. */
function generateStar(cx: number, cy: number, outerR: number, innerR: number, tips: number, samplesPerSegment = 5): Point[] {
  const points: Point[] = [];
  const totalVertices = tips * 2;
  for (let i = 0; i < totalVertices; i++) {
    const angle1 = (Math.PI * 2 * i) / totalVertices - Math.PI / 2;
    const angle2 = (Math.PI * 2 * (i + 1)) / totalVertices - Math.PI / 2;
    const r1 = i % 2 === 0 ? outerR : innerR;
    const r2 = (i + 1) % 2 === 0 ? outerR : innerR;
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const x = cx + (r1 * Math.cos(angle1)) * (1 - t) + (r2 * Math.cos(angle2)) * t;
      const y = cy + (r1 * Math.sin(angle1)) * (1 - t) + (r2 * Math.sin(angle2)) * t;
      points.push({ x, y });
    }
  }
  return points;
}

/** Generate a circle as evenly spaced points. */
function generateCircle(cx: number, cy: number, r: number, numPoints = 60): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return points;
}

/** Generate a straight line from (x1,y1) to (x2,y2). */
function generateLine(x1: number, y1: number, x2: number, y2: number, numPoints = 30): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return points;
}

/** Generate a cross / plus shape. */
function generateCross(cx: number, cy: number, size: number, samplesPerArm = 10): Point[] {
  const points: Point[] = [];
  // Draw 4 arms radiating from center
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
  ];
  for (const dir of directions) {
    // Out from center
    for (let i = 0; i < samplesPerArm; i++) {
      const t = i / (samplesPerArm - 1);
      points.push({ x: cx + dir.dx * size * t, y: cy + dir.dy * size * t });
    }
    // Back to center
    for (let i = samplesPerArm - 1; i >= 0; i--) {
      const t = i / (samplesPerArm - 1);
      points.push({ x: cx + dir.dx * size * t, y: cy + dir.dy * size * t });
    }
  }
  return points;
}

describe('validateStarShape', () => {
  it('accepts a 5-pointed star', () => {
    const star = generateStar(0.5, 0.5, 0.4, 0.15, 5);
    const result = validateStarShape(star);
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('accepts a 4-pointed star', () => {
    const star = generateStar(0.5, 0.5, 0.4, 0.15, 4);
    const result = validateStarShape(star);
    expect(result.valid).toBe(true);
  });

  it('accepts a 6-pointed star', () => {
    const star = generateStar(0.5, 0.5, 0.4, 0.18, 6);
    const result = validateStarShape(star);
    expect(result.valid).toBe(true);
  });

  it('accepts a cross / plus shape', () => {
    const cross = generateCross(0.5, 0.5, 0.3);
    const result = validateStarShape(cross);
    expect(result.valid).toBe(true);
  });

  it('rejects a circle', () => {
    const circle = generateCircle(0.5, 0.5, 0.3);
    const result = validateStarShape(circle);
    expect(result.valid).toBe(false);
  });

  it('rejects a straight line', () => {
    const line = generateLine(0.1, 0.5, 0.9, 0.5);
    const result = validateStarShape(line);
    expect(result.valid).toBe(false);
  });

  it('rejects too few points', () => {
    const points = [
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.6 },
    ];
    const result = validateStarShape(points);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('too small');
  });

  it('accepts a rough/jagged star-like shape', () => {
    // Simulate a rough hand-drawn star with noise
    const star = generateStar(0.5, 0.5, 0.35, 0.12, 5, 3);
    // Add some jitter
    const jittered = star.map((p) => ({
      x: p.x + (Math.random() - 0.5) * 0.02,
      y: p.y + (Math.random() - 0.5) * 0.02,
    }));
    const result = validateStarShape(jittered);
    expect(result.valid).toBe(true);
  });
});
