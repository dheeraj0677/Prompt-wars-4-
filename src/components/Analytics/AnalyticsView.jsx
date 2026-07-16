// Analytics View — third tab with sub-sections
import { useState } from 'react';
import HistoricalComparison from './HistoricalComparison';
import LanguageAnalytics from './LanguageAnalytics';
import PerformanceMetrics from './PerformanceMetrics';
import AccessibilityDashboard from './AccessibilityDashboard';

const TABS = [
  { id: 'historical', label: '📈 Historical', icon: '📈' },
  { id: 'language', label: '🌍 Languages', icon: '🌍' },
  { id: 'performance', label: '⚡ Performance', icon: '⚡' },
  { id: 'accessibility', label: '♿ Accessibility', icon: '♿' },
];

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState('historical');

  return (
    <div className="analytics-view">
      {/* Sub-navigation */}
      <div className="analytics-tabs">
        {TABS.map(tab => (
          <button key={tab.id} className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {activeTab === 'historical' && <HistoricalComparison />}
        {activeTab === 'language' && <LanguageAnalytics />}
        {activeTab === 'performance' && <PerformanceMetrics />}
        {activeTab === 'accessibility' && <AccessibilityDashboard />}
      </div>
    </div>
  );
}
