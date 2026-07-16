import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StadiumBowlHeatmap from './StadiumBowlHeatmap';

describe('StadiumBowlHeatmap', () => {
  it('renders density mode with all core labels and handles section click', () => {
    const onSectionClick = vi.fn();
    render(<StadiumBowlHeatmap onSectionClick={onSectionClick} highlightSection="L101" />);

    expect(screen.getByText(/Crowd Density/i)).toBeInTheDocument();
    expect(screen.getByText('PITCH')).toBeInTheDocument();
    expect(screen.getByText('L101')).toBeInTheDocument();

    fireEvent.click(screen.getByText('L101').closest('g'));
    expect(onSectionClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'L101' }));
  });

  it('shows tooltip details on hover', () => {
    render(<StadiumBowlHeatmap />);

    fireEvent.mouseEnter(screen.getByText('V301').closest('g'));

    expect(screen.getByText('VIP West')).toBeInTheDocument();
    expect(screen.getByText(/Ultra VIP/i)).toBeInTheDocument();
    expect(screen.getByText(/Best View in Stadium/i)).toBeInTheDocument();
  });

  it('renders view, ticket, and price modes', () => {
    const { rerender } = render(<StadiumBowlHeatmap mode="view" />);
    expect(screen.getByText(/View Quality Rating/i)).toBeInTheDocument();
    expect(screen.getByText('9.5+ Gold')).toBeInTheDocument();

    rerender(<StadiumBowlHeatmap mode="tickets" />);
    expect(screen.getByText(/Ticket Sales/i)).toBeInTheDocument();
    expect(screen.getByText('95%+ Sold Out')).toBeInTheDocument();

    rerender(<StadiumBowlHeatmap mode="price" />);
    expect(screen.getByText(/Price Tier/i)).toBeInTheDocument();
    expect(screen.getByText(/Ultra VIP \(\$2200\)/i)).toBeInTheDocument();
  });
});
