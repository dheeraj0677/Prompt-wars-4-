// Historical Comparison — compare current match to past events
import { useQueryStore } from '../../store/queryStore';

const PAST_MATCHES = [
  { id: 'm1', label: 'ARG vs GER', date: 'Jul 5', totalQueries: 4230, avgResponse: 1.4, anomalies: 3, satisfaction: 87 },
  { id: 'm2', label: 'ENG vs ESP', date: 'Jul 3', totalQueries: 3890, avgResponse: 1.6, anomalies: 5, satisfaction: 82 },
  { id: 'm3', label: 'BRA vs ITA', date: 'Jul 1', totalQueries: 5120, avgResponse: 1.3, anomalies: 2, satisfaction: 91 },
  { id: 'm4', label: 'FRA vs POR', date: 'Jun 29', totalQueries: 3450, avgResponse: 1.8, anomalies: 7, satisfaction: 78 },
  { id: 'm5', label: 'USA vs MEX', date: 'Jun 27', totalQueries: 6230, avgResponse: 1.5, anomalies: 4, satisfaction: 85 },
];

export default function HistoricalComparison() {
  const { queries, anomalies } = useQueryStore();

  const currentMatch = {
    label: 'BRA vs FRA (Now)',
    totalQueries: queries.length,
    avgResponse: 1.2,
    anomalies: anomalies.length,
    satisfaction: 89,
  };

  const allMatches = [currentMatch, ...PAST_MATCHES];
  const maxQueries = Math.max(...allMatches.map(m => m.totalQueries), 1);

  return (
    <div className="historical-comparison">
      <div className="section-header"><span className="section-title">📈 Match-over-Match Comparison</span></div>

      {/* Comparison Chart */}
      <div className="comparison-chart">
        <div className="chart-label">Query Volume by Match</div>
        <div className="chart-bars-horizontal">
          {allMatches.map((match, i) => (
            <div key={match.id || 'current'} className={`chart-bar-row ${i === 0 ? 'current' : ''}`}>
              <div className="chart-bar-label">{match.label}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${(match.totalQueries / maxQueries) * 100}%`, background: i === 0 ? 'var(--accent-blue)' : 'rgba(99, 102, 241, 0.3)' }} />
              </div>
              <div className="chart-bar-value">{match.totalQueries.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Table */}
      <div className="comparison-table">
        <table className="trending-table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Queries</th>
              <th>Avg Response</th>
              <th>Anomalies</th>
              <th>Satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {allMatches.map((match, i) => (
              <tr key={match.id || 'current'} className={i === 0 ? 'highlight-row' : ''}>
                <td><strong>{match.label}</strong> {match.date && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{match.date}</span>}</td>
                <td>{match.totalQueries.toLocaleString()}</td>
                <td>{match.avgResponse}s</td>
                <td>{match.anomalies}</td>
                <td>
                  <span style={{ color: match.satisfaction >= 85 ? 'var(--accent-emerald)' : match.satisfaction >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                    {match.satisfaction}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Improvement metrics */}
      <div className="improvement-cards">
        <div className="improvement-card positive">
          <div className="improvement-value">↓ 25%</div>
          <div className="improvement-label">Response time vs avg</div>
        </div>
        <div className="improvement-card positive">
          <div className="improvement-value">↑ 8%</div>
          <div className="improvement-label">Satisfaction vs avg</div>
        </div>
        <div className="improvement-card positive">
          <div className="improvement-value">↓ 40%</div>
          <div className="improvement-label">Anomalies vs avg</div>
        </div>
      </div>
    </div>
  );
}
