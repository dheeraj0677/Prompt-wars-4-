import { useQueryStore } from '../../store/queryStore';
import { ZONES, ZONE_MAP } from '../../data/stadium';
import StadiumMap from './StadiumMap';

export default function Sidebar() {
  const { fanLocation, setFanLocation, zoneStats, anomalies } = useQueryStore();
  const currentZone = ZONE_MAP[fanLocation];

  // Find nearby anomalies for safety notice
  const nearbyAnomalies = anomalies.filter(a => {
    if (a.zoneId === fanLocation) return true;
    const zone = ZONE_MAP[fanLocation];
    return zone?.adjacent?.includes(a.zoneId);
  });

  // Compute fastest exit
  const gates = ZONES.filter(z => z.type === 'gate');
  const fastestGate = gates
    .map(g => ({ ...g, load: zoneStats[g.id]?.count || 0 }))
    .sort((a, b) => a.load - b.load)[0];

  return (
    <div className="fan-sidebar">
      {/* Live Stadium Map */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="sidebar-card-title">🏟️ Live Stadium Map</span>
          <span className="sidebar-card-badge">SEC 112</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 'var(--sp-md)' }}>
          Navigating from your current position at <strong style={{ color: 'var(--text-primary)' }}>{currentZone?.name}</strong>
        </p>
        <StadiumMap />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-md)' }}>
          <div className="map-legend">
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            <span>Location Tracking Active</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-accent)', cursor: 'pointer', fontWeight: 500 }}>
            Recenter Map &rsaquo;
          </span>
        </div>
        <div style={{ marginTop: 'var(--sp-md)' }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Set Your Location
          </label>
          <select
            className="location-select"
            value={fanLocation}
            onChange={(e) => setFanLocation(e.target.value)}
          >
            {ZONES.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="quick-info-grid">
        <div className="quick-info-card">
          <div className="quick-info-icon">🧭</div>
          <div className="quick-info-title">Fastest Exit</div>
          <div className="quick-info-text">
            {fastestGate?.name} is currently at low capacity ({zoneStats[fastestGate?.id]?.count || 0} queries).
          </div>
        </div>
        <div className="quick-info-card">
          <div className="quick-info-icon">♿</div>
          <div className="quick-info-title">Assistance</div>
          <div className="quick-info-text">
            {currentZone?.accessibility.elevator
              ? `${currentZone.accessibility.elevator} is priority-reserved for accessibility guests.`
              : 'Ramp access available at this zone.'}
          </div>
        </div>
      </div>

      {/* Match Schedule */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="sidebar-card-title">⏱️ Match Schedule</span>
        </div>
        <div className="schedule-item">
          <div className="schedule-time">
            <div className="schedule-time-label">Start</div>
            <div className="schedule-time-value">20:00</div>
          </div>
          <div className="schedule-details">
            <h4>Kick-off</h4>
            <p>Stadium opening 18:00</p>
          </div>
          <span className="schedule-status on-time">On Time</span>
        </div>
        <div className="schedule-item">
          <div className="schedule-time">
            <div className="schedule-time-label">End</div>
            <div className="schedule-time-value">21:55</div>
          </div>
          <div className="schedule-details">
            <h4>Final Whistle</h4>
            <p>Transport priority starts</p>
          </div>
        </div>
      </div>

      {/* Safety Notice (if anomalies nearby) */}
      {nearbyAnomalies.length > 0 && (
        <div className="safety-notice">
          <div className="safety-notice-header">
            <span>🚨</span> Safety Notice
          </div>
          <div className="safety-notice-text">
            {nearbyAnomalies[0].description} Please use Gate B or C for faster stadium entry.
          </div>
        </div>
      )}

      {/* Transport Info */}
      {currentZone?.transport && (
        <div className="sidebar-card">
          <div className="sidebar-card-header">
            <span className="sidebar-card-title">🚌 Transport</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(currentZone.transport)
              .filter(([, v]) => v)
              .map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600, textTransform: 'capitalize', minWidth: 60 }}>
                    {key}:
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
