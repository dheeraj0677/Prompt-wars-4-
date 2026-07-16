// Performance Metrics — AI response times, accuracy, system health
import { useQueryStore } from '../../store/queryStore';

export default function PerformanceMetrics() {
  const { queries } = useQueryStore();

  // Simulated performance data
  const metrics = {
    avgResponseTime: 1.2,
    p50ResponseTime: 0.9,
    p95ResponseTime: 2.8,
    p99ResponseTime: 4.1,
    intentAccuracy: 94.2,
    languageAccuracy: 97.8,
    uptime: 99.97,
    totalProcessed: queries.length,
    failedRequests: Math.floor(queries.length * 0.003),
    cacheHitRate: 34.5,
    concurrentUsers: 1247,
    peakConcurrent: 3892,
  };

  const responseDistribution = [
    { range: '<0.5s', count: 23, percent: 15 },
    { range: '0.5-1s', count: 41, percent: 27 },
    { range: '1-2s', count: 56, percent: 37 },
    { range: '2-3s', count: 21, percent: 14 },
    { range: '3-5s', count: 8, percent: 5 },
    { range: '>5s', count: 3, percent: 2 },
  ];
  const maxDist = Math.max(...responseDistribution.map(d => d.percent));

  const systemComponents = [
    { name: 'Claude API', status: 'operational', latency: '890ms', uptime: '99.95%' },
    { name: 'Intent Tagger', status: 'operational', latency: '120ms', uptime: '99.99%' },
    { name: 'Query Store', status: 'operational', latency: '2ms', uptime: '100%' },
    { name: 'Simulator', status: 'operational', latency: '1ms', uptime: '100%' },
    { name: 'WebSocket Feed', status: 'degraded', latency: '450ms', uptime: '99.2%' },
  ];

  return (
    <div className="performance-metrics">
      <div className="section-header"><span className="section-title">⚡ System Performance</span></div>

      {/* Response time KPIs */}
      <div className="perf-kpis">
        <div className="perf-kpi">
          <div className="perf-kpi-value">{metrics.avgResponseTime}s</div>
          <div className="perf-kpi-label">Avg Response</div>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-value">{metrics.p95ResponseTime}s</div>
          <div className="perf-kpi-label">P95 Latency</div>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-value">{metrics.intentAccuracy}%</div>
          <div className="perf-kpi-label">Intent Accuracy</div>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-value">{metrics.uptime}%</div>
          <div className="perf-kpi-label">Uptime</div>
        </div>
      </div>

      {/* Response time distribution */}
      <div className="perf-distribution">
        <div className="engagement-header"><span>⏱️ Response Time Distribution</span></div>
        <div className="dist-chart">
          {responseDistribution.map(d => (
            <div key={d.range} className="dist-bar-col">
              <div className="dist-bar" style={{ height: `${(d.percent / maxDist) * 100}%` }}>
                <span className="dist-bar-label">{d.percent}%</span>
              </div>
              <div className="dist-range">{d.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <div className="engagement-header"><span>🖥️ System Components</span></div>
        {systemComponents.map(comp => (
          <div key={comp.name} className="system-row">
            <span className={`status-dot ${comp.status}`} />
            <span className="system-name">{comp.name}</span>
            <span className="system-latency">{comp.latency}</span>
            <span className="system-uptime">{comp.uptime}</span>
            <span className={`system-status-badge ${comp.status}`}>
              {comp.status === 'operational' ? '✓ Operational' : '⚠ Degraded'}
            </span>
          </div>
        ))}
      </div>

      {/* Additional metrics */}
      <div className="perf-extras">
        <div className="perf-extra-item">
          <span>Concurrent Users</span>
          <span className="perf-extra-value">{metrics.concurrentUsers.toLocaleString()}</span>
        </div>
        <div className="perf-extra-item">
          <span>Peak Concurrent</span>
          <span className="perf-extra-value">{metrics.peakConcurrent.toLocaleString()}</span>
        </div>
        <div className="perf-extra-item">
          <span>Cache Hit Rate</span>
          <span className="perf-extra-value">{metrics.cacheHitRate}%</span>
        </div>
        <div className="perf-extra-item">
          <span>Failed Requests</span>
          <span className="perf-extra-value" style={{ color: 'var(--accent-red)' }}>{metrics.failedRequests}</span>
        </div>
      </div>
    </div>
  );
}
