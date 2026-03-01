import { useState, useCallback, useEffect } from 'react';
import { StarsProvider } from '@/context/StarsContext';
import { useStarsContext } from '@/hooks/useStarsContext';
import { useDrawing } from '@/hooks/useDrawing';
import { useRateLimit } from '@/hooks/useRateLimit';
import { SkyCanvas } from './Sky/SkyCanvas';
import { Toolbar } from './Toolbar/Toolbar';
import { DrawingModal } from './DrawingModal/DrawingModal';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { DrawingPhase } from '@/types/drawing';
import { DEFAULT_COLOR } from '@/utils/constants';
import type { Point } from '@/types/star';

function AppInner() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState<string | null>(null);
  const { isLoading } = useStarsContext();
  const { state: drawing, startDrawing, confirmShape, cancel, place, submitSuccess, submitError } = useDrawing();
  const { checkAndConsume } = useRateLimit();

  const handleError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  // Auto-clear errors after 3 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleDrawStar = useCallback(() => {
    if (!checkAndConsume()) {
      setError('Please wait before drawing another star');
      return;
    }
    startDrawing();
  }, [checkAndConsume, startDrawing]);

  const handleConfirmShape = useCallback((shape: Point[]) => {
    confirmShape(shape);
  }, [confirmShape]);

  const handlePlace = useCallback((point: Point) => {
    place(point);
  }, [place]);

  const handleSubmitError = useCallback((msg: string) => {
    submitError(msg);
    setError(msg);
  }, [submitError]);

  const isDrawingActive = drawing.phase !== DrawingPhase.Idle;

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SkyCanvas
        color={color}
        drawing={drawing}
        onPlace={handlePlace}
        onCancel={cancel}
        onSubmitSuccess={submitSuccess}
        onSubmitError={handleSubmitError}
        onError={handleError}
      />
      {drawing.phase === DrawingPhase.Idle && (
        <header className="sky-header">
          <h1 className="sky-header-title">NightSky</h1>
          <p className="sky-header-sub">every star was drawn by a stranger - leave yours</p>
        </header>
      )}
      <Toolbar
        onDrawStar={handleDrawStar}
        isDrawingActive={isDrawingActive}
        error={error}
      />
      {drawing.phase === DrawingPhase.Drawing && (
        <DrawingModal
          color={color}
          onColorChange={setColor}
          onConfirm={handleConfirmShape}
          onCancel={cancel}
        />
      )}
      {drawing.phase === DrawingPhase.Placing && (
        <div className="placement-hint">Tap the sky to place your star</div>
      )}
    </>
  );
}

export function App() {
  return (
    <StarsProvider>
      <AppInner />
    </StarsProvider>
  );
}
