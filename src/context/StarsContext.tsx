import { createContext, type ReactNode } from 'react';
import { useStars } from '@/hooks/useStars';
import { useRealtimeStars } from '@/hooks/useRealtimeStars';
import type { Star, StarInsert } from '@/types/star';

export interface StarsContextValue {
  stars: Star[];
  isLoading: boolean;
  error: string | null;
  addStar: (star: StarInsert) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const StarsContext = createContext<StarsContextValue | null>(null);

export function StarsProvider({ children }: { children: ReactNode }) {
  const { stars, isLoading, error, addStar, handleRealtimeInsert, handleRealtimeDelete } = useStars();

  useRealtimeStars({
    onInsert: handleRealtimeInsert,
    onDelete: handleRealtimeDelete,
  });

  return (
    <StarsContext.Provider value={{ stars, isLoading, error, addStar }}>
      {children}
    </StarsContext.Provider>
  );
}
