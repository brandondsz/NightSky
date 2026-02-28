import { useState, useEffect, useCallback } from 'react';
import type { Star, StarInsert } from '@/types/star';
import { fetchStars, insertStar } from '@/services/starService';

interface UseStarsReturn {
  stars: Star[];
  isLoading: boolean;
  error: string | null;
  addStar: (star: StarInsert) => Promise<void>;
  handleRealtimeInsert: (star: Star) => void;
  handleRealtimeDelete: (star: Star) => void;
}

export function useStars(): UseStarsReturn {
  const [stars, setStars] = useState<Star[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchStars();
        if (!cancelled) {
          setStars(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stars');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const addStar = useCallback(async (star: StarInsert) => {
    await insertStar(star);
    // Don't update local state — Realtime INSERT event will do that
  }, []);

  const handleRealtimeInsert = useCallback((star: Star) => {
    setStars((prev) => {
      // Avoid duplicates
      if (prev.some((s) => s.id === star.id)) return prev;
      return [...prev, star];
    });
  }, []);

  const handleRealtimeDelete = useCallback((star: Star) => {
    setStars((prev) => prev.filter((s) => s.id !== star.id));
  }, []);

  return { stars, isLoading, error, addStar, handleRealtimeInsert, handleRealtimeDelete };
}
