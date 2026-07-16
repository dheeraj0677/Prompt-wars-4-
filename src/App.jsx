import { useEffect, useRef } from 'react';
import { QueryProvider, useQueryStore } from './store/queryStore';
import Header from './components/Header';
import FanView from './components/Fan/FanView';
import StaffView from './components/Staff/StaffView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { activeView } = useQueryStore();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [activeView]);

  return (
    <div className="app-container">
      {/* Skip-to-content link for keyboard users (accessibility) */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Header />
      <main ref={mainRef} tabIndex="-1" id="main-content" className="main-content" key={activeView} role="main" aria-label="FanPulse main content area" style={{ outline: 'none' }}>
        {activeView === 'fan' && <FanView />}
        {activeView === 'staff' && <StaffView />}
        {activeView === 'analytics' && <AnalyticsView />}
      </main>
      <footer className="footer" role="contentinfo">
        <div>
          © 2026 FIFA World Cup™ &nbsp;&nbsp;
          <a href="#" onClick={e => e.preventDefault()}>Official AI Concierge Partner</a>
        </div>
        <div className="footer-links">
          <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={e => e.preventDefault()}>Safety Protocols</a>
          <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppContent />
      </QueryProvider>
    </ErrorBoundary>
  );
}
