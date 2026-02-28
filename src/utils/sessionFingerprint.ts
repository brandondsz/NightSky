import { SESSION_KEY } from './constants';

/**
 * Get or create an anonymous session ID stored in sessionStorage.
 * Uses crypto.randomUUID() for uniqueness.
 */
export function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}
