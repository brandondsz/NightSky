import { useEffect } from 'react';
import { subscribeToStars, unsubscribeFromStars } from '@/services/realtimeService';
import type { Star } from '@/types/star';

interface UseRealtimeStarsParams {
  onInsert: (star: Star) => void;
  onDelete: (star: Star) => void;
}

export function useRealtimeStars({ onInsert, onDelete }: UseRealtimeStarsParams): void {
  useEffect(() => {
    const channel = subscribeToStars({ onInsert, onDelete });

    return () => {
      unsubscribeFromStars(channel);
    };
  }, [onInsert, onDelete]);
}
