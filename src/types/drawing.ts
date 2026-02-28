import type { Point } from './star';

export enum DrawingPhase {
  Idle = 'idle',
  Drawing = 'drawing',
  Placing = 'placing',
  Submitting = 'submitting',
}

export interface DrawingState {
  phase: DrawingPhase;
  currentPath: Point[];
  pendingShape: Point[];
  placementPoint: Point | null;
  error: string | null;
}
