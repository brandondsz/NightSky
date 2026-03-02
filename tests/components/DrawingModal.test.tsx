import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawingModal } from '@/components/DrawingModal/DrawingModal';
import * as validateModule from '@/utils/validateStarShape';

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

// Mock setPointerCapture (not available in jsdom)
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

describe('DrawingModal', () => {
  const defaultProps = {
    color: '#FFFFFF',
    onColorChange: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders modal with title, canvas, color picker, and buttons', () => {
    render(<DrawingModal {...defaultProps} />);
    expect(screen.getByText('Sketch a Star That Belongs to Everyone')).toBeInTheDocument();
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

  it('shows validation error when shape is invalid', () => {
    vi.spyOn(validateModule, 'validateStarShape').mockReturnValue({
      valid: false,
      message: 'Try drawing a pointy star shape with multiple tips.',
    });

    const onConfirm = vi.fn();
    render(<DrawingModal {...defaultProps} onConfirm={onConfirm} />);

    const canvas = document.querySelector('canvas')!;

    // Simulate drawing enough points to pass MIN_POINTS check
    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50 });
    for (let i = 0; i < 10; i++) {
      fireEvent.pointerMove(canvas, { clientX: 50 + i * 5, clientY: 50 });
    }
    fireEvent.pointerUp(canvas);

    fireEvent.click(screen.getByText('Confirm'));

    expect(screen.getByText('Try drawing a pointy star shape with multiple tips.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('renders Clear button between Cancel and Confirm', () => {
    render(<DrawingModal {...defaultProps} />);
    const clearBtn = screen.getByText('Clear');
    expect(clearBtn).toBeInTheDocument();

    // Verify button order: Cancel, Clear, Confirm
    const buttons = document.querySelectorAll('.modal-btn');
    expect(buttons[0].textContent).toBe('Cancel');
    expect(buttons[1].textContent).toBe('Clear');
    expect(buttons[2].textContent).toBe('Confirm');
  });

  it('clears validation error when Clear is clicked', () => {
    vi.spyOn(validateModule, 'validateStarShape').mockReturnValue({
      valid: false,
      message: 'Try drawing a pointy star shape with multiple tips.',
    });

    render(<DrawingModal {...defaultProps} />);
    const canvas = document.querySelector('canvas')!;

    // Draw and confirm to trigger error
    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50 });
    for (let i = 0; i < 10; i++) {
      fireEvent.pointerMove(canvas, { clientX: 50 + i * 5, clientY: 50 });
    }
    fireEvent.pointerUp(canvas);
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.getByText('Try drawing a pointy star shape with multiple tips.')).toBeInTheDocument();

    // Click Clear — error should disappear
    fireEvent.click(screen.getByText('Clear'));
    expect(screen.queryByText('Try drawing a pointy star shape with multiple tips.')).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it('clears validation error when starting a new drawing', () => {
    vi.spyOn(validateModule, 'validateStarShape').mockReturnValue({
      valid: false,
      message: 'Try drawing a pointy star shape with multiple tips.',
    });

    render(<DrawingModal {...defaultProps} />);

    const canvas = document.querySelector('canvas')!;

    // Draw and confirm to trigger error
    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50 });
    for (let i = 0; i < 10; i++) {
      fireEvent.pointerMove(canvas, { clientX: 50 + i * 5, clientY: 50 });
    }
    fireEvent.pointerUp(canvas);
    fireEvent.click(screen.getByText('Confirm'));

    expect(screen.getByText('Try drawing a pointy star shape with multiple tips.')).toBeInTheDocument();

    // Start a new drawing — error should clear
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    expect(screen.queryByText('Try drawing a pointy star shape with multiple tips.')).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
