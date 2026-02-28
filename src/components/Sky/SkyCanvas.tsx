import { StarLayer } from './StarLayer';
import { DrawingLayer } from './DrawingLayer';
import type { DrawingState } from '@/types/drawing';
import type { Point } from '@/types/star';

interface SkyCanvasProps {
  color: string;
  drawing: DrawingState;
  onPlace: (point: Point) => void;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  onSubmitError: (error: string) => void;
  onError: (msg: string) => void;
}

export function SkyCanvas({ color, drawing, onPlace, onCancel, onSubmitSuccess, onSubmitError, onError }: SkyCanvasProps) {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <StarLayer />
      <DrawingLayer
        color={color}
        drawing={drawing}
        onPlace={onPlace}
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
        onSubmitError={onSubmitError}
        onError={onError}
      />
    </div>
  );
}
