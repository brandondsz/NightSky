import type { Point } from '@/types/star';

interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Validate that a drawn path resembles a star-like shape using radial spike detection.
 *
 * Measures "spikiness" by analyzing the radial distance profile from the centroid:
 * 1. Compute centroid of all points
 * 2. Compute radial distance from centroid for each point
 * 3. Smooth the radial profile to ignore jitter
 * 4. Count peaks (local maxima) — the "tips" of the star
 * 5. Compute coefficient of variation (stddev / mean) — stars have high variance
 *
 * Pass criteria (lenient):
 * - At least 2 radial peaks
 * - Coefficient of variation > 0.15
 */
export function validateStarShape(points: Point[]): ValidationResult {
  if (points.length < 5) {
    return { valid: false, message: 'Draw a bigger star shape — that was too small.' };
  }

  // 1. Compute centroid
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= points.length;
  cy /= points.length;

  // 2. Compute radial distances
  const radii = points.map((p) => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));

  // 3. Smooth radial profile lightly to ignore jitter
  const smoothed = smoothProfile(radii, 3);

  // 4. Count peaks (local maxima) in smoothed profile
  const peaks = countPeaks(smoothed);

  // 5. Coefficient of variation
  const mean = smoothed.reduce((s, v) => s + v, 0) / smoothed.length;
  const variance = smoothed.reduce((s, v) => s + (v - mean) ** 2, 0) / smoothed.length;
  const stddev = Math.sqrt(variance);
  const cv = mean > 0 ? stddev / mean : 0;

  if (peaks < 2) {
    return { valid: false, message: 'Try drawing a pointy star shape with multiple tips.' };
  }

  if (cv < 0.15) {
    return { valid: false, message: 'Try drawing a pointy star shape with multiple tips.' };
  }

  return { valid: true, message: '' };
}

function smoothProfile(values: number[], window: number): number[] {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < values.length) {
        sum += values[j];
        count++;
      }
    }
    return sum / count;
  });
}

function countPeaks(values: number[]): number {
  let peaks = 0;
  for (let i = 1; i < values.length - 1; i++) {
    // Use >= on left to handle plateaus at peaks (duplicate tip points)
    if (values[i] >= values[i - 1] && values[i] > values[i + 1]) {
      peaks++;
    }
  }
  return peaks;
}
