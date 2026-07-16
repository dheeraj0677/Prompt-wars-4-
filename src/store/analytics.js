import { ZONES } from '../data/stadium';

const ANOMALY_THRESHOLD = 2.5; // multiplier over average
const ROLLING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Computes per-zone query statistics over a rolling time window.
 * Calculates query counts, velocity (rate of change vs previous window),
 * and congestion level for each stadium zone.
 * @param {Array} queries - All logged queries
 * @returns {Object} Map of zoneId → { zone, count, velocity, queries, level }
 */
export function computeZoneStats(queries) {
  const now = Date.now();
  const recentQueries = queries.filter(q => now - new Date(q.timestamp).getTime() < ROLLING_WINDOW_MS);

  const stats = {};
  for (const zone of ZONES) {
    const zoneQueries = recentQueries.filter(q => q.zoneId === zone.id);
    const prevWindow = queries.filter(q => {
      const t = now - new Date(q.timestamp).getTime();
      return q.zoneId === zone.id && t >= ROLLING_WINDOW_MS && t < ROLLING_WINDOW_MS * 2;
    });

    const velocity = prevWindow.length > 0
      ? ((zoneQueries.length - prevWindow.length) / Math.max(prevWindow.length, 1)) * 100
      : 0;

    stats[zone.id] = {
      zone,
      count: zoneQueries.length,
      velocity: Math.round(velocity),
      queries: zoneQueries,
      level: zoneQueries.length > 20 ? 'critical' : zoneQueries.length > 12 ? 'high' : zoneQueries.length > 5 ? 'med' : 'low',
    };
  }
  return stats;
}

/**
 * Detects anomalous zones by comparing query counts against the stadium-wide average.
 * Zones exceeding ANOMALY_THRESHOLD × average trigger typed alerts.
 * @param {Array} queries - All logged queries
 * @param {Object} zoneStats - Pre-computed zone statistics
 * @returns {Array} List of anomaly objects with type, severity, and description
 */
export function computeAnomalies(queries, zoneStats) {
  const anomalies = [];
  const avgCount = Object.values(zoneStats).reduce((s, z) => s + z.count, 0) / Object.values(zoneStats).length;

  for (const [zoneId, stat] of Object.entries(zoneStats)) {
    if (stat.count > avgCount * ANOMALY_THRESHOLD && stat.count > 5) {
      // Determine anomaly type from dominant intent
      const intentCounts = {};
      stat.queries.forEach(q => {
        intentCounts[q.intent] = (intentCounts[q.intent] || 0) + 1;
      });
      const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0];

      let type = 'VOLUME SPIKE';
      let description = `Unusual query volume at ${stat.zone.name} — ${stat.count} queries in 5 min (${Math.round(stat.count / avgCount)}x average).`;

      if (topIntent) {
        if (topIntent[0] === 'restroom') {
          type = 'FACILITY ISSUE';
          description = `Spike in restroom queries at ${stat.zone.name} — possible facility issue. ${topIntent[1]} restroom queries detected.`;
        } else if (topIntent[0] === 'safety' || topIntent[0] === 'emergency') {
          type = 'SAFETY ALERT';
          description = `Elevated safety/emergency queries at ${stat.zone.name}. Immediate attention recommended.`;
        } else if (topIntent[0] === 'wayfinding') {
          type = 'FLOW BREACH';
          description = `Congestion levels at ${stat.zone.name} exceed standard safety protocols by ${Math.round((stat.count / avgCount - 1) * 100)}%. Immediate dispatch recommended.`;
        }
      }

      anomalies.push({
        id: `anomaly-${zoneId}-${Date.now()}`,
        type,
        zoneId,
        zoneName: stat.zone.name,
        description,
        timestamp: new Date().toISOString(),
        severity: stat.count > avgCount * 3 ? 'critical' : 'warning',
      });
    }
  }
  return anomalies;
}

/**
 * Clusters recent queries by intent+zone to surface trending topics.
 * Returns top 8 trending clusters sorted by velocity.
 * @param {Array} queries - All logged queries
 * @returns {Array} Sorted list of trending topic clusters
 */
export function computeTrending(queries) {
  const now = Date.now();
  const recent = queries.filter(q => now - new Date(q.timestamp).getTime() < ROLLING_WINDOW_MS);
  const prev = queries.filter(q => {
    const t = now - new Date(q.timestamp).getTime();
    return t >= ROLLING_WINDOW_MS && t < ROLLING_WINDOW_MS * 2;
  });

  // Cluster by intent + zone
  const clusters = {};
  recent.forEach(q => {
    const key = `${q.intent}|${q.zoneId}`;
    if (!clusters[key]) {
      clusters[key] = { intent: q.intent, zoneId: q.zoneId, zoneName: q.zoneName, count: 0, prevCount: 0 };
    }
    clusters[key].count++;
  });

  prev.forEach(q => {
    const key = `${q.intent}|${q.zoneId}`;
    if (clusters[key]) clusters[key].prevCount++;
  });

  return Object.values(clusters)
    .map(c => ({
      ...c,
      velocity: c.prevCount > 0 ? Math.round(((c.count - c.prevCount) / c.prevCount) * 100) : c.count > 2 ? 999 : 0,
      label: c.intent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }))
    .filter(c => c.count >= 2)
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 8);
}
