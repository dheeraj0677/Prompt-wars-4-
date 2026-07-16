// Incident Management Board — Kanban-style incident tracking
import { useState, useEffect, useRef } from 'react';
import { generateInitialIncidents, generateIncident } from '../../data/socialData';

export default function IncidentBoard() {
  const [incidents, setIncidents] = useState(() => generateInitialIncidents(6));
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // Add new incident every 45 seconds
    const interval = setInterval(() => {
      setIncidents(prev => [generateIncident(), ...prev].slice(0, 15));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (id, newStatus) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === id ? { ...inc, status: newStatus, ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}) } : inc
    ));
  };

  const columns = [
    { key: 'active', label: 'Active', color: 'var(--accent-red)' },
    { key: 'in_progress', label: 'In Progress', color: 'var(--accent-amber)' },
    { key: 'resolved', label: 'Resolved', color: 'var(--accent-emerald)' },
  ];

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const severityColor = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280' };

  return (
    <div className="incident-board">
      <div className="section-header">
        <span className="section-title">🚨 Incident Management</span>
        <span className="incident-count">{incidents.filter(i => i.status === 'active').length} active</span>
      </div>

      <div className="kanban-board">
        {columns.map(col => {
          const colIncidents = incidents.filter(i => i.status === col.key);
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-column-header" style={{ borderBottomColor: col.color }}>
                <span>{col.label}</span>
                <span className="kanban-count">{colIncidents.length}</span>
              </div>
              <div className="kanban-cards">
                {colIncidents.slice(0, 4).map(inc => (
                  <div key={inc.id} className="kanban-card">
                    <div className="kanban-card-header">
                      <span className="kanban-type">{inc.icon} {inc.label}</span>
                      <span className="kanban-severity" style={{ background: severityColor[inc.severity] }}>{inc.severity}</span>
                    </div>
                    <div className="kanban-card-zone">{inc.zoneName}</div>
                    <div className="kanban-card-desc">{inc.description}</div>
                    <div className="kanban-card-footer">
                      <span>👤 {inc.assignedTo}</span>
                      <span>{formatTime(inc.reportedAt)}</span>
                    </div>
                    {col.key !== 'resolved' && (
                      <div className="kanban-actions">
                        {col.key === 'active' && <button onClick={() => updateStatus(inc.id, 'in_progress')} className="kanban-action-btn progress">Start</button>}
                        {col.key === 'in_progress' && <button onClick={() => updateStatus(inc.id, 'resolved')} className="kanban-action-btn resolve">Resolve</button>}
                      </div>
                    )}
                    {inc.resolvedAt && <div className="kanban-resolved-time">Resolved at {formatTime(inc.resolvedAt)}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
