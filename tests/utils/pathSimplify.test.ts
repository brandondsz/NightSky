import { describe, it, expect } from 'vitest';
import { simplifyPath } from '@/utils/pathSimplify';
import type { Point } from '@/types/star';

describe('simplifyPath', () => {
  it('returns same array when 2 or fewer points', () => {
    const single: Point[] = [{ x: 0, y: 0 }];
    expect(simplifyPath(single, 1)).toEqual(single);

    const pair: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    expect(simplifyPath(pair, 1)).toEqual(pair);
  });

  it('returns empty array for empty input', () => {
    expect(simplifyPath([], 1)).toEqual([]);
  });

  it('removes collinear points', () => {
    const collinear: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ];
    const result = simplifyPath(collinear, 0.1);
    expect(result).toEqual([{ x: 0, y: 0 }, { x: 4, y: 4 }]);
  });

  it('preserves corners of a square', () => {
    const square: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
    ];
    const result = simplifyPath(square, 0.5);
    // Should preserve all corner points since they deviate significantly
    expect(result.length).toBeGreaterThanOrEqual(4);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[result.length - 1]).toEqual({ x: 0, y: 0 });
  });

  it('reduces point count on noisy line', () => {
    const noisy: Point[] = [];
    for (let i = 0; i < 100; i++) {
      noisy.push({ x: i, y: i + Math.sin(i * 0.1) * 0.01 });
    }
    const result = simplifyPath(noisy, 0.5);
    expect(result.length).toBeLessThan(noisy.length);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('preserves all points when tolerance is 0', () => {
    const zigzag: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 5 },
      { x: 2, y: 0 },
      { x: 3, y: 5 },
    ];
    const result = simplifyPath(zigzag, 0);
    expect(result).toEqual(zigzag);
  });
});
