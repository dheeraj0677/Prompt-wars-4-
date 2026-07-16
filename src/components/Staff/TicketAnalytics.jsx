// Ticket Analytics — sales heatmap, revenue, occupancy stats
import { useState } from 'react';
import StadiumBowlHeatmap from '../Shared/StadiumBowlHeatmap';
import { getStadiumTotals, getBestViewSections, SECTIONS, getSectionLiveData, PRICE_TIERS } from '../../data/sections';

export default function TicketAnalytics() {
  const [bowlMode, setBowlMode] = useState('tickets');
  const totals = getStadiumTotals();
  const bestViews = getBestViewSections(5);
  const liveData = getSectionLiveData();

  // Revenue by tier
  const revenueByTier = {};
  SECTIONS.forEach(sec => {
    const tier = sec.priceTier;
    if (!revenueByTier[tier]) revenueByTier[tier] = 0;
    revenueByTier[tier] += liveData[sec.id]?.revenue || 0;
  });
  const maxRevenue = Math.max(...Object.values(revenueByTier));

  return (
    <div className="ticket-analytics">
      <div className="section-header">
        <span className="section-title">🎟️ Ticket & Seating Analytics</span>
        <div className="bowl-mode-toggle">
          {[
            { mode: 'tickets', label: 'Occupancy' },
            { mode: 'view', label: 'View Rating' },
            { mode: 'price', label: 'Price Tier' },
          ].map(m => (
            <button key={m.mode} className={`mode-btn ${bowlMode === m.mode ? 'active' : ''}`} onClick={() => setBowlMode(m.mode)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="ticket-kpis">
        <div className="ticket-kpi">
          <div className="ticket-kpi-value">${(totals.totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="ticket-kpi-label">Total Revenue</div>
        </div>
        <div className="ticket-kpi">
          <div className="ticket-kpi-value">{totals.occupancyRate}%</div>
          <div className="ticket-kpi-label">Occupancy Rate</div>
        </div>
        <div className="ticket-kpi">
          <div className="ticket-kpi-value">${totals.avgTicketPrice}</div>
          <div className="ticket-kpi-label">Avg Ticket Price</div>
        </div>
        <div className="ticket-kpi">
          <div className="ticket-kpi-value">{totals.noShowRate}%</div>
          <div className="ticket-kpi-label">No-Show Rate</div>
        </div>
      </div>

      {/* Bowl Heatmap */}
      <StadiumBowlHeatmap mode={bowlMode} />

      {/* Best View Sections */}
      <div className="best-views">
        <div className="engagement-header" style={{ marginTop: 16 }}>
          <span>👁️ Best View Sections</span>
        </div>
        {bestViews.map((sec, i) => (
          <div key={sec.id} className="best-view-item">
            <span className="best-view-rank">#{i + 1}</span>
            <div className="best-view-info">
              <div className="best-view-name">{sec.name}</div>
              <div className="best-view-features">{sec.features.join(' · ')}</div>
            </div>
            <div className="best-view-rating">
              <span className="rating-value">{sec.viewRating}</span>
              <span className="rating-max">/10</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by Tier */}
      <div style={{ marginTop: 16 }}>
        <div className="engagement-header"><span>💰 Revenue by Tier</span></div>
        <div className="revenue-bars">
          {Object.entries(revenueByTier).sort((a, b) => b[1] - a[1]).map(([tier, revenue]) => (
            <div key={tier} className="revenue-bar-row">
              <span className="revenue-tier-name" style={{ color: PRICE_TIERS[tier]?.color }}>{PRICE_TIERS[tier]?.name || tier}</span>
              <div className="revenue-bar-track">
                <div className="revenue-bar-fill" style={{ width: `${(revenue / maxRevenue) * 100}%`, background: PRICE_TIERS[tier]?.color || '#3b82f6' }} />
              </div>
              <span className="revenue-bar-value">${(revenue / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
