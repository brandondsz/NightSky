import { useReducer, useCallback } from 'react';
import { DrawingPhase } from '@/types/drawing';
import type { DrawingState } from '@/types/drawing';
import type { Point } from '@/types/star';
import { MIN_POINTS } from '@/utils/constants';

type DrawingAction =
  | { type: 'START' }
  | { type: 'ADD_POINT'; point: Point }
  | { type: 'FINISH' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

const initialState: DrawingState = {
  phase: DrawingPhase.Idle,
  currentPath: [],
  error: null,
};

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'START':
      if (state.phase !== DrawingPhase.Idle) return state;
      return { ...state, phase: DrawingPhase.Drawing, currentPath: [], error: null };

    case 'ADD_POINT':
      if (state.phase !== DrawingPhase.Drawing) return state;
      return { ...state, currentPath: [...state.currentPath, action.point] };

    case 'FINISH':
      if (state.phase !== DrawingPhase.Drawing) return state;
      if (state.currentPath.length < MIN_POINTS) {
        return { ...initialState };
      }
      return { ...state, phase: DrawingPhase.Submitting };

    case 'SUBMIT_START':
      return { ...state, phase: DrawingPhase.Submitting };

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
  const finishDrawing = useCallback(() => dispatch({ type: 'FINISH' }), []);
  const submitStart = useCallback(() => dispatch({ type: 'SUBMIT_START' }), []);
  const submitSuccess = useCallback(() => dispatch({ type: 'SUBMIT_SUCCESS' }), []);
  const submitError = useCallback((error: string) => dispatch({ type: 'SUBMIT_ERROR', error }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    startDrawing,
    addPoint,
    finishDrawing,
    submitStart,
    submitSuccess,
    submitError,
    reset,
  };
}

// Export for testing
export { drawingReducer, initialState };
export type { DrawingAction };
