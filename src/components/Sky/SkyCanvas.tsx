import { StarLayer } from './StarLayer';
import { DrawingLayer } from './DrawingLayer';

interface SkyCanvasProps {
  color: string;
  onError: (msg: string) => void;
}

export function SkyCanvas({ color, onError }: SkyCanvasProps) {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <StarLayer />
      <DrawingLayer color={color} onError={onError} />
    </div>
  );
}
