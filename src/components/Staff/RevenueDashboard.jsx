// Revenue Dashboard — concession sales, merchandise, revenue breakdown
import { getStadiumTotals, SECTIONS, getSectionLiveData, PRICE_TIERS } from '../../data/sections';
import { FOOD_MENU } from '../../data/socialData';

export default function RevenueDashboard() {
  const totals = getStadiumTotals();

  // Simulate concession revenue
  const concessionRevenue = Math.round(totals.totalAttendance * 14.5);
  const merchRevenue = Math.round(totals.totalAttendance * 6.2);
  const parkingRevenue = Math.round(totals.totalAttendance * 1.8);
  const totalAllRevenue = totals.totalRevenue + concessionRevenue + merchRevenue + parkingRevenue;

  const revenueBreakdown = [
    { category: 'Tickets', value: totals.totalRevenue, icon: '🎟️', color: '#3b82f6' },
    { category: 'Concessions', value: concessionRevenue, icon: '🍔', color: '#f59e0b' },
    { category: 'Merchandise', value: merchRevenue, icon: '👕', color: '#8b5cf6' },
    { category: 'Parking', value: parkingRevenue, icon: '🅿️', color: '#10b981' },
  ];

  // Top selling items (simulated)
  const topItems = FOOD_MENU.filter(f => f.popular).map(item => ({
    ...item, unitsSold: Math.floor(Math.random() * 500 + 200), revenue: 0,
  })).map(item => ({ ...item, revenue: item.unitsSold * item.price })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const maxItemRev = Math.max(...topItems.map(i => i.revenue));

  return (
    <div className="revenue-dashboard">
      <div className="section-header">
        <span className="section-title">💰 Revenue Intelligence</span>
      </div>

      {/* Total revenue */}
      <div className="revenue-total">
        <div className="revenue-total-value">${(totalAllRevenue / 1000000).toFixed(2)}M</div>
        <div className="revenue-total-label">Total Event Revenue</div>
        <div className="revenue-total-compare">↑ 12% vs. last match</div>
      </div>

      {/* Breakdown */}
      <div className="revenue-breakdown">
        {revenueBreakdown.map(item => (
          <div key={item.category} className="revenue-break-item">
            <div className="revenue-break-header">
              <span>{item.icon} {item.category}</span>
              <span style={{ color: item.color, fontWeight: 700 }}>${(item.value / 1000).toFixed(0)}K</span>
            </div>
            <div className="revenue-break-bar">
              <div className="revenue-break-fill" style={{ width: `${(item.value / totalAllRevenue) * 100}%`, background: item.color }} />
            </div>
            <div className="revenue-break-percent">{Math.round((item.value / totalAllRevenue) * 100)}% of total</div>
          </div>
        ))}
      </div>

      {/* Per-Fan metric */}
      <div className="revenue-perfan">
        <div className="perfan-item">
          <span className="perfan-value">${Math.round(totalAllRevenue / totals.totalAttendance)}</span>
          <span className="perfan-label">Revenue per Fan</span>
        </div>
        <div className="perfan-item">
          <span className="perfan-value">${Math.round(concessionRevenue / totals.totalAttendance)}</span>
          <span className="perfan-label">Spend per Fan (F&B)</span>
        </div>
      </div>

      {/* Top selling items */}
      <div className="engagement-header" style={{ marginTop: 16 }}><span>🏆 Top Selling Items</span></div>
      <div className="top-items">
        {topItems.map((item, i) => (
          <div key={item.id} className="top-item-row">
            <span className="top-item-rank">#{i + 1}</span>
            <span className="top-item-emoji">{item.emoji}</span>
            <div className="top-item-info">
              <div className="top-item-name">{item.name}</div>
              <div className="top-item-sold">{item.unitsSold} sold</div>
            </div>
            <div className="top-item-bar-container">
              <div className="top-item-bar" style={{ width: `${(item.revenue / maxItemRev) * 100}%` }} />
            </div>
            <span className="top-item-revenue">${(item.revenue / 1000).toFixed(1)}K</span>
          </div>
        ))}
      </div>
    </div>
  );
}
