import type { Point } from '@/types/star';
import { STAR_SKY_SCALE } from './constants';

/**
 * Center-normalize a shape drawn in the modal canvas.
 * Input points are fractions of modal size (0-1).
 * Output points are centered around origin and scaled by STAR_SKY_SCALE.
 */
export function normalizeShapeForPlacement(points: Point[]): Point[] {
  if (points.length === 0) return [];

  // Compute centroid
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= points.length;
  cy /= points.length;

  // Find the max extent from the centroid to determine bounding scale
  let maxExtent = 0;
  for (const p of points) {
    const dx = Math.abs(p.x - cx);
    const dy = Math.abs(p.y - cy);
    maxExtent = Math.max(maxExtent, dx, dy);
  }

  // Avoid division by zero for single-point shapes
  const scale = maxExtent > 0 ? STAR_SKY_SCALE / maxExtent : STAR_SKY_SCALE;

  return points.map((p) => ({
    x: (p.x - cx) * scale,
    y: (p.y - cy) * scale,
  }));
}

/**
 * Offset a normalized (centered) shape to a placement point on the sky.
 * Both the shape points and placement point are in fractional viewport coords.
 */
export function offsetShapeToPlacement(shape: Point[], placement: Point): Point[] {
  return shape.map((p) => ({
    x: p.x + placement.x,
    y: p.y + placement.y,
  }));
}
