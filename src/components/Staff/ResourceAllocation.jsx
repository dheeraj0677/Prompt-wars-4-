// Resource Allocation — staff deployment visualization
import { useState } from 'react';
import { ZONES } from '../../data/stadium';
import { useQueryStore } from '../../store/queryStore';

const STAFF_TYPES = [
  { type: 'security', icon: '🛡️', label: 'Security', color: '#ef4444' },
  { type: 'medical', icon: '🏥', label: 'Medical', color: '#10b981' },
  { type: 'cleaning', icon: '🧹', label: 'Cleaning', color: '#f59e0b' },
  { type: 'info', icon: 'ℹ️', label: 'Information', color: '#3b82f6' },
  { type: 'food', icon: '🍔', label: 'F&B Service', color: '#f97316' },
];

function generateDeployment() {
  const deployment = {};
  ZONES.forEach(zone => {
    deployment[zone.id] = {};
    STAFF_TYPES.forEach(st => {
      deployment[zone.id][st.type] = Math.floor(Math.random() * 5) + 1;
    });
  });
  return deployment;
}

export default function ResourceAllocation() {
  const [deployment] = useState(() => generateDeployment());
  const { zoneStats } = useQueryStore();

  const totalStaff = Object.values(deployment).reduce((sum, zone) =>
    sum + Object.values(zone).reduce((s, v) => s + v, 0), 0);

  const getStaffTotal = (zoneId) => Object.values(deployment[zoneId] || {}).reduce((s, v) => s + v, 0);

  const isUnderstaffed = (zoneId) => {
    const stat = zoneStats[zoneId];
    const staff = getStaffTotal(zoneId);
    return (stat?.level === 'critical' || stat?.level === 'high') && staff < 12;
  };

  return (
    <div className="resource-allocation">
      <div className="section-header">
        <span className="section-title">👥 Resource Allocation</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{totalStaff} staff deployed</span>
      </div>

      {/* Staff type legend */}
      <div className="staff-legend">
        {STAFF_TYPES.map(st => (
          <div key={st.type} className="staff-legend-item">
            <span>{st.icon}</span>
            <span style={{ color: st.color }}>{st.label}</span>
          </div>
        ))}
      </div>

      {/* Zone deployment */}
      <div className="deployment-grid">
        {ZONES.map(zone => {
          const understaffed = isUnderstaffed(zone.id);
          const stat = zoneStats[zone.id];
          return (
            <div key={zone.id} className={`deployment-zone ${understaffed ? 'understaffed' : ''}`}>
              <div className="deployment-zone-header">
                <span className="deployment-zone-name">{zone.shortName}</span>
                {understaffed && <span className="understaffed-badge">⚠️ Low</span>}
                <span className="deployment-zone-total">{getStaffTotal(zone.id)} staff</span>
              </div>
              <div className="deployment-staff-row">
                {STAFF_TYPES.map(st => (
                  <div key={st.type} className="staff-count" title={st.label}>
                    <span className="staff-icon">{st.icon}</span>
                    <span className="staff-num">{deployment[zone.id]?.[st.type] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="deployment-load">
                <span style={{ fontSize: 10, color: stat?.level === 'critical' ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                  Load: {stat?.count || 0} queries · {stat?.level || 'low'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
