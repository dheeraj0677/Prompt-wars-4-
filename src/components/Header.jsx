import { useQueryStore } from '../store/queryStore';

export default function Header() {
  const { activeView, setView, queries, anomalies } = useQueryStore();

  return (
    <header className="header">
      <div className="header-left">
        <nav className="view-toggle" role="navigation" aria-label="Main view navigation">
          <button
            className={activeView === 'fan' ? 'active' : ''}
            onClick={() => setView('fan')}
            aria-current={activeView === 'fan' ? 'page' : undefined}
            aria-label="Switch to Fan View"
          >
            <span>👤</span> Fan View
          </button>
          <button
            className={activeView === 'staff' ? 'active' : ''}
            onClick={() => setView('staff')}
            aria-current={activeView === 'staff' ? 'page' : undefined}
            aria-label="Switch to Staff View"
          >
            <span>📊</span> Staff View
          </button>
          <button
            className={activeView === 'analytics' ? 'active' : ''}
            onClick={() => setView('analytics')}
            aria-current={activeView === 'analytics' ? 'page' : undefined}
            aria-label="Switch to Analytics View"
          >
            <span>📈</span> Analytics
          </button>
        </nav>

        <div className="venue-info">
          <div className="venue-info-item">
            <span className="venue-info-label">Venue</span>
            <span className="venue-info-value">Lusail Stadium</span>
          </div>
          <div className="venue-info-item">
            <span className="venue-info-label">Match Time</span>
            <span className="venue-info-value">KO 20:00 (T-45m)</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-text">FanPulse</span>
        </div>
        {/* Mini score ticker */}
        <div className="header-score-ticker">
          <span>🇧🇷</span>
          <span className="ticker-score">{queries.filter(q => q.intent === 'goal').length || 1}</span>
          <span className="ticker-divider">-</span>
          <span className="ticker-score">{Math.max(0, queries.filter(q => q.intent === 'goal').length - 1) || 0}</span>
          <span>🇫🇷</span>
        </div>
      </div>

      <div className="header-right">
        <div className="live-badge">
          <span className="live-dot" />
          LIVE FEED
        </div>
        <div className="header-lang">
          <span>🌐</span>
          EN/ES/FR
        </div>
        <button className="header-icon-btn" title="Notifications" style={{ position: 'relative' }}>
          🔔
          {anomalies.length > 0 && <span className="notification-count">{anomalies.length}</span>}
        </button>
        <div className="header-avatar" title="Profile">
          D
        </div>
      </div>
    </header>
  );
}
