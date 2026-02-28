import { useState, useCallback, useRef } from 'react';
import { COOLDOWN_MS } from '@/utils/constants';

interface UseRateLimitReturn {
  isLimited: boolean;
  remainingMs: number;
  checkAndConsume: () => boolean;
}

export function useRateLimit(): UseRateLimitReturn {
  const [isLimited, setIsLimited] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const lastUsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const checkAndConsume = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastUsedRef.current;

    if (elapsed < COOLDOWN_MS) {
      setIsLimited(true);
      setRemainingMs(COOLDOWN_MS - elapsed);

      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);

      // Countdown timer
      timerRef.current = setInterval(() => {
        const remaining = COOLDOWN_MS - (Date.now() - lastUsedRef.current);
        if (remaining <= 0) {
          setIsLimited(false);
          setRemainingMs(0);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setRemainingMs(remaining);
        }
      }, 100);

      return false;
    }

    lastUsedRef.current = now;
    return true;
  }, []);

  return { isLimited, remainingMs, checkAndConsume };
}
