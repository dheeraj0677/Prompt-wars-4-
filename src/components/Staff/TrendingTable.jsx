import { useQueryStore } from '../../store/queryStore';

const INTENT_ICONS = {
  wayfinding: '🧭',
  accessibility: '♿',
  transport: '🚌',
  food_drink: '🍔',
  restroom: '🚻',
  safety: '🛡️',
  emergency: '🚨',
  lost_found: '📦',
  schedule: '⏱️',
  general: '💬',
};

export default function TrendingTable() {
  const { trending } = useQueryStore();

  if (trending.length === 0) {
    return (
      <div className="trending-container">
        <div className="section-header">
          <span className="section-title">📈 Trending Issues & Volume Signals</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Collecting data... Trends will appear shortly.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-container">
      <div className="section-header">
        <span className="section-title">📈 Trending Issues & Volume Signals</span>
      </div>

      <table className="trending-table">
        <thead>
          <tr>
            <th>Topic Cluster</th>
            <th>Location</th>
            <th>Volume</th>
            <th>Velocity</th>
          </tr>
        </thead>
        <tbody>
          {trending.map((item, i) => (
            <tr key={i}>
              <td>
                <div className="trending-topic">
                  <span className="trending-topic-icon">{INTENT_ICONS[item.intent] || '💬'}</span>
                  {item.label}
                </div>
              </td>
              <td>
                <span className="trending-zone-badge">{item.zoneName}</span>
              </td>
              <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {item.count}
              </td>
              <td>
                <span className={`trending-velocity ${item.velocity > 0 ? 'positive' : item.velocity < 0 ? 'negative' : 'neutral'}`}>
                  {item.velocity > 0 ? '+' : ''}{item.velocity > 100 ? '↑ New' : `${item.velocity}%`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
