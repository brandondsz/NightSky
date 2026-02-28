import { useContext } from 'react';
import { StarsContext } from '@/context/StarsContext';
import type { StarsContextValue } from '@/context/StarsContext';

export function useStarsContext(): StarsContextValue {
  const ctx = useContext(StarsContext);
  if (!ctx) throw new Error('useStarsContext must be used within StarsProvider');
  return ctx;
}
