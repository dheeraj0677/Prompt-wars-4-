import { useEffect, useRef } from 'react';
import { QueryProvider, useQueryStore } from './store/queryStore';
import { Suspense, lazy } from 'react';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';

const FanView = lazy(() => import('./components/Fan/FanView'));
const StaffView = lazy(() => import('./components/Staff/StaffView'));
const AnalyticsView = lazy(() => import('./components/Analytics/AnalyticsView'));

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
        <Suspense fallback={<div className="loading-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
          {activeView === 'fan' && <FanView />}
          {activeView === 'staff' && <StaffView />}
          {activeView === 'analytics' && <AnalyticsView />}
        </Suspense>
      </main>
      <footer className="footer" role="contentinfo">
        <div>
          © 2026 FIFA World Cup™ &nbsp;&nbsp;
          <span className="footer-partner">Official AI Concierge Partner</span>
        </div>
        <div className="footer-links">
          <button type="button">Privacy Policy</button>
          <button type="button">Safety Protocols</button>
          <button type="button">Terms of Service</button>
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
