// Predictive Crowd Flow — AI predictions with animated flow visualization
import { useQueryStore } from '../../store/queryStore';
import { ZONES } from '../../data/stadium';

export default function PredictiveFlow() {
  const { zoneStats } = useQueryStore();

  // Generate predictions based on current data
  const predictions = ZONES.map(zone => {
    const stat = zoneStats[zone.id];
    const current = stat?.count || 0;
    const trend = stat?.velocity || 0;
    const predicted15 = Math.max(0, Math.round(current * (1 + trend / 200) + Math.random() * 3));
    const predicted30 = Math.max(0, Math.round(predicted15 * (1 + trend / 300) + Math.random() * 5));

    let risk = 'low';
    if (predicted30 > 20) risk = 'critical';
    else if (predicted30 > 14) risk = 'high';
    else if (predicted30 > 8) risk = 'medium';

    return { zone, current, predicted15, predicted30, trend, risk };
  }).sort((a, b) => b.predicted30 - a.predicted30);

  const riskColor = { low: 'var(--accent-emerald)', medium: 'var(--accent-amber)', high: 'var(--accent-orange)', critical: 'var(--accent-red)' };
  const maxPredicted = Math.max(...predictions.map(p => p.predicted30), 1);

  return (
    <div className="predictive-flow">
      <div className="section-header">
        <span className="section-title">🔮 Predictive Crowd Flow</span>
      </div>

      <div className="prediction-info">AI-powered crowd movement forecast based on real-time query patterns</div>

      {/* Prediction bars */}
      <div className="prediction-chart">
        <div className="prediction-header-row">
          <span className="pred-col-zone">Zone</span>
          <span className="pred-col">Now</span>
          <span className="pred-col">+15m</span>
          <span className="pred-col">+30m</span>
          <span className="pred-col">Risk</span>
        </div>
        {predictions.slice(0, 9).map(pred => (
          <div key={pred.zone.id} className="prediction-row">
            <span className="pred-zone-name">{pred.zone.shortName}</span>
            <span className="pred-value">{pred.current}</span>
            <span className="pred-value">{pred.predicted15}</span>
            <div className="pred-bar-cell">
              <div className="pred-bar" style={{ width: `${(pred.predicted30 / maxPredicted) * 100}%`, background: riskColor[pred.risk] }}>
                {pred.predicted30}
              </div>
            </div>
            <span className="pred-risk" style={{ color: riskColor[pred.risk] }}>
              {pred.risk === 'critical' ? '🔴' : pred.risk === 'high' ? '🟠' : pred.risk === 'medium' ? '🟡' : '🟢'} {pred.risk}
            </span>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="prediction-recommendation">
        <div className="pred-rec-header">💡 AI Recommendations</div>
        <ul className="pred-rec-list">
          {predictions.filter(p => p.risk === 'critical' || p.risk === 'high').slice(0, 3).map(p => (
            <li key={p.zone.id}>
              <strong>{p.zone.name}</strong>: Expected {p.predicted30} query load in 30 min. {p.risk === 'critical' ? 'Deploy additional staff immediately.' : 'Monitor closely and prepare overflow routes.'}
            </li>
          ))}
          {predictions.filter(p => p.risk === 'critical' || p.risk === 'high').length === 0 && (
            <li>All zones predicted to remain within normal parameters for the next 30 minutes.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
