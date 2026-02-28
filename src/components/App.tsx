import { useState, useCallback, useEffect } from 'react';
import { StarsProvider } from '@/context/StarsContext';
import { useStarsContext } from '@/hooks/useStarsContext';
import { SkyCanvas } from './Sky/SkyCanvas';
import { Toolbar } from './Toolbar/Toolbar';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { DEFAULT_COLOR } from '@/utils/constants';

function AppInner() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState<string | null>(null);
  const { isLoading } = useStarsContext();

  const handleError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  // Auto-clear errors after 3 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SkyCanvas color={color} onError={handleError} />
      <Toolbar color={color} onColorChange={setColor} error={error} />
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
