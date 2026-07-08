import KPIBar from './KPIBar';
import Heatmap from './Heatmap';
import TrendingTable from './TrendingTable';
import StaffChat from './StaffChat';
import AnomalyCards from './AnomalyCards';
import ShiftPulse from './ShiftPulse';

export default function StaffView() {
  return (
    <div className="staff-layout">
      <KPIBar />
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Heatmap />
          <TrendingTable />
        </div>
        <div className="dashboard-sidebar">
          <StaffChat />
          <AnomalyCards />
          <ShiftPulse />
        </div>
      </div>
    </div>
  );
}
