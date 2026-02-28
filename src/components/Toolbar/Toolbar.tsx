import { StarCounter } from './StarCounter';

const COLORS = ['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

interface ToolbarProps {
  color: string;
  onColorChange: (color: string) => void;
  error: string | null;
}

export function Toolbar({ color, onColorChange, error }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="color-picker">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`color-swatch ${c === color ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onColorChange(c)}
              aria-label={`Select color ${c}`}
              title={c}
            />
          ))}
        </div>
      </div>
      <div className="toolbar-right">
        {error && <span className="toolbar-error">{error}</span>}
        <StarCounter />
      </div>
    </div>
  );
}
