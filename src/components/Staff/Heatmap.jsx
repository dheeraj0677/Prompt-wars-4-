import React from 'react';
import { useQueryStore } from '../../store/queryStore';
import { ZONES } from '../../data/stadium';

const Heatmap = React.memo(function Heatmap() {
  const { zoneStats } = useQueryStore();

  return (
    <div className="heatmap-container">
      <div className="section-header">
        <span className="section-title">🏟️ Stadium Live Query Heatmap</span>
        <span className="real-time-badge" aria-label="Real-time density indicator">
          Real-time Density
        </span>
      </div>

      <div className="heatmap-grid">
        {ZONES.map((zone) => {
          const stat = zoneStats[zone.id];
          const level = stat?.level || 'low';

          return (
            <div key={zone.id} className={`heatmap-zone level-${level}`}>
              <div className={`heatmap-zone-dot ${level}`} />
              <div className="heatmap-zone-name">{zone.shortName}</div>
              <div className="heatmap-zone-count">{stat?.count || 0}</div>
            </div>
          );
        })}
      </div>

      <div className="heatmap-footer">
        <div className="heatmap-legend">
          {[
            { label: 'Low', color: 'var(--zone-low)' },
            { label: 'Med', color: 'var(--zone-med)' },
            { label: 'High', color: 'var(--zone-high)' },
            { label: 'Critical', color: 'var(--zone-critical)' },
          ].map(item => (
            <div key={item.label} className="heatmap-legend-item">
              <div className="heatmap-legend-dot" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <span className="explore-link">
          🧭 Explore Layers
        </span>
      </div>
    </div>
  );
});

export default Heatmap;
