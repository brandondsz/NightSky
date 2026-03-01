import type { Point, Star } from '@/types/star';

/**
 * Draw a single star path on a canvas context.
 * Points are in fractional viewport coords (0-1), scaled by canvas dimensions.
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  pathData: Point[],
  color: string,
  strokeWidth: number,
  width: number,
  height: number,
  opacity = 1,
): void {
  if (pathData.length < 2) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const first = pathData[0];
  ctx.moveTo(first.x * width, first.y * height);

  for (let i = 1; i < pathData.length; i++) {
    ctx.lineTo(pathData[i].x * width, pathData[i].y * height);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Clear canvas and draw all stars with per-star opacity for twinkle effect.
 */
export function drawAllStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  width: number,
  height: number,
  opacities?: number[],
): void {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    const opacity = opacities ? opacities[i] : 1;
    drawStar(ctx, star.path_data, star.color, star.stroke_width, width, height, opacity);
  }
}

/**
 * Draw an in-progress stroke (pixel coordinates, no fractional conversion).
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  strokeWidth: number,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);

  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const first = points[0];
  ctx.moveTo(first.x * width, first.y * height);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * width, points[i].y * height);
  }

  ctx.stroke();
}
