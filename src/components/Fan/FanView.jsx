import { useState } from 'react';
import ChatPanel from './ChatPanel';
import Sidebar from './Sidebar';
import MatchCenter from './MatchCenter';
import FanEngagement from './FanEngagement';
import FoodPreOrder from './FoodPreOrder';

const FAN_TABS = [
  { id: 'concierge', label: '💬 Concierge' },
  { id: 'match', label: '⚽ Match Center' },
  { id: 'engage', label: '🎮 Engage' },
  { id: 'food', label: '🍔 Order Food' },
];

export default function FanView() {
  const [activeTab, setActiveTab] = useState('concierge');

  return (
    <div className="fan-view-wrapper">
      {/* Fan sub-tabs */}
      <div className="fan-sub-tabs" role="tablist" aria-label="Fan tools">
        {FAN_TABS.map(tab => (
          <button
            key={tab.id}
            id={`fan-tab-${tab.id}`}
            className={`fan-sub-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`fan-panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="fan-layout"
        id={`fan-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`fan-tab-${activeTab}`}
      >
        {activeTab === 'concierge' && (
          <>
            <ChatPanel />
            <Sidebar />
          </>
        )}
        {activeTab === 'match' && (
          <div className="fan-full-content">
            <MatchCenter />
          </div>
        )}
        {activeTab === 'engage' && (
          <div className="fan-full-content">
            <FanEngagement />
          </div>
        )}
        {activeTab === 'food' && (
          <div className="fan-full-content">
            <FoodPreOrder />
          </div>
        )}
      </div>
    </div>
  );
}
