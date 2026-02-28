import { describe, it, expect } from 'vitest';
import { drawingReducer, initialState } from '@/hooks/useDrawing';
import { DrawingPhase } from '@/types/drawing';
import type { DrawingAction } from '@/hooks/useDrawing';

describe('drawingReducer', () => {
  it('starts in Idle phase', () => {
    expect(initialState.phase).toBe(DrawingPhase.Idle);
    expect(initialState.currentPath).toEqual([]);
    expect(initialState.error).toBeNull();
  });

  it('transitions Idle -> Drawing on START', () => {
    const state = drawingReducer(initialState, { type: 'START' });
    expect(state.phase).toBe(DrawingPhase.Drawing);
    expect(state.currentPath).toEqual([]);
  });

  it('ignores START when not Idle', () => {
    const drawing = { ...initialState, phase: DrawingPhase.Drawing };
    const state = drawingReducer(drawing, { type: 'START' });
    expect(state.phase).toBe(DrawingPhase.Drawing);
  });

  it('adds points during Drawing phase', () => {
    const drawing = { ...initialState, phase: DrawingPhase.Drawing };
    const state = drawingReducer(drawing, { type: 'ADD_POINT', point: { x: 0.5, y: 0.5 } });
    expect(state.currentPath).toHaveLength(1);
    expect(state.currentPath[0]).toEqual({ x: 0.5, y: 0.5 });
  });

  it('ignores ADD_POINT when not Drawing', () => {
    const state = drawingReducer(initialState, { type: 'ADD_POINT', point: { x: 0.5, y: 0.5 } });
    expect(state.currentPath).toHaveLength(0);
  });

  it('transitions Drawing -> Submitting on FINISH with enough points', () => {
    const drawing = {
      ...initialState,
      phase: DrawingPhase.Drawing as const,
      currentPath: [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.1 },
        { x: 0.2, y: 0.2 },
        { x: 0.3, y: 0.3 },
        { x: 0.4, y: 0.4 },
      ],
    };
    const state = drawingReducer(drawing, { type: 'FINISH' });
    expect(state.phase).toBe(DrawingPhase.Submitting);
  });

  it('resets to Idle on FINISH with too few points', () => {
    const drawing = {
      ...initialState,
      phase: DrawingPhase.Drawing as const,
      currentPath: [{ x: 0, y: 0 }, { x: 0.1, y: 0.1 }],
    };
    const state = drawingReducer(drawing, { type: 'FINISH' });
    expect(state.phase).toBe(DrawingPhase.Idle);
    expect(state.currentPath).toEqual([]);
  });

  it('resets on SUBMIT_SUCCESS', () => {
    const submitting = {
      ...initialState,
      phase: DrawingPhase.Submitting as const,
      currentPath: [{ x: 0, y: 0 }],
    };
    const state = drawingReducer(submitting, { type: 'SUBMIT_SUCCESS' });
    expect(state).toEqual(initialState);
  });

  it('resets with error on SUBMIT_ERROR', () => {
    const submitting = { ...initialState, phase: DrawingPhase.Submitting as const };
    const state = drawingReducer(submitting, { type: 'SUBMIT_ERROR', error: 'Rate limit' });
    expect(state.phase).toBe(DrawingPhase.Idle);
    expect(state.error).toBe('Rate limit');
  });

  it('resets on RESET', () => {
    const state = drawingReducer(
      { phase: DrawingPhase.Drawing, currentPath: [{ x: 0, y: 0 }], error: 'old' } as DrawingAction extends never ? never : { phase: DrawingPhase; currentPath: { x: number; y: number }[]; error: string },
      { type: 'RESET' },
    );
    expect(state).toEqual(initialState);
  });
});
