import type { Point } from './star';

export enum DrawingPhase {
  Idle = 'idle',
  Drawing = 'drawing',
  Submitting = 'submitting',
}

export interface DrawingState {
  phase: DrawingPhase;
  currentPath: Point[];
  error: string | null;
}
