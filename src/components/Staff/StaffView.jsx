import { useState } from 'react';
import KPIBar from './KPIBar';
import Heatmap from './Heatmap';
import TrendingTable from './TrendingTable';
import StaffChat from './StaffChat';
import AnomalyCards from './AnomalyCards';
import ShiftPulse from './ShiftPulse';
import TicketAnalytics from './TicketAnalytics';
import WeatherPanel from './WeatherPanel';
import RevenueDashboard from './RevenueDashboard';
import IncidentBoard from './IncidentBoard';
import SocialSentiment from './SocialSentiment';
import PredictiveFlow from './PredictiveFlow';
import ResourceAllocation from './ResourceAllocation';

const STAFF_TABS = [
  { id: 'operations', label: '🎛️ Operations' },
  { id: 'tickets', label: '🎟️ Tickets & Seating' },
  { id: 'incidents', label: '🚨 Incidents' },
  { id: 'social', label: '📱 Social' },
  { id: 'revenue', label: '💰 Revenue' },
  { id: 'resources', label: '👥 Resources' },
];

export default function StaffView() {
  const [activeTab, setActiveTab] = useState('operations');

  return (
    <div className="staff-layout">
      <KPIBar />

      {/* Sub-tabs */}
      <div className="staff-sub-tabs" role="tablist" aria-label="Staff dashboard sections">
        {STAFF_TABS.map(tab => (
          <button
            key={tab.id}
            id={`staff-tab-${tab.id}`}
            className={`staff-sub-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`staff-panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'operations' && (
        <div className="dashboard-grid" id="staff-panel-operations" role="tabpanel" aria-labelledby="staff-tab-operations">
          <div className="dashboard-main">
            <Heatmap />
            <TrendingTable />
            <PredictiveFlow />
          </div>
          <div className="dashboard-sidebar">
            <StaffChat />
            <AnomalyCards />
            <ShiftPulse />
            <WeatherPanel />
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="dashboard-full" id="staff-panel-tickets" role="tabpanel" aria-labelledby="staff-tab-tickets">
          <TicketAnalytics />
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="dashboard-full" id="staff-panel-incidents" role="tabpanel" aria-labelledby="staff-tab-incidents">
          <IncidentBoard />
        </div>
      )}

      {activeTab === 'social' && (
        <div className="dashboard-full" id="staff-panel-social" role="tabpanel" aria-labelledby="staff-tab-social">
          <SocialSentiment />
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="dashboard-full" id="staff-panel-revenue" role="tabpanel" aria-labelledby="staff-tab-revenue">
          <RevenueDashboard />
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="dashboard-full" id="staff-panel-resources" role="tabpanel" aria-labelledby="staff-tab-resources">
          <ResourceAllocation />
        </div>
      )}
    </div>
  );
}
