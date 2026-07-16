import React from 'react';
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

const TrendingTable = React.memo(function TrendingTable() {
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

      <table className="trending-table" aria-label="Trending issues and volume signals">
        <caption className="sr-only">Table showing trending topics and their volume across different stadium zones</caption>
        <thead>
          <tr>
            <th scope="col">Topic Cluster</th>
            <th scope="col">Location</th>
            <th scope="col">Volume</th>
            <th scope="col">Velocity</th>
            <th scope="col">Staff Action</th>
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
              <td className="trending-volume">
                {item.count}
              </td>
              <td>
                <span className={`trending-velocity ${item.velocity > 0 ? 'positive' : item.velocity < 0 ? 'negative' : 'neutral'}`}>
                  {item.velocity > 0 ? '+' : ''}{item.velocity > 100 ? '↑ New' : `${item.velocity}%`}
                </span>
              </td>
              <td>
                <button className="staff-action-btn">
                  {item.velocity > 50 ? '🔔 Alert' : '👁️ Monitor'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default TrendingTable;
