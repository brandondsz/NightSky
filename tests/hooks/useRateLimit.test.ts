import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '@/hooks/useRateLimit';

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows first call', () => {
    const { result } = renderHook(() => useRateLimit());

    let allowed: boolean;
    act(() => {
      allowed = result.current.checkAndConsume();
    });

    expect(allowed!).toBe(true);
    expect(result.current.isLimited).toBe(false);
  });

  it('blocks rapid second call', () => {
    const { result } = renderHook(() => useRateLimit());

    act(() => {
      result.current.checkAndConsume();
    });

    let allowed: boolean;
    act(() => {
      allowed = result.current.checkAndConsume();
    });

    expect(allowed!).toBe(false);
    expect(result.current.isLimited).toBe(true);
    expect(result.current.remainingMs).toBeGreaterThan(0);
  });

  it('allows call after cooldown', () => {
    const { result } = renderHook(() => useRateLimit());

    act(() => {
      result.current.checkAndConsume();
    });

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    let allowed: boolean;
    act(() => {
      allowed = result.current.checkAndConsume();
    });

    expect(allowed!).toBe(true);
  });

  it('clears limited state after cooldown expires', () => {
    const { result } = renderHook(() => useRateLimit());

    act(() => {
      result.current.checkAndConsume();
    });

    act(() => {
      result.current.checkAndConsume();
    });

    expect(result.current.isLimited).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(result.current.isLimited).toBe(false);
    expect(result.current.remainingMs).toBe(0);
  });
});
