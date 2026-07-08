import { QueryProvider, useQueryStore } from './store/queryStore';
import Header from './components/Header';
import FanView from './components/Fan/FanView';
import StaffView from './components/Staff/StaffView';

function AppContent() {
  const { activeView } = useQueryStore();

  return (
    <div className="app-container">
      <Header />
      <main className="main-content" key={activeView}>
        {activeView === 'fan' ? <FanView /> : <StaffView />}
      </main>
      <footer className="footer">
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
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}
