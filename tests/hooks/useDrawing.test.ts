import { describe, it, expect } from 'vitest';
import { drawingReducer, initialState } from '@/hooks/useDrawing';
import { DrawingPhase } from '@/types/drawing';

describe('drawingReducer', () => {
  it('starts in Idle phase with empty pendingShape and null placementPoint', () => {
    expect(initialState.phase).toBe(DrawingPhase.Idle);
    expect(initialState.currentPath).toEqual([]);
    expect(initialState.pendingShape).toEqual([]);
    expect(initialState.placementPoint).toBeNull();
    expect(initialState.error).toBeNull();
  });

  it('transitions Idle -> Drawing on START', () => {
    const state = drawingReducer(initialState, { type: 'START' });
    expect(state.phase).toBe(DrawingPhase.Drawing);
    expect(state.currentPath).toEqual([]);
    expect(state.pendingShape).toEqual([]);
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

  it('transitions Drawing -> Placing on CONFIRM_SHAPE', () => {
    const drawing = { ...initialState, phase: DrawingPhase.Drawing };
    const shape = [{ x: 0, y: 0 }, { x: 0.1, y: 0.1 }];
    const state = drawingReducer(drawing, { type: 'CONFIRM_SHAPE', shape });
    expect(state.phase).toBe(DrawingPhase.Placing);
    expect(state.pendingShape).toEqual(shape);
    expect(state.currentPath).toEqual([]);
  });

  it('ignores CONFIRM_SHAPE when not Drawing', () => {
    const shape = [{ x: 0, y: 0 }];
    const state = drawingReducer(initialState, { type: 'CONFIRM_SHAPE', shape });
    expect(state.phase).toBe(DrawingPhase.Idle);
  });

  it('transitions Placing -> Submitting on PLACE', () => {
    const placing = { ...initialState, phase: DrawingPhase.Placing, pendingShape: [{ x: 0, y: 0 }] };
    const point = { x: 0.5, y: 0.5 };
    const state = drawingReducer(placing, { type: 'PLACE', point });
    expect(state.phase).toBe(DrawingPhase.Submitting);
    expect(state.placementPoint).toEqual(point);
  });

  it('ignores PLACE when not Placing', () => {
    const state = drawingReducer(initialState, { type: 'PLACE', point: { x: 0.5, y: 0.5 } });
    expect(state.phase).toBe(DrawingPhase.Idle);
  });

  it('resets to Idle on CANCEL from any phase', () => {
    const drawing = { ...initialState, phase: DrawingPhase.Drawing, currentPath: [{ x: 0, y: 0 }] };
    expect(drawingReducer(drawing, { type: 'CANCEL' })).toEqual(initialState);

    const placing = { ...initialState, phase: DrawingPhase.Placing, pendingShape: [{ x: 0, y: 0 }] };
    expect(drawingReducer(placing, { type: 'CANCEL' })).toEqual(initialState);
  });

  it('resets on SUBMIT_SUCCESS', () => {
    const submitting = {
      ...initialState,
      phase: DrawingPhase.Submitting,
      pendingShape: [{ x: 0, y: 0 }],
      placementPoint: { x: 0.5, y: 0.5 },
    };
    const state = drawingReducer(submitting, { type: 'SUBMIT_SUCCESS' });
    expect(state).toEqual(initialState);
  });

  it('resets with error on SUBMIT_ERROR', () => {
    const submitting = { ...initialState, phase: DrawingPhase.Submitting };
    const state = drawingReducer(submitting, { type: 'SUBMIT_ERROR', error: 'Rate limit' });
    expect(state.phase).toBe(DrawingPhase.Idle);
    expect(state.error).toBe('Rate limit');
  });

  it('resets on RESET', () => {
    const placing = { ...initialState, phase: DrawingPhase.Placing, pendingShape: [{ x: 0, y: 0 }] };
    const state = drawingReducer(placing, { type: 'RESET' });
    expect(state).toEqual(initialState);
  });
});
