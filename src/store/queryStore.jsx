// Shared state store — React Context + useReducer for fan queries and operational data
import { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { generateSyntheticQuery, generateInitialBatch } from '../data/simulator';
import { computeZoneStats, computeAnomalies, computeTrending } from './analytics';

const QueryContext = createContext(null);

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

  const addFanMessage = useCallback((msg) => {
    dispatch({ type: 'ADD_FAN_MESSAGE', payload: msg });
  }, []);

  const recordFanQuery = useCallback((query) => {
    dispatch({
      type: 'ADD_QUERY',
      payload: {
        id: query.id || `query-${Date.now()}`,
        message: query.message || query.content || '',
        language: query.language || 'en',
        intent: query.intent || 'general',
        zoneId: query.zoneId || state.fanLocation,
        zoneName: query.zoneName || '',
        timestamp: query.timestamp || new Date().toISOString(),
        isSimulated: false,
        urgency: query.urgency || 'normal',
      },
    });
  }, [state.fanLocation]);

  const addStaffMessage = useCallback((msg) => {
    dispatch({ type: 'ADD_STAFF_MESSAGE', payload: msg });
  }, []);

  const setFanLocation = useCallback((loc) => {
    dispatch({ type: 'SET_FAN_LOCATION', payload: loc });
  }, []);

  const setView = useCallback((view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const setShiftSummary = useCallback((summary) => {
    dispatch({ type: 'SET_SHIFT_SUMMARY', payload: summary });
  }, []);

  // Get hot zone for crowd nudge
  const getHotZones = useCallback(() => {
    return Object.entries(zoneStats)
      .filter(([, s]) => s.level === 'critical' || s.level === 'high')
      .map(([id]) => id);
  }, [zoneStats]);

  // Get query log summary for AI
  const getQueryLogSummary = useCallback(() => {
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
  }, [state.queries, anomalies]);

  const value = useMemo(() => ({
    ...state,
    dispatch,
    zoneStats,
    anomalies,
    trending,
    recentQueryCount,
    addFanMessage,
    recordFanQuery,
    addStaffMessage,
    setFanLocation,
    setView,
    setShiftSummary,
    getHotZones,
    getQueryLogSummary,
  }), [
    state,
    zoneStats,
    anomalies,
    trending,
    recentQueryCount,
    addFanMessage,
    recordFanQuery,
    addStaffMessage,
    setFanLocation,
    setView,
    setShiftSummary,
    getHotZones,
    getQueryLogSummary,
  ]);

  return (
    <QueryContext.Provider value={value}>
      {children}
    </QueryContext.Provider>
  );
}

QueryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useQueryStore() {
  const ctx = useContext(QueryContext);
  if (!ctx) throw new Error('useQueryStore must be used within QueryProvider');
  return ctx;
}
