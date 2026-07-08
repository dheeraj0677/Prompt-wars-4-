import { useQueryStore } from '../store/queryStore';

export default function Header() {
  const { activeView, setView } = useQueryStore();

  return (
    <header className="header">
      <div className="header-left">
        <div className="view-toggle">
          <button
            className={activeView === 'fan' ? 'active' : ''}
            onClick={() => setView('fan')}
          >
            <span>👤</span> Fan View
          </button>
          <button
            className={activeView === 'staff' ? 'active' : ''}
            onClick={() => setView('staff')}
          >
            <span>📊</span> Staff View
          </button>
        </div>

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
      </div>

      <div className="header-right">
        <div className="live-badge">
          <span className="live-dot" />
          LIVE FEED
        </div>
      </div>
    </header>
  );
}
