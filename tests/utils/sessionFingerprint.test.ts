import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSessionId } from '@/utils/sessionFingerprint';
import { SESSION_KEY } from '@/utils/constants';

describe('getSessionId', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
    });
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid-1234'),
    });
  });

  it('creates and stores a new session ID', () => {
    const id = getSessionId();
    expect(id).toBe('test-uuid-1234');
    expect(sessionStorage.setItem).toHaveBeenCalledWith(SESSION_KEY, 'test-uuid-1234');
  });

  it('returns existing session ID if present', () => {
    store[SESSION_KEY] = 'existing-id';
    const id = getSessionId();
    expect(id).toBe('existing-id');
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
  });
});
