import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/hooks/useStarsContext', () => ({
  useStarsContext: () => ({
    stars: [],
    isLoading: false,
    error: null,
    addStar: vi.fn(),
  }),
}));

import { Toolbar } from '@/components/Toolbar/Toolbar';

const defaultProps = {
  onDrawStar: () => {},
  isDrawingActive: false,
  error: null,
};

describe('Toolbar', () => {
  it('renders Draw Star button', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('Draw Star')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Toolbar {...defaultProps} error="Rate limit!" />);
    expect(screen.getByText('Rate limit!')).toBeInTheDocument();
  });

  it('shows star counter', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('0 / 10 stars')).toBeInTheDocument();
  });

  it('calls onDrawStar when Draw Star button is clicked', () => {
    const handleDrawStar = vi.fn();
    render(<Toolbar {...defaultProps} onDrawStar={handleDrawStar} />);
    fireEvent.click(screen.getByText('Draw Star'));
    expect(handleDrawStar).toHaveBeenCalledOnce();
  });

  it('disables Draw Star button when isDrawingActive is true', () => {
    render(<Toolbar {...defaultProps} isDrawingActive={true} />);
    const btn = screen.getByText('Draw Star');
    expect(btn).toBeDisabled();
  });

  it('enables Draw Star button when isDrawingActive is false', () => {
    render(<Toolbar {...defaultProps} isDrawingActive={false} />);
    const btn = screen.getByText('Draw Star');
    expect(btn).not.toBeDisabled();
  });
});
