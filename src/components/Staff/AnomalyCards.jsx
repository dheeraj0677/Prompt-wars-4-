import React from 'react';
import { useQueryStore } from '../../store/queryStore';

const AnomalyCards = React.memo(function AnomalyCards() {
  const { anomalies } = useQueryStore();

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div aria-live="polite" aria-atomic="true">
      <div className="section-header">
        <span className="section-title">⚠️ Active Anomalies</span>
      </div>

      {anomalies.length === 0 ? (
        <div className="all-clear-box">
          ✅ All zones operating within normal parameters
        </div>
      ) : (
        <div className="anomaly-list">
          {anomalies.slice(0, 4).map((anomaly) => (
            <div
              key={anomaly.id}
              className={`anomaly-card ${anomaly.severity === 'warning' ? 'warning' : ''}`}
            >
              <div className="anomaly-header">
                <span className="anomaly-type">
                  {anomaly.severity === 'critical' ? '🔴' : '🟡'} {anomaly.type}
                </span>
                <span className="anomaly-time">{formatTime(anomaly.timestamp)}</span>
              </div>
              <div className="anomaly-description">{anomaly.description}</div>
              <div className="anomaly-footer">
                <span className="anomaly-zone-tag">{anomaly.zoneName}</span>
                <span>Auto-detected Anomaly</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AnomalyCards;
