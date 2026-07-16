import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AnalyticsView from './AnalyticsView';

vi.mock('./HistoricalComparison', () => ({ default: () => <div data-testid="historical">Historical</div> }));
vi.mock('./LanguageAnalytics', () => ({ default: () => <div data-testid="languages">Languages</div> }));
vi.mock('./PerformanceMetrics', () => ({ default: () => <div data-testid="performance">Performance</div> }));
vi.mock('./AccessibilityDashboard', () => ({ default: () => <div data-testid="accessibility">Accessibility</div> }));

describe('AnalyticsView', () => {
  it('renders accessible analytics tabs and default panel', () => {
    render(<AnalyticsView />);

    expect(screen.getByRole('tablist', { name: /analytics sections/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /historical/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'analytics-tab-historical');
    expect(screen.getByTestId('historical')).toBeInTheDocument();
  });

  it('switches analytics panels', () => {
    render(<AnalyticsView />);

    fireEvent.click(screen.getByRole('tab', { name: /languages/i }));
    expect(screen.getByTestId('languages')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /performance/i }));
    expect(screen.getByTestId('performance')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /accessibility/i }));
    expect(screen.getByRole('tab', { name: /accessibility/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('accessibility')).toBeInTheDocument();
  });
});
