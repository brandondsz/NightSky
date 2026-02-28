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

describe('Toolbar', () => {
  it('renders color swatches', () => {
    render(<Toolbar color="#FFFFFF" onColorChange={() => {}} error={null} />);
    const swatches = screen.getAllByRole('button');
    expect(swatches.length).toBe(8);
  });

  it('marks active color', () => {
    render(<Toolbar color="#FFD700" onColorChange={() => {}} error={null} />);
    const active = document.querySelector('.color-swatch.active') as HTMLElement;
    expect(active).toBeTruthy();
    expect(active.style.backgroundColor).toBe('rgb(255, 215, 0)');
  });

  it('calls onColorChange when swatch clicked', () => {
    const handleChange = vi.fn();
    render(<Toolbar color="#FFFFFF" onColorChange={handleChange} error={null} />);
    const swatches = screen.getAllByRole('button');
    fireEvent.click(swatches[1]); // Second color
    expect(handleChange).toHaveBeenCalledWith('#FFD700');
  });

  it('displays error message', () => {
    render(<Toolbar color="#FFFFFF" onColorChange={() => {}} error="Rate limit!" />);
    expect(screen.getByText('Rate limit!')).toBeInTheDocument();
  });

  it('shows star counter', () => {
    render(<Toolbar color="#FFFFFF" onColorChange={() => {}} error={null} />);
    expect(screen.getByText('0 / 10 stars')).toBeInTheDocument();
  });
});
