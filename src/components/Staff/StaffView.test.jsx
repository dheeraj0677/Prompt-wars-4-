import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StaffView from './StaffView';
import { useQueryStore } from '../../store/queryStore';

vi.mock('../../store/queryStore', () => ({
  useQueryStore: vi.fn(),
}));

vi.mock('./Heatmap', () => ({ default: () => <div data-testid="heatmap">Heatmap Component</div> }));
vi.mock('./KPIBar', () => ({ default: () => <div data-testid="kpi-bar">KPIBar Component</div> }));
vi.mock('./TrendingTable', () => ({ default: () => <div data-testid="trending-table">TrendingTable Component</div> }));
vi.mock('./StaffChat', () => ({ default: () => <div data-testid="staff-chat">StaffChat Component</div> }));
vi.mock('./AnomalyCards', () => ({ default: () => <div data-testid="anomaly-cards">AnomalyCards Component</div> }));
vi.mock('./ShiftPulse', () => ({ default: () => <div data-testid="shift-pulse">ShiftPulse Component</div> }));
vi.mock('./WeatherPanel', () => ({ default: () => <div data-testid="weather-panel">WeatherPanel Component</div> }));
vi.mock('./PredictiveFlow', () => ({ default: () => <div data-testid="predictive-flow">PredictiveFlow Component</div> }));
vi.mock('./TicketAnalytics', () => ({ default: () => <div data-testid="ticket-analytics">TicketAnalytics Component</div> }));
vi.mock('./IncidentBoard', () => ({ default: () => <div data-testid="incident-board">IncidentBoard Component</div> }));
vi.mock('./SocialSentiment', () => ({ default: () => <div data-testid="social-sentiment">SocialSentiment Component</div> }));
vi.mock('./RevenueDashboard', () => ({ default: () => <div data-testid="revenue-dashboard">RevenueDashboard Component</div> }));
vi.mock('./ResourceAllocation', () => ({ default: () => <div data-testid="resource-allocation">ResourceAllocation Component</div> }));

const storeValue = {
  isSimulatorRunning: true,
  dispatch: vi.fn(),
  zoneStats: {},
  anomalies: [],
  queries: [],
  totalFanCount: 40000,
  shiftSummary: null,
  staffMessages: [],
  addStaffMessage: vi.fn(),
};

describe('StaffView', () => {
  it('renders the staff view layout and headers', () => {
    useQueryStore.mockReturnValue(storeValue);

    render(<StaffView />);
    expect(screen.getByText(/Operations/i)).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: /staff dashboard sections/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /operations/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders all staff view sub-components', () => {
    useQueryStore.mockReturnValue(storeValue);

    render(<StaffView />);
    expect(screen.getByTestId('heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-bar')).toBeInTheDocument();
    expect(screen.getByTestId('trending-table')).toBeInTheDocument();
  });

  it('switches staff tab panels with accessible tab state', () => {
    useQueryStore.mockReturnValue(storeValue);

    render(<StaffView />);

    fireEvent.click(screen.getByRole('tab', { name: /tickets/i }));
    expect(screen.getByRole('tab', { name: /tickets/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('ticket-analytics')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /incidents/i }));
    expect(screen.getByTestId('incident-board')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /social/i }));
    expect(screen.getByTestId('social-sentiment')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /revenue/i }));
    expect(screen.getByTestId('revenue-dashboard')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /resources/i }));
    expect(screen.getByTestId('resource-allocation')).toBeInTheDocument();
  });
});
