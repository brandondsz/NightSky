import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawingModal } from '@/components/DrawingModal/DrawingModal';

// Mock canvas context
const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
};

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx) as unknown as typeof HTMLCanvasElement.prototype.getContext;

describe('DrawingModal', () => {
  const defaultProps = {
    color: '#FFFFFF',
    onColorChange: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders modal with title, canvas, color picker, and buttons', () => {
    render(<DrawingModal {...defaultProps} />);
    expect(screen.getByText('Draw your star')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(document.querySelector('canvas')).toBeTruthy();
    // 8 color swatches
    const swatches = document.querySelectorAll('.color-swatch');
    expect(swatches.length).toBe(8);
  });

  it('marks active color swatch', () => {
    render(<DrawingModal {...defaultProps} color="#FFD700" />);
    const active = document.querySelector('.color-swatch.active') as HTMLElement;
    expect(active).toBeTruthy();
    expect(active.style.backgroundColor).toBe('rgb(255, 215, 0)');
  });

  it('calls onColorChange when a swatch is clicked', () => {
    const onColorChange = vi.fn();
    render(<DrawingModal {...defaultProps} onColorChange={onColorChange} />);
    const swatches = document.querySelectorAll('.color-swatch');
    fireEvent.click(swatches[2]); // Third color (#FF6B6B)
    expect(onColorChange).toHaveBeenCalledWith('#FF6B6B');
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<DrawingModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when overlay is clicked', () => {
    const onCancel = vi.fn();
    render(<DrawingModal {...defaultProps} onCancel={onCancel} />);
    const overlay = document.querySelector('.modal-overlay')!;
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not call onCancel when panel is clicked', () => {
    const onCancel = vi.fn();
    render(<DrawingModal {...defaultProps} onCancel={onCancel} />);
    const panel = document.querySelector('.modal-panel')!;
    fireEvent.click(panel);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn();
    render(<DrawingModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not call onConfirm when clicking Confirm with no drawing', () => {
    const onConfirm = vi.fn();
    render(<DrawingModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirm'));
    // Should not confirm since fewer than MIN_POINTS were drawn
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
