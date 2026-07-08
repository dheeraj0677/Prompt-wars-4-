import { useQueryStore } from '../../store/queryStore';

export default function KPIBar() {
  const { totalFanCount, recentQueryCount, avgLatency, anomalies } = useQueryStore();

  const kpis = [
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
  ];

  return (
    <div className="kpi-bar">
      {kpis.map((kpi, i) => (
        <div key={i} className="kpi-card">
          <div className="kpi-icon">{kpi.icon}</div>
          <div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
