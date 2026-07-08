import { useQueryStore } from '../../store/queryStore';

export default function AnomalyCards() {
  const { anomalies } = useQueryStore();

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">⚠️ Active Anomalies</span>
      </div>

      {anomalies.length === 0 ? (
        <div style={{
          padding: 'var(--sp-xl)',
          textAlign: 'center',
          color: 'var(--accent-emerald)',
          fontSize: 13,
          background: 'rgba(16, 185, 129, 0.06)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.15)'
        }}>
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
}
