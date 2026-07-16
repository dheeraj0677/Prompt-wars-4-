import React from 'react';
import { useQueryStore } from '../../store/queryStore';

const KPIBar = React.memo(function KPIBar() {
  const { totalFanCount, recentQueryCount, avgLatency, anomalies } = useQueryStore();

  const kpis = React.useMemo(() => [
    {
      icon: '👥',
      label: 'Total Active Fans',
      value: totalFanCount.toLocaleString(),
    },
    {
      icon: '💬',
      label: 'Fan Queries (Last 15m)',
      value: recentQueryCount.toLocaleString(),
    },
    {
      icon: '📈',
      label: 'Response Latency',
      value: `${avgLatency}s`,
    },
    {
      icon: '⚠️',
      label: 'Active Anomalies',
      value: anomalies.length.toString().padStart(2, '0'),
    },
  ], [totalFanCount, recentQueryCount, avgLatency, anomalies.length]);

  return (
    <div className="kpi-bar">
      {kpis.map((kpi, i) => (
        <div key={i} className="kpi-card">
          <div className="kpi-icon">{kpi.icon}</div>
          <div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" aria-live="polite" aria-atomic="true">{kpi.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default KPIBar;
