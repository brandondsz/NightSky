import { describe, it, expect } from 'vitest';
import { normalizeShapeForPlacement, offsetShapeToPlacement } from '@/utils/normalizeShape';

describe('normalizeShapeForPlacement', () => {
  it('returns empty array for empty input', () => {
    expect(normalizeShapeForPlacement([])).toEqual([]);
  });

  it('centers shape around origin', () => {
    const points = [
      { x: 0.4, y: 0.4 },
      { x: 0.6, y: 0.4 },
      { x: 0.6, y: 0.6 },
      { x: 0.4, y: 0.6 },
    ];
    const result = normalizeShapeForPlacement(points);

    // Centroid should be at (0.5, 0.5), so the result should be centered around 0
    const cx = result.reduce((sum, p) => sum + p.x, 0) / result.length;
    const cy = result.reduce((sum, p) => sum + p.y, 0) / result.length;
    expect(cx).toBeCloseTo(0, 10);
    expect(cy).toBeCloseTo(0, 10);
  });

  it('scales shape to STAR_SKY_SCALE extent', () => {
    // A shape spanning 0.2 in each direction from centroid
    const points = [
      { x: 0.3, y: 0.3 },
      { x: 0.7, y: 0.3 },
      { x: 0.7, y: 0.7 },
      { x: 0.3, y: 0.7 },
    ];
    const result = normalizeShapeForPlacement(points);

    // Max extent from centroid is 0.2, scaled to 0.15
    // So each point should be at +/- 0.15
    for (const p of result) {
      expect(Math.abs(p.x)).toBeCloseTo(0.15, 5);
      expect(Math.abs(p.y)).toBeCloseTo(0.15, 5);
    }
  });

  it('handles a single point', () => {
    const result = normalizeShapeForPlacement([{ x: 0.5, y: 0.5 }]);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(0, 10);
    expect(result[0].y).toBeCloseTo(0, 10);
  });
});

describe('offsetShapeToPlacement', () => {
  it('offsets all points by placement position', () => {
    const shape = [
      { x: -0.1, y: -0.1 },
      { x: 0.1, y: -0.1 },
      { x: 0.1, y: 0.1 },
      { x: -0.1, y: 0.1 },
    ];
    const placement = { x: 0.5, y: 0.5 };
    const result = offsetShapeToPlacement(shape, placement);

    expect(result[0]).toEqual({ x: 0.4, y: 0.4 });
    expect(result[1]).toEqual({ x: 0.6, y: 0.4 });
    expect(result[2]).toEqual({ x: 0.6, y: 0.6 });
    expect(result[3]).toEqual({ x: 0.4, y: 0.6 });
  });

  it('returns empty array for empty shape', () => {
    expect(offsetShapeToPlacement([], { x: 0.5, y: 0.5 })).toEqual([]);
  });
});
