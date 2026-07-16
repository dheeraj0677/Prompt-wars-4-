import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StadiumMap from './StadiumMap';
import { useQueryStore } from '../../store/queryStore';

// Mock the query store
vi.mock('../../store/queryStore', () => ({
  useQueryStore: vi.fn(),
}));

describe('StadiumMap', () => {
  it('renders the stadium map component', () => {
    useQueryStore.mockReturnValue({
      fanLocation: 'gate-a',
      setFanLocation: vi.fn(),
      zoneStats: {
        'gate-a': { count: 10, level: 'med' },
      },
    });

    render(<StadiumMap />);
    expect(screen.getByText(/GATE A/i)).toBeInTheDocument();
  });

  it('renders zone buttons with correct active state', () => {
    useQueryStore.mockReturnValue({
      fanLocation: 'gate-a',
      setFanLocation: vi.fn(),
      zoneStats: {
        'gate-a': { count: 10, level: 'med' },
      },
    });

    render(<StadiumMap />);
    
    // Gate A should have the active class
    const gateA = screen.getByText('GATE A').closest('g');
    expect(gateA.className.baseVal).toContain('active');
    
    // Gate B should not
    const gateB = screen.getByText('GATE B').closest('g');
    expect(gateB.className.baseVal).not.toContain('active');
  });

  it('calls setFanLocation when a zone is clicked', () => {
    const setFanLocationMock = vi.fn();
    useQueryStore.mockReturnValue({
      fanLocation: 'gate-a',
      setFanLocation: setFanLocationMock,
      zoneStats: {},
    });

    render(<StadiumMap />);
    
    const gateB = screen.getByText('GATE B').closest('g');
    fireEvent.click(gateB);
    
    expect(setFanLocationMock).toHaveBeenCalledWith('gate-b');
  });

  it('supports keyboard zone selection', () => {
    const setFanLocationMock = vi.fn();
    useQueryStore.mockReturnValue({
      fanLocation: 'gate-a',
      setFanLocation: setFanLocationMock,
      zoneStats: {},
    });

    render(<StadiumMap />);

    const gateC = screen.getByText('GATE C').closest('g');
    fireEvent.keyDown(gateC, { key: 'Enter' });
    fireEvent.keyDown(gateC, { key: ' ' });

    expect(setFanLocationMock).toHaveBeenCalledWith('gate-c');
    expect(setFanLocationMock).toHaveBeenCalledTimes(2);
  });

  it('renders congestion aria labels for all severity levels', () => {
    useQueryStore.mockReturnValue({
      fanLocation: 'gate-a',
      setFanLocation: vi.fn(),
      zoneStats: {
        'gate-a': { count: 2, level: 'low' },
        'gate-b': { count: 9, level: 'med' },
        'gate-c': { count: 17, level: 'high' },
        'section-108': { count: 24, level: 'critical' },
      },
    });

    render(<StadiumMap />);

    expect(screen.getByRole('button', { name: /gate b.*congestion med/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gate c.*congestion high/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sec 108.*congestion critical/i })).toBeInTheDocument();
  });
});
