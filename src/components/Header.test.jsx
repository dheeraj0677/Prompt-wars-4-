import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';
import { useQueryStore } from '../store/queryStore';

vi.mock('../store/queryStore', () => ({
  useQueryStore: vi.fn(),
}));

describe('Header', () => {
  const setView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useQueryStore.mockReturnValue({
      activeView: 'fan',
      setView,
      queries: [{ intent: 'goal' }, { intent: 'wayfinding' }],
      anomalies: [{ id: 'a1' }, { id: 'a2' }],
    });
  });

  it('renders accessible navigation controls and status actions', () => {
    render(<Header />);

    expect(screen.getByRole('navigation', { name: /main view navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to fan view/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /notifications, 2 unread/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /user profile/i })).toBeInTheDocument();
  });

  it('switches application views from the header', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: /switch to staff view/i }));
    fireEvent.click(screen.getByRole('button', { name: /switch to analytics view/i }));

    expect(setView).toHaveBeenNthCalledWith(1, 'staff');
    expect(setView).toHaveBeenNthCalledWith(2, 'analytics');
  });
});
