// Stadium Bowl Heatmap — SVG bird's-eye view of full stadium with 24 sections
import { SECTIONS, getSectionLiveData, PRICE_TIERS } from '../../data/sections';
import { useState } from 'react';

const DENSITY_COLORS = {
  low: { fill: 'rgba(16, 185, 129, 0.5)', stroke: 'rgba(16, 185, 129, 0.8)' },
  medium: { fill: 'rgba(245, 158, 11, 0.5)', stroke: 'rgba(245, 158, 11, 0.8)' },
  high: { fill: 'rgba(249, 115, 22, 0.55)', stroke: 'rgba(249, 115, 22, 0.8)' },
  critical: { fill: 'rgba(239, 68, 68, 0.6)', stroke: 'rgba(239, 68, 68, 0.9)' },
};

const VIEW_COLORS = (rating) => {
  if (rating >= 9.5) return { fill: 'rgba(234, 179, 8, 0.7)', stroke: '#eab308' };
  if (rating >= 9.0) return { fill: 'rgba(245, 158, 11, 0.55)', stroke: '#f59e0b' };
  if (rating >= 8.5) return { fill: 'rgba(59, 130, 246, 0.5)', stroke: '#3b82f6' };
  if (rating >= 8.0) return { fill: 'rgba(6, 182, 212, 0.45)', stroke: '#06b6d4' };
  if (rating >= 7.5) return { fill: 'rgba(16, 185, 129, 0.4)', stroke: '#10b981' };
  return { fill: 'rgba(100, 116, 139, 0.35)', stroke: '#64748b' };
};

const PRICE_COLORS = (tier) => {
  const c = PRICE_TIERS[tier];
  if (!c) return { fill: 'rgba(100, 116, 139, 0.3)', stroke: '#64748b' };
  return { fill: `${c.color}66`, stroke: c.color };
};

// Generate section path positions around an oval
function getSectionPath(angle, tier, index) {
  const cx = 250, cy = 175;
  const rad = (angle - 90) * (Math.PI / 180);

  let rx, ry, w, h;
  if (tier === 'LOWER') { rx = 110; ry = 75; w = 50; h = 28; }
  else if (tier === 'UPPER') { rx = 175; ry = 120; w = 60; h = 28; }
  else { rx = 140; ry = 95; w = 45; h = 22; } // VIP

  const x = cx + rx * Math.cos(rad) - w / 2;
  const y = cy + ry * Math.sin(rad) - h / 2;

  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

export default function StadiumBowlHeatmap({ mode = 'density', onSectionClick, highlightSection }) {
  const [hoveredSection, setHoveredSection] = useState(null);
  const liveData = getSectionLiveData();

  const getColor = (section) => {
    const data = liveData[section.id];
    switch (mode) {
      case 'view': return VIEW_COLORS(section.viewRating);
      case 'tickets': {
        const occ = data?.occupancy || 0;
        if (occ >= 95) return { fill: 'rgba(239, 68, 68, 0.6)', stroke: '#ef4444' };
        if (occ >= 85) return { fill: 'rgba(249, 115, 22, 0.5)', stroke: '#f97316' };
        if (occ >= 70) return { fill: 'rgba(245, 158, 11, 0.45)', stroke: '#f59e0b' };
        return { fill: 'rgba(16, 185, 129, 0.4)', stroke: '#10b981' };
      }
      case 'price': return PRICE_COLORS(section.priceTier);
      default: return DENSITY_COLORS[data?.crowdDensity || 'low'];
    }
  };

  const getModeLabel = (section) => {
    const data = liveData[section.id];
    switch (mode) {
      case 'view': return section.viewRating.toFixed(1);
      case 'tickets': return `${data?.occupancy || 0}%`;
      case 'price': return `$${PRICE_TIERS[section.priceTier]?.basePrice || 0}`;
      default: return data?.currentAttendance?.toLocaleString() || '0';
    }
  };

  const modeTitle = {
    density: 'Crowd Density',
    view: 'View Quality Rating',
    tickets: 'Ticket Sales / Occupancy',
    price: 'Price Tier',
  }[mode];

  return (
    <div className="bowl-heatmap-container">
      <div className="bowl-header">
        <span className="section-title">🏟️ {modeTitle}</span>
      </div>
      <div className="bowl-svg-wrapper">
        <svg viewBox="0 0 500 350" className="bowl-svg">
          <defs>
            <radialGradient id="pitchGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#166534" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14532d" stopOpacity="0.3" />
            </radialGradient>
            <filter id="bowlGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Stadium outer ring */}
          <ellipse cx="250" cy="175" rx="230" ry="160" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Pitch */}
          <ellipse cx="250" cy="175" rx="70" ry="45" fill="url(#pitchGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          {/* Pitch markings */}
          <line x1="250" y1="130" x2="250" y2="220" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <circle cx="250" cy="175" r="12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          {/* Goal areas */}
          <rect x="180" y="162" width="15" height="26" rx="2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
          <rect x="305" y="162" width="15" height="26" rx="2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />

          {/* Section blocks */}
          {SECTIONS.map((section) => {
            const pos = getSectionPath(section.angle, section.tier);
            const color = getColor(section);
            const isHovered = hoveredSection === section.id;
            const isHighlight = highlightSection === section.id;

            return (
              <g
                key={section.id}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => onSectionClick?.(section)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={pos.h}
                  rx="4"
                  fill={color.fill}
                  stroke={isHighlight ? '#60a5fa' : color.stroke}
                  strokeWidth={isHovered || isHighlight ? '2' : '1'}
                  filter={isHovered ? 'url(#bowlGlow)' : undefined}
                  opacity={isHovered ? 1 : 0.85}
                />
                {/* Section ID */}
                <text x={pos.cx} y={pos.cy - 4} fill="white" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="Outfit, sans-serif" opacity="0.9">
                  {section.id}
                </text>
                {/* Value */}
                <text x={pos.cx} y={pos.cy + 8} fill="white" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="Outfit, sans-serif">
                  {getModeLabel(section)}
                </text>
              </g>
            );
          })}

          {/* Pitch label */}
          <text x="250" y="178" fill="rgba(255,255,255,0.25)" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Outfit" letterSpacing="3">
            PITCH
          </text>

          {/* Cardinal labels */}
          <text x="250" y="12" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="Outfit" fontWeight="600" letterSpacing="2">NORTH</text>
          <text x="250" y="345" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="Outfit" fontWeight="600" letterSpacing="2">SOUTH</text>
          <text x="12" y="178" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="Outfit" fontWeight="600" letterSpacing="2" transform="rotate(-90, 12, 178)">WEST</text>
          <text x="488" y="178" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="Outfit" fontWeight="600" letterSpacing="2" transform="rotate(90, 488, 178)">EAST</text>
        </svg>

        {/* Tooltip */}
        {hoveredSection && (() => {
          const sec = SECTIONS.find(s => s.id === hoveredSection);
          const data = liveData[hoveredSection];
          if (!sec || !data) return null;
          return (
            <div className="bowl-tooltip">
              <div className="bowl-tooltip-title">{sec.name}</div>
              <div className="bowl-tooltip-tier">{sec.tier} · {PRICE_TIERS[sec.priceTier]?.name}</div>
              <div className="bowl-tooltip-stats">
                <span>👁️ View: {sec.viewRating}/10</span>
                <span>👥 {data.occupancy}% occupied</span>
                <span>🌡️ {data.temperature}°C</span>
                <span>🔊 {data.noiseLevel} dB</span>
                <span>🎟️ {data.ticketsAvailable} available</span>
              </div>
              {sec.features.length > 0 && (
                <div className="bowl-tooltip-features">
                  {sec.features.map(f => <span key={f} className="bowl-feature-tag">✨ {f}</span>)}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="bowl-legend">
        {mode === 'density' && ['low', 'medium', 'high', 'critical'].map(level => (
          <div key={level} className="bowl-legend-item">
            <div className="bowl-legend-dot" style={{ background: DENSITY_COLORS[level].fill.replace('0.5', '1').replace('0.55', '1').replace('0.6', '1') }} />
            <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
          </div>
        ))}
        {mode === 'view' && ['9.5+ Gold', '9.0+ Amber', '8.5+ Blue', '8.0+ Cyan', '7.5+ Green', '<7.5 Grey'].map((label, i) => (
          <div key={i} className="bowl-legend-item">
            <div className="bowl-legend-dot" style={{ background: ['#eab308', '#f59e0b', '#3b82f6', '#06b6d4', '#10b981', '#64748b'][i] }} />
            <span>{label}</span>
          </div>
        ))}
        {mode === 'tickets' && ['95%+ Sold Out', '85%+ Hot', '70%+ Filling', '<70% Available'].map((label, i) => (
          <div key={i} className="bowl-legend-item">
            <div className="bowl-legend-dot" style={{ background: ['#ef4444', '#f97316', '#f59e0b', '#10b981'][i] }} />
            <span>{label}</span>
          </div>
        ))}
        {mode === 'price' && Object.entries(PRICE_TIERS).map(([key, tier]) => (
          <div key={key} className="bowl-legend-item">
            <div className="bowl-legend-dot" style={{ background: tier.color }} />
            <span>{tier.name} (${tier.basePrice})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
