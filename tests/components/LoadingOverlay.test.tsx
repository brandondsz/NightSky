import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders loading text', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading stars…')).toBeInTheDocument();
  });

  it('renders spinner element', () => {
    const { container } = render(<LoadingOverlay />);
    expect(container.querySelector('.loading-spinner')).toBeTruthy();
  });
});
