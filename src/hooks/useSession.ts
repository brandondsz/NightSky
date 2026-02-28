import { useMemo } from 'react';
import { getSessionId } from '@/utils/sessionFingerprint';

export function useSession(): string {
  return useMemo(() => getSessionId(), []);
}
