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
      <div className="staff-sub-tabs">
        {STAFF_TABS.map(tab => (
          <button key={tab.id} className={`staff-sub-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'operations' && (
        <div className="dashboard-grid">
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
        <div className="dashboard-full">
          <TicketAnalytics />
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="dashboard-full">
          <IncidentBoard />
        </div>
      )}

      {activeTab === 'social' && (
        <div className="dashboard-full">
          <SocialSentiment />
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="dashboard-full">
          <RevenueDashboard />
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="dashboard-full">
          <ResourceAllocation />
        </div>
      )}
    </div>
  );
}
