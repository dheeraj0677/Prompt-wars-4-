import { describe, it, expect } from 'vitest';
import { computeZoneStats, computeAnomalies, computeTrending } from './queryStore';

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
  });
});
