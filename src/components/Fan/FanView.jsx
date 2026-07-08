import ChatPanel from './ChatPanel';
import Sidebar from './Sidebar';

export default function FanView() {
  return (
    <div className="fan-layout">
      <ChatPanel />
      <Sidebar />
    </div>
  );
}
