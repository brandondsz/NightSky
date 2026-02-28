import type { Point } from '@/types/star';

/**
 * Perpendicular distance from point to line segment (start -> end).
 */
function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);
  }

  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));

  const projX = start.x + clampedT * dx;
  const projY = start.y + clampedT * dy;

  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

/**
 * Ramer-Douglas-Peucker path simplification algorithm.
 * Reduces point count while preserving visual shape.
 *
 * @param points - Array of points to simplify
 * @param tolerance - Maximum perpendicular distance tolerance (in same units as points)
 * @returns Simplified array of points
 */
export function simplifyPath(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPath(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [start, end];
}
