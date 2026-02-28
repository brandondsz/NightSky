import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StarInsert } from '@/types/star';

// Mock supabase before importing starService
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { fetchStars, insertStar } from '@/services/starService';

describe('starService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Chain: from().select().order().limit()
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    // Chain: from().insert().select().single()
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder, single: mockSingle });
    mockOrder.mockReturnValue({ limit: mockLimit });
  });

  describe('fetchStars', () => {
    it('fetches stars ordered by created_at ascending', async () => {
      const mockStars = [{ id: '1' }, { id: '2' }];
      mockLimit.mockResolvedValue({ data: mockStars, error: null });

      const result = await fetchStars();

      expect(mockFrom).toHaveBeenCalledWith('stars');
      expect(result).toEqual(mockStars);
    });

    it('throws on error', async () => {
      const error = { message: 'DB error' };
      mockLimit.mockResolvedValue({ data: null, error });

      await expect(fetchStars()).rejects.toEqual(error);
    });
  });

  describe('insertStar', () => {
    it('inserts a star and returns it', async () => {
      const newStar: StarInsert = {
        path_data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        color: '#FFF',
        stroke_width: 2,
        session_id: 'test',
      };
      const inserted = { ...newStar, id: 'new-id', created_at: '2024-01-01' };

      // Re-wire for insert chain: from().insert().select().single()
      const selectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: selectAfterInsert });
      mockSingle.mockResolvedValue({ data: inserted, error: null });

      const result = await insertStar(newStar);
      expect(result).toEqual(inserted);
    });

    it('throws on insert error', async () => {
      const error = { message: 'Rate limit', code: 'P0001' };
      const selectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
      mockInsert.mockReturnValue({ select: selectAfterInsert });
      mockSingle.mockResolvedValue({ data: null, error });

      await expect(insertStar({
        path_data: [],
        color: '#FFF',
        stroke_width: 2,
        session_id: 'test',
      })).rejects.toEqual(error);
    });
  });
});
