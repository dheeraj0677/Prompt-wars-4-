import React from 'react';
import { useQueryStore } from '../../store/queryStore';

const StadiumMap = React.memo(function StadiumMap() {
  const { fanLocation, setFanLocation, zoneStats } = useQueryStore();

  const getZoneColor = (zoneId) => {
    const stat = zoneStats[zoneId];
    if (!stat) return 'rgba(59, 130, 246, 0.3)';
    switch (stat.level) {
      case 'critical': return 'rgba(239, 68, 68, 0.5)';
      case 'high': return 'rgba(59, 130, 246, 0.45)';
      case 'med': return 'rgba(245, 158, 11, 0.4)';
      default: return 'rgba(16, 185, 129, 0.3)';
    }
  };

  const getZoneBorder = (zoneId) => {
    const stat = zoneStats[zoneId];
    if (!stat) return 'rgba(59, 130, 246, 0.5)';
    switch (stat.level) {
      case 'critical': return 'rgba(239, 68, 68, 0.8)';
      case 'high': return 'rgba(59, 130, 246, 0.7)';
      case 'med': return 'rgba(245, 158, 11, 0.6)';
      default: return 'rgba(16, 185, 129, 0.5)';
    }
  };

  // Stadium layout positions (in SVG viewport units)
  const zonePositions = [
    { id: 'gate-a', x: 20, y: 8, w: 80, h: 44, label: 'GATE A' },
    { id: 'west-concourse', x: 110, y: 8, w: 80, h: 44, label: 'W. CONCOURSE' },
    { id: 'section-102', x: 200, y: 8, w: 80, h: 44, label: 'SEC 102' },
    { id: 'gate-b', x: 20, y: 62, w: 80, h: 44, label: 'GATE B' },
    { id: 'east-plaza', x: 110, y: 62, w: 80, h: 44, label: 'E. PLAZA' },
    { id: 'section-108', x: 200, y: 62, w: 80, h: 44, label: 'SEC 108' },
    { id: 'vip-lounge', x: 20, y: 116, w: 80, h: 44, label: 'VIP LOUNGE' },
    { id: 'food-court', x: 110, y: 116, w: 80, h: 44, label: 'FOOD COURT' },
    { id: 'gate-c', x: 200, y: 116, w: 80, h: 44, label: 'GATE C' },
  ];

  return (
    <div className="stadium-map-container">
      <svg viewBox="0 0 300 175" className="stadium-map-svg" role="img" aria-label="Interactive stadium map showing 9 zones with live congestion levels. Click or press Enter on a zone to set your location.">
        {/* Background field */}
        <defs>
          <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#0c1e3a" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="300" height="175" fill="url(#fieldGrad)" />

        {/* Pitch outline in center (decorative) */}
        <ellipse cx="150" cy="88" rx="25" ry="15" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" />
        <line x1="150" y1="73" x2="150" y2="103" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="0.5" />

        {/* Stadium label headers */}
        <text x="150" y="5" fill="rgba(255,255,255,0.2)" fontSize="4" fontWeight="700" textAnchor="middle" fontFamily="Outfit, sans-serif" letterSpacing="2">
          NORTH STANDS
        </text>
        <text x="150" y="173" fill="rgba(255,255,255,0.2)" fontSize="4" fontWeight="700" textAnchor="middle" fontFamily="Outfit, sans-serif" letterSpacing="2">
          SOUTH STANDS
        </text>

        {/* Zone rectangles */}
        {zonePositions.map((pos) => {
          const isActive = pos.id === fanLocation;
          const stat = zoneStats[pos.id];
          const levelLabel = stat?.level || 'low';
          
          return (
            <g
              key={pos.id}
              className={`map-zone ${isActive ? 'active' : ''}`}
              onClick={() => setFanLocation(pos.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFanLocation(pos.id); } }}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              aria-label={`${pos.label} — ${stat?.count || 0} queries, congestion ${levelLabel}${isActive ? ', your current location' : ''}`}
              aria-pressed={isActive}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx="4"
                ry="4"
                fill={getZoneColor(pos.id)}
                stroke={isActive ? '#60a5fa' : getZoneBorder(pos.id)}
                strokeWidth={isActive ? '2' : '1'}
                filter={isActive ? 'url(#glow)' : undefined}
              />
              
              {/* Zone label */}
              <text
                x={pos.x + pos.w / 2}
                y={pos.y + pos.h / 2 - 5}
                className="map-zone-label"
                fontSize="6"
              >
                {pos.label}
              </text>
              
              {/* Query count */}
              <text
                x={pos.x + pos.w / 2}
                y={pos.y + pos.h / 2 + 8}
                fill="white"
                fontSize="10"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="Outfit, sans-serif"
              >
                {stat?.count || 0}
              </text>

              {/* Active indicator */}
              {isActive && (
                <>
                  <rect
                    x={pos.x + pos.w - 30}
                    y={pos.y + 3}
                    width="27"
                    height="10"
                    rx="5"
                    fill="#3b82f6"
                  />
                  <text
                    x={pos.x + pos.w - 16.5}
                    y={pos.y + 10}
                    fill="white"
                    fontSize="5"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    YOU
                  </text>
                </>
              )}

              {/* Status dot */}
              <circle
                cx={pos.x + pos.w - 5}
                cy={pos.y + pos.h - 5}
                r="3"
                fill={
                  stat?.level === 'critical' ? '#ef4444' :
                  stat?.level === 'high' ? '#3b82f6' :
                  stat?.level === 'med' ? '#f59e0b' : '#10b981'
                }
              >
                {stat?.level === 'critical' && (
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                )}
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

export default StadiumMap;
