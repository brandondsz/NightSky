import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/hooks/useStarsContext', () => ({
  useStarsContext: () => ({
    stars: Array.from({ length: 42 }, (_, i) => ({ id: String(i) })),
    isLoading: false,
    error: null,
    addStar: vi.fn(),
  }),
}));

import { StarCounter } from '@/components/Toolbar/StarCounter';

describe('StarCounter', () => {
  it('displays current star count', () => {
    render(<StarCounter />);
    expect(screen.getByText('42 / 10 stars')).toBeInTheDocument();
  });
});
