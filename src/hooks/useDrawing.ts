import { useReducer, useCallback } from 'react';
import { DrawingPhase } from '@/types/drawing';
import type { DrawingState } from '@/types/drawing';
import type { Point } from '@/types/star';

type DrawingAction =
  | { type: 'START' }
  | { type: 'ADD_POINT'; point: Point }
  | { type: 'CONFIRM_SHAPE'; shape: Point[] }
  | { type: 'CANCEL' }
  | { type: 'PLACE'; point: Point }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

const initialState: DrawingState = {
  phase: DrawingPhase.Idle,
  currentPath: [],
  pendingShape: [],
  placementPoint: null,
  error: null,
};

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'START':
      if (state.phase !== DrawingPhase.Idle) return state;
      return { ...state, phase: DrawingPhase.Drawing, currentPath: [], pendingShape: [], placementPoint: null, error: null };

    case 'ADD_POINT':
      if (state.phase !== DrawingPhase.Drawing) return state;
      return { ...state, currentPath: [...state.currentPath, action.point] };

    case 'CONFIRM_SHAPE':
      if (state.phase !== DrawingPhase.Drawing) return state;
      return { ...state, phase: DrawingPhase.Placing, currentPath: [], pendingShape: action.shape };

    case 'CANCEL':
      return { ...initialState };

    case 'PLACE':
      if (state.phase !== DrawingPhase.Placing) return state;
      return { ...state, phase: DrawingPhase.Submitting, placementPoint: action.point };

    case 'SUBMIT_SUCCESS':
      return { ...initialState };

    case 'SUBMIT_ERROR':
      return { ...initialState, error: action.error };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export function useDrawing() {
  const [state, dispatch] = useReducer(drawingReducer, initialState);

  const startDrawing = useCallback(() => dispatch({ type: 'START' }), []);
  const addPoint = useCallback((point: Point) => dispatch({ type: 'ADD_POINT', point }), []);
  const confirmShape = useCallback((shape: Point[]) => dispatch({ type: 'CONFIRM_SHAPE', shape }), []);
  const cancel = useCallback(() => dispatch({ type: 'CANCEL' }), []);
  const place = useCallback((point: Point) => dispatch({ type: 'PLACE', point }), []);
  const submitSuccess = useCallback(() => dispatch({ type: 'SUBMIT_SUCCESS' }), []);
  const submitError = useCallback((error: string) => dispatch({ type: 'SUBMIT_ERROR', error }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    startDrawing,
    addPoint,
    confirmShape,
    cancel,
    place,
    submitSuccess,
    submitError,
    reset,
  };
}

// Export for testing
export { drawingReducer, initialState };
export type { DrawingAction };
