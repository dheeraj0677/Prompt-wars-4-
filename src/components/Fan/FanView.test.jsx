import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FanView from './FanView';

vi.mock('./ChatPanel', () => ({ default: () => <div data-testid="chat-panel">Chat Panel</div> }));
vi.mock('./Sidebar', () => ({ default: () => <div data-testid="fan-sidebar">Fan Sidebar</div> }));
vi.mock('./MatchCenter', () => ({ default: () => <div data-testid="match-center">Match Center</div> }));
vi.mock('./FanEngagement', () => ({ default: () => <div data-testid="fan-engagement">Fan Engagement</div> }));
vi.mock('./FoodPreOrder', () => ({ default: () => <div data-testid="food-preorder">Food PreOrder</div> }));

describe('FanView', () => {
  it('renders concierge tab by default with accessible tab state', () => {
    render(<FanView />);

    expect(screen.getByRole('tablist', { name: /fan tools/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /concierge/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'fan-tab-concierge');
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    expect(screen.getByTestId('fan-sidebar')).toBeInTheDocument();
  });

  it('switches between fan tool panels', () => {
    render(<FanView />);

    fireEvent.click(screen.getByRole('tab', { name: /match center/i }));
    expect(screen.getByRole('tab', { name: /match center/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('match-center')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /engage/i }));
    expect(screen.getByTestId('fan-engagement')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /order food/i }));
    expect(screen.getByTestId('food-preorder')).toBeInTheDocument();
  });
});
