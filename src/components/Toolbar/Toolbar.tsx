import { StarCounter } from './StarCounter';

interface ToolbarProps {
  onDrawStar: () => void;
  isDrawingActive: boolean;
  error: string | null;
}

export function Toolbar({ onDrawStar, isDrawingActive, error }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className="draw-star-btn"
          onClick={onDrawStar}
          disabled={isDrawingActive}
        >
          Draw Star
        </button>
      </div>
      <div className="toolbar-right">
        {error && <span className="toolbar-error">{error}</span>}
        <StarCounter />
      </div>
    </div>
  );
}
