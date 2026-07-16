import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IncidentBoard from './IncidentBoard';
import ResourceAllocation from './ResourceAllocation';
import RevenueDashboard from './RevenueDashboard';
import SocialSentiment from './SocialSentiment';
import TicketAnalytics from './TicketAnalytics';

// Mock the socialData generator to prevent random/time-based issues in tests
vi.mock('../../data/socialData', () => ({
  generateInitialIncidents: vi.fn(() => []),
  generateIncident: vi.fn(),
  generateSocialBatch: vi.fn(() => []),
  computeSentimentStats: vi.fn(() => ({ positive: 0, neutral: 0, negative: 0, moodScore: 5 })),
  FOOD_MENU: [{ id: '1', name: 'Burger', popular: true, emoji: '🍔', price: 10 }],
}));

vi.mock('../../store/queryStore', () => ({
  useQueryStore: vi.fn(() => ({ zoneStats: {}, anomalies: [] })),
}));

describe('Dashboard Panels', () => {
  it('renders IncidentBoard without crashing', () => {
    render(<IncidentBoard />);
    expect(screen.getByText(/Incident Management/i)).toBeInTheDocument();
  });

  it('renders ResourceAllocation without crashing', () => {
    render(<ResourceAllocation />);
    expect(screen.getByText(/Resource Allocation/i)).toBeInTheDocument();
  });

  it('renders RevenueDashboard without crashing', () => {
    render(<RevenueDashboard />);
    expect(screen.getByText(/Revenue Intelligence/i)).toBeInTheDocument();
  });

  it('renders SocialSentiment without crashing', () => {
    render(<SocialSentiment />);
    expect(screen.getByText(/Social Sentiment/i)).toBeInTheDocument();
  });

  it('renders TicketAnalytics without crashing', () => {
    render(<TicketAnalytics />);
    expect(screen.getByText(/Ticket & Seating Analytics/i)).toBeInTheDocument();
  });
});
