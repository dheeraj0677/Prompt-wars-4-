// Accessibility Dashboard — compliance, query tracking, service metrics
import { useQueryStore } from '../../store/queryStore';

const ACCESSIBILITY_FEATURES = [
  { id: 'elevators', name: 'Elevators', icon: '🛗', total: 12, operational: 11, usage: 234 },
  { id: 'ramps', name: 'Wheelchair Ramps', icon: '♿', total: 24, operational: 24, usage: 167 },
  { id: 'sensory', name: 'Sensory Rooms', icon: '🤫', total: 4, operational: 4, usage: 45 },
  { id: 'audio', name: 'Audio Description', icon: '🎧', total: 8, operational: 8, usage: 89 },
  { id: 'signage', name: 'Braille Signage', icon: '📝', total: 48, operational: 47, usage: null },
  { id: 'companion', name: 'Companion Seats', icon: '💺', total: 320, operational: 318, usage: 287 },
];

const COMPLIANCE_ZONES = [
  { zone: 'Gate A', score: 98, issues: 0 },
  { zone: 'Gate B', score: 95, issues: 1 },
  { zone: 'Gate C', score: 88, issues: 2 },
  { zone: 'W. Concourse', score: 92, issues: 1 },
  { zone: 'E. Plaza', score: 96, issues: 0 },
  { zone: 'Food Court', score: 85, issues: 3 },
  { zone: 'VIP Lounge', score: 100, issues: 0 },
  { zone: 'Section 102', score: 94, issues: 1 },
  { zone: 'Section 108', score: 91, issues: 1 },
];

export default function AccessibilityDashboard() {
  const { queries } = useQueryStore();

  const accessibilityQueries = queries.filter(q => q.intent === 'accessibility');
  const totalAccessQueries = accessibilityQueries.length;
  const avgComplianceScore = Math.round(COMPLIANCE_ZONES.reduce((s, z) => s + z.score, 0) / COMPLIANCE_ZONES.length);
  const totalIssues = COMPLIANCE_ZONES.reduce((s, z) => s + z.issues, 0);

  return (
    <div className="accessibility-dashboard">
      <div className="section-header"><span className="section-title">♿ Accessibility & Inclusion</span></div>

      {/* KPIs */}
      <div className="access-kpis">
        <div className="access-kpi">
          <div className="access-kpi-value" style={{ color: avgComplianceScore >= 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{avgComplianceScore}%</div>
          <div className="access-kpi-label">Overall Compliance</div>
        </div>
        <div className="access-kpi">
          <div className="access-kpi-value">{totalAccessQueries}</div>
          <div className="access-kpi-label">Accessibility Queries</div>
        </div>
        <div className="access-kpi">
          <div className="access-kpi-value" style={{ color: totalIssues === 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>{totalIssues}</div>
          <div className="access-kpi-label">Active Issues</div>
        </div>
        <div className="access-kpi">
          <div className="access-kpi-value">97%</div>
          <div className="access-kpi-label">Resolution Rate</div>
        </div>
      </div>

      {/* Feature Status */}
      <div className="access-features">
        <div className="engagement-header"><span>🏗️ Facility Status</span></div>
        <div className="feature-grid">
          {ACCESSIBILITY_FEATURES.map(feat => (
            <div key={feat.id} className="feature-card">
              <div className="feature-icon">{feat.icon}</div>
              <div className="feature-info">
                <div className="feature-name">{feat.name}</div>
                <div className="feature-status">
                  <span style={{ color: feat.operational === feat.total ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    {feat.operational}/{feat.total} active
                  </span>
                  {feat.usage !== null && <span className="feature-usage">· {feat.usage} uses today</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance by Zone */}
      <div className="compliance-zones">
        <div className="engagement-header" style={{ marginTop: 16 }}><span>📋 Compliance by Zone</span></div>
        {COMPLIANCE_ZONES.map(zone => (
          <div key={zone.zone} className="compliance-row">
            <span className="compliance-zone-name">{zone.zone}</span>
            <div className="compliance-bar-track">
              <div className="compliance-bar-fill" style={{
                width: `${zone.score}%`,
                background: zone.score >= 95 ? 'var(--accent-emerald)' : zone.score >= 85 ? 'var(--accent-amber)' : 'var(--accent-red)',
              }} />
            </div>
            <span className="compliance-score" style={{
              color: zone.score >= 95 ? 'var(--accent-emerald)' : zone.score >= 85 ? 'var(--accent-amber)' : 'var(--accent-red)',
            }}>{zone.score}%</span>
            {zone.issues > 0 && <span className="compliance-issues">⚠️ {zone.issues}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
