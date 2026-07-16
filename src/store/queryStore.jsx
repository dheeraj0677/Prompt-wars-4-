// Shared state store — React Context + useReducer for fan queries and operational data
import { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { generateSyntheticQuery, generateInitialBatch } from '../data/simulator';
import { ZONES } from '../data/stadium';

const QueryContext = createContext(null);

const ANOMALY_THRESHOLD = 2.5; // multiplier over average
const ROLLING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const PRUNE_THRESHOLD_MS = 15 * 60 * 1000; // drop queries older than 15 minutes

const initialState = {
  queries: [],
  fanMessages: [],
  fanLocation: 'gate-a',
  staffMessages: [],
  activeView: 'fan',
  isSimulatorRunning: true,
  shiftSummary: null,
  totalFanCount: 42851,
  avgLatency: 1.2,
};

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
 * Zones exceeding ANOMALY_THRESHOLD × average trigger typed alerts
 * (VOLUME SPIKE, FACILITY ISSUE, SAFETY ALERT, FLOW BREACH).
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
 * Compares against the previous window to compute velocity (% change).
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

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_QUERY': {
      const pruned = state.queries.length > 200
        ? state.queries.filter(q => Date.now() - new Date(q.timestamp).getTime() < PRUNE_THRESHOLD_MS)
        : state.queries;
      return { ...state, queries: [...pruned, action.payload] };
    }
    case 'ADD_QUERIES':
      return { ...state, queries: [...state.queries, ...action.payload] };
    case 'ADD_FAN_MESSAGE':
      return { ...state, fanMessages: [...state.fanMessages, action.payload] };
    case 'ADD_STAFF_MESSAGE':
      return { ...state, staffMessages: [...state.staffMessages, action.payload] };
    case 'SET_FAN_LOCATION':
      return { ...state, fanLocation: action.payload };
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_SHIFT_SUMMARY':
      return { ...state, shiftSummary: action.payload };
    case 'TOGGLE_SIMULATOR':
      return { ...state, isSimulatorRunning: !state.isSimulatorRunning };
    default:
      return state;
  }
}

export function QueryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const simulatorRef = useRef(null);
  const initialized = useRef(false);

  // Initialize with batch
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const batch = generateInitialBatch(40);
      dispatch({ type: 'ADD_QUERIES', payload: batch });
    }
  }, []);

  // Simulator loop
  useEffect(() => {
    if (state.isSimulatorRunning) {
      const tick = () => {
        const query = generateSyntheticQuery();
        dispatch({ type: 'ADD_QUERY', payload: query });
        // Random interval 3-8 seconds
        simulatorRef.current = setTimeout(tick, 3000 + Math.random() * 5000);
      };
      simulatorRef.current = setTimeout(tick, 2000);
      return () => clearTimeout(simulatorRef.current);
    } else {
      clearTimeout(simulatorRef.current);
    }
  }, [state.isSimulatorRunning]);

  // Memoize expensive computations — only recalculate when queries change
  const zoneStats = useMemo(() => computeZoneStats(state.queries), [state.queries]);
  const anomalies = useMemo(() => computeAnomalies(state.queries, zoneStats), [state.queries, zoneStats]);
  const trending = useMemo(() => computeTrending(state.queries), [state.queries]);
  const recentQueryCount = useMemo(
    () => state.queries.filter(q => Date.now() - new Date(q.timestamp).getTime() < ROLLING_WINDOW_MS).length,
    [state.queries]
  );

  const value = {
    ...state,
    dispatch,
    zoneStats,
    anomalies,
    trending,
    recentQueryCount,

    addFanMessage: useCallback((msg) => {
      dispatch({ type: 'ADD_FAN_MESSAGE', payload: msg });
      // Also add to query log if it's a user message
      if (msg.role === 'user') {
        dispatch({
          type: 'ADD_QUERY',
          payload: {
            id: msg.id,
            message: msg.content,
            language: msg.language || 'en',
            intent: msg.intent || 'general',
            zoneId: msg.zoneId || state.fanLocation,
            zoneName: msg.zoneName || '',
            timestamp: msg.timestamp,
            isSimulated: false,
            urgency: 'normal',
          },
        });
      }
    }, [state.fanLocation]),

    addStaffMessage: useCallback((msg) => {
      dispatch({ type: 'ADD_STAFF_MESSAGE', payload: msg });
    }, []),

    setFanLocation: useCallback((loc) => {
      dispatch({ type: 'SET_FAN_LOCATION', payload: loc });
    }, []),

    setView: useCallback((view) => {
      dispatch({ type: 'SET_VIEW', payload: view });
    }, []),

    setShiftSummary: useCallback((summary) => {
      dispatch({ type: 'SET_SHIFT_SUMMARY', payload: summary });
    }, []),

    // Get hot zone for crowd nudge
    getHotZones: useCallback(() => {
      return Object.entries(zoneStats)
        .filter(([, s]) => s.level === 'critical' || s.level === 'high')
        .map(([id]) => id);
    }, [zoneStats]),

    // Get query log summary for AI
    getQueryLogSummary: useCallback(() => {
      const now = Date.now();
      const recent = state.queries.filter(q => now - new Date(q.timestamp).getTime() < 15 * 60 * 1000);
      const byZone = {};
      const byIntent = {};
      const byLang = {};

      recent.forEach(q => {
        byZone[q.zoneName || q.zoneId] = (byZone[q.zoneName || q.zoneId] || 0) + 1;
        byIntent[q.intent] = (byIntent[q.intent] || 0) + 1;
        byLang[q.language] = (byLang[q.language] || 0) + 1;
      });

      return {
        totalQueries: recent.length,
        byZone,
        byIntent,
        byLanguage: byLang,
        anomalies: anomalies.map(a => `${a.type} at ${a.zoneName}: ${a.description}`),
        timeRange: '15 minutes',
      };
    }, [state.queries, anomalies]),
  };

  return (
    <QueryContext.Provider value={value}>
      {children}
    </QueryContext.Provider>
  );
}

QueryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useQueryStore() {
  const ctx = useContext(QueryContext);
  if (!ctx) throw new Error('useQueryStore must be used within QueryProvider');
  return ctx;
}
