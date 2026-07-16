import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryProvider, useQueryStore } from './queryStore';
import { computeZoneStats, computeAnomalies, computeTrending } from './analytics';

function StoreProbe() {
  const store = useQueryStore();
  return (
    <div>
      <div data-testid="fan-location">{store.fanLocation}</div>
      <div data-testid="fan-messages">{store.fanMessages.length}</div>
      <div data-testid="staff-messages">{store.staffMessages.length}</div>
      <div data-testid="queries">{store.queries.length}</div>
      <div data-testid="view">{store.activeView}</div>
      <div data-testid="summary">{store.getQueryLogSummary().byIntent.accessibility || 0}</div>
      <button type="button" onClick={() => store.addFanMessage({ id: 'm1', role: 'user', content: 'hello', timestamp: new Date().toISOString() })}>fan-message</button>
      <button type="button" onClick={() => store.recordFanQuery({
        id: 'q1',
        message: 'Need a ramp',
        language: 'en',
        intent: 'accessibility',
        zoneId: 'gate-c',
        zoneName: 'Gate C (North)',
        timestamp: new Date().toISOString(),
        urgency: 'normal',
      })}>fan-query</button>
      <button type="button" onClick={() => store.addStaffMessage({ id: 's1', role: 'assistant', content: 'ready', timestamp: new Date().toISOString() })}>staff-message</button>
      <button type="button" onClick={() => store.setFanLocation('gate-c')}>location</button>
      <button type="button" onClick={() => store.setView('staff')}>view</button>
      <button type="button" onClick={() => store.setShiftSummary('briefed')}>shift</button>
      <div data-testid="shift">{store.shiftSummary || 'none'}</div>
    </div>
  );
}

describe('Query Store Logic', () => {
  const mockZone = { id: 'gate-a', name: 'Gate A', shortName: 'A' };
  
  describe('computeZoneStats', () => {
    it('calculates counts correctly within rolling window', () => {
      const now = Date.now();
      const queries = [
        { zoneId: 'gate-a', timestamp: new Date(now - 1000).toISOString() },
        { zoneId: 'gate-a', timestamp: new Date(now - 2000).toISOString() },
        { zoneId: 'gate-b', timestamp: new Date(now - 1000).toISOString() },
        // Old query outside 5min window
        { zoneId: 'gate-a', timestamp: new Date(now - 6 * 60 * 1000).toISOString() },
      ];

      const stats = computeZoneStats(queries);
      expect(stats['gate-a'].count).toBe(2);
      expect(stats['gate-b'].count).toBe(1);
    });

    it('calculates correct level thresholds', () => {
      const now = Date.now();
      // Generate 21 queries for critical
      const queries = Array(21).fill(null).map(() => ({
        zoneId: 'gate-a',
        timestamp: new Date(now - 1000).toISOString()
      }));

      const stats = computeZoneStats(queries);
      expect(stats['gate-a'].level).toBe('critical');
    });

    it('calculates medium and high levels plus velocity', () => {
      const now = Date.now();
      const current = Array(13).fill(null).map(() => ({
        zoneId: 'gate-a',
        timestamp: new Date(now - 1000).toISOString(),
      }));
      const previous = Array(10).fill(null).map(() => ({
        zoneId: 'gate-a',
        timestamp: new Date(now - 6 * 60 * 1000).toISOString(),
      }));

      const stats = computeZoneStats([...current, ...previous]);
      expect(stats['gate-a'].level).toBe('high');
      expect(stats['gate-a'].velocity).toBe(30);

      const medStats = computeZoneStats(current.slice(0, 6));
      expect(medStats['gate-a'].level).toBe('med');
    });
  });

  describe('computeAnomalies', () => {
    it('detects volume spikes', () => {
      // 10 queries in gate-a, 1 in gate-b. avg = 5.5. threshold = 2.5 * avg.
      // Wait, there are 9 zones. Total queries = 11. Avg = 1.2. threshold = 2.5 * 1.2 = 3.
      // Gate A has 10, which is > 3 and > 5. Should trigger anomaly.
      const zoneStats = {
        'gate-a': { zone: mockZone, count: 10, queries: [{intent: 'general'}, {intent: 'general'}] },
        'gate-b': { zone: { name: 'Gate B' }, count: 1, queries: [] },
      };
      // Fill the rest so we have 9 zones
      for(let i = 2; i < 9; i++) zoneStats[`z${i}`] = { zone: {name: `Z${i}`}, count: 0, queries: [] };

      const anomalies = computeAnomalies([], zoneStats);
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe('VOLUME SPIKE');
      expect(anomalies[0].zoneId).toBe('gate-a');
    });

    it('detects facility issues based on intent', () => {
      const zoneStats = {
        'gate-a': { zone: mockZone, count: 10, queries: Array(10).fill({intent: 'restroom'}) },
      };
      for(let i = 1; i < 9; i++) zoneStats[`z${i}`] = { zone: {name: `Z${i}`}, count: 0, queries: [] };

      const anomalies = computeAnomalies([], zoneStats);
      expect(anomalies[0].type).toBe('FACILITY ISSUE');
    });

    it('detects safety alerts and flow breaches', () => {
      const safetyStats = {
        'gate-a': { zone: mockZone, count: 10, queries: Array(10).fill({intent: 'emergency'}) },
      };
      for(let i = 1; i < 9; i++) safetyStats[`z${i}`] = { zone: {name: `Z${i}`}, count: 0, queries: [] };

      const flowStats = {
        'gate-a': { zone: mockZone, count: 10, queries: Array(10).fill({intent: 'wayfinding'}) },
      };
      for(let i = 1; i < 9; i++) flowStats[`z${i}`] = { zone: {name: `Z${i}`}, count: 0, queries: [] };

      expect(computeAnomalies([], safetyStats)[0].type).toBe('SAFETY ALERT');
      expect(computeAnomalies([], flowStats)[0].type).toBe('FLOW BREACH');
    });

    it('returns no anomalies when zone volume is normal', () => {
      const zoneStats = {};
      for(let i = 0; i < 9; i++) zoneStats[`z${i}`] = { zone: {name: `Z${i}`}, count: 1, queries: [{ intent: 'general' }] };
      expect(computeAnomalies([], zoneStats)).toEqual([]);
    });
  });

  describe('computeTrending', () => {
    it('clusters trending topics and sorts by velocity', () => {
      const now = Date.now();
      // Current window
      const queries = [
        { intent: 'wayfinding', zoneId: 'gate-a', zoneName: 'Gate A', timestamp: new Date(now - 1000).toISOString() },
        { intent: 'wayfinding', zoneId: 'gate-a', zoneName: 'Gate A', timestamp: new Date(now - 2000).toISOString() },
        // Previous window
        { intent: 'wayfinding', zoneId: 'gate-a', zoneName: 'Gate A', timestamp: new Date(now - 6 * 60 * 1000).toISOString() },
      ];

      const trending = computeTrending(queries);
      expect(trending).toHaveLength(1);
      expect(trending[0].intent).toBe('wayfinding');
      expect(trending[0].count).toBe(2);
      expect(trending[0].velocity).toBe(100); // 1 -> 2 is 100% increase
    });

    it('keeps new clusters with sentinel velocity and filters one-offs', () => {
      const now = Date.now();
      const queries = [
        { intent: 'restroom', zoneId: 'gate-a', zoneName: 'Gate A', timestamp: new Date(now - 1000).toISOString() },
        { intent: 'restroom', zoneId: 'gate-a', zoneName: 'Gate A', timestamp: new Date(now - 2000).toISOString() },
        { intent: 'restroom', zoneId: 'gate-a', zoneName: 'Gate A', timestamp: new Date(now - 3000).toISOString() },
        { intent: 'food_drink', zoneId: 'gate-b', zoneName: 'Gate B', timestamp: new Date(now - 1000).toISOString() },
      ];

      const trending = computeTrending(queries);
      expect(trending).toHaveLength(1);
      expect(trending[0].label).toBe('Restroom');
      expect(trending[0].velocity).toBe(999);
    });
  });

  describe('QueryProvider', () => {
    it('separates visible fan messages from classified operations queries', () => {
      vi.useFakeTimers();
      render(
        <QueryProvider>
          <StoreProbe />
        </QueryProvider>
      );

      expect(screen.getByTestId('queries')).toHaveTextContent('40');

      act(() => screen.getByText('fan-message').click());
      expect(screen.getByTestId('fan-messages')).toHaveTextContent('1');
      expect(screen.getByTestId('queries')).toHaveTextContent('40');

      const previousAccessibilityCount = Number(screen.getByTestId('summary').textContent);
      act(() => screen.getByText('fan-query').click());
      expect(screen.getByTestId('queries')).toHaveTextContent('41');
      expect(screen.getByTestId('summary')).toHaveTextContent(String(previousAccessibilityCount + 1));

      act(() => screen.getByText('staff-message').click());
      act(() => screen.getByText('location').click());
      act(() => screen.getByText('view').click());
      act(() => screen.getByText('shift').click());

      expect(screen.getByTestId('staff-messages')).toHaveTextContent('1');
      expect(screen.getByTestId('fan-location')).toHaveTextContent('gate-c');
      expect(screen.getByTestId('view')).toHaveTextContent('staff');
      expect(screen.getByTestId('shift')).toHaveTextContent('briefed');
      vi.useRealTimers();
    });

    it('throws a helpful error outside the provider', () => {
      function BrokenProbe() {
        useQueryStore();
        return null;
      }

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<BrokenProbe />)).toThrow('useQueryStore must be used within QueryProvider');
      spy.mockRestore();
    });
  });
});
