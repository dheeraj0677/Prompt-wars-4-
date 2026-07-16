import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IncidentBoard from './IncidentBoard';

const baseTime = '2026-07-16T18:00:00.000Z';

vi.mock('../../data/socialData', () => ({
  generateInitialIncidents: vi.fn(() => [
    {
      id: 'active-1',
      icon: '🚨',
      label: 'Medical',
      severity: 'critical',
      status: 'active',
      zoneName: 'Gate A',
      description: 'Guest needs medical support',
      assignedTo: 'Team Alpha',
      reportedAt: baseTime,
    },
    {
      id: 'progress-1',
      icon: '🧭',
      label: 'Wayfinding',
      severity: 'medium',
      status: 'in_progress',
      zoneName: 'Gate B',
      description: 'Crowd needs routing',
      assignedTo: 'Team Bravo',
      reportedAt: baseTime,
    },
    {
      id: 'resolved-1',
      icon: '💧',
      label: 'Facilities',
      severity: 'low',
      status: 'resolved',
      zoneName: 'Food Court',
      description: 'Water station refilled',
      assignedTo: 'Team Delta',
      reportedAt: baseTime,
      resolvedAt: baseTime,
    },
  ]),
  generateIncident: vi.fn(() => ({
    id: 'new-1',
    icon: '🔥',
    label: 'Crowding',
    severity: 'high',
    status: 'active',
    zoneName: 'East Plaza',
    description: 'New density alert',
    assignedTo: 'Team Echo',
    reportedAt: baseTime,
  })),
}));

describe('IncidentBoard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T18:05:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders incidents by status and advances workflow actions', () => {
    render(<IncidentBoard />);

    expect(screen.getByText('1 active')).toBeInTheDocument();
    expect(screen.getByText('Guest needs medical support')).toBeInTheDocument();
    expect(screen.getByText('Crowd needs routing')).toBeInTheDocument();
    expect(screen.getByText(/Resolved at/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Start'));
    expect(screen.getAllByText('In Progress')[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Resolve')[0]);
    expect(screen.getAllByText(/Resolved at/).length).toBeGreaterThanOrEqual(2);
  });

  it('adds generated incidents on the live interval and cleans up safely', () => {
    const { unmount } = render(<IncidentBoard />);

    act(() => {
      vi.advanceTimersByTime(45000);
    });
    expect(screen.getByText('New density alert')).toBeInTheDocument();

    unmount();
  });
});
