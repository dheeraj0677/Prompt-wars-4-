import { useState, useEffect } from 'react';
import { useQueryStore } from '../../store/queryStore';
import { generateShiftSummary, getMockShiftSummary } from '../../services/ai';
import { buildShiftSummaryPrompt } from '../../services/prompts';

export default function ShiftPulse() {
  const { queries, getQueryLogSummary } = useQueryStore();
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute hourly distribution for chart
  const hourlyData = (() => {
    const now = new Date();
    const hours = [];
    for (let i = 4; i >= 0; i--) {
      const hourStart = new Date(now);
      hourStart.setHours(now.getHours() - i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourStart.getHours() + 1);

      const count = queries.filter(q => {
        const t = new Date(q.timestamp);
        return t >= hourStart && t < hourEnd;
      }).length;

      hours.push({
        label: `${hourStart.getHours().toString().padStart(2, '0')}:00`,
        count,
      });
    }
    return hours;
  })();

  const maxCount = Math.max(...hourlyData.map(h => h.count), 1);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const logSummary = getQueryLogSummary();
      const { system, userMessage } = buildShiftSummaryPrompt(logSummary);

      let result;
      try {
        result = await generateShiftSummary(system, userMessage);
      } catch {
        result = getMockShiftSummary(logSummary);
      }
      setSummary(result);
    } catch (err) {
      console.error('Shift summary error:', err);
      setSummary('Unable to generate shift summary at this time.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on first load
  useEffect(() => {
    if (!summary && queries.length > 10) {
      generateSummary();
    }
  }, [queries.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="shift-pulse">
      <div className="section-header">
        <span className="section-title">📊 Shift Pulse</span>
        <button
          onClick={generateSummary}
          disabled={isGenerating}
          style={{
            padding: '4px 12px',
            fontSize: 11,
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            background: 'white',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {isGenerating ? '⏳ Generating...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="shift-chart">
        {hourlyData.map((h, i) => (
          <div
            key={i}
            className="shift-bar"
            style={{ height: `${Math.max((h.count / maxCount) * 100, 5)}%` }}
            title={`${h.label}: ${h.count} queries`}
          />
        ))}
      </div>
      <div className="shift-labels">
        {hourlyData.map((h, i) => (
          <div key={i} className="shift-label">{h.label}</div>
        ))}
      </div>

      {summary && (
        <div className="shift-forecast">
          <div className="shift-forecast-header">
            ✨ Shift Forecast
          </div>
          <div className="shift-forecast-text">
            {summary.split('\n').map((line, i) => (
              <span key={i}>
                {line.startsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : line}
                {i < summary.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      )}

      {!summary && !isGenerating && (
        <div className="shift-forecast">
          <div className="shift-forecast-header">
            ✨ Shift Forecast
          </div>
          <div className="shift-forecast-text" style={{ color: 'var(--text-muted)' }}>
            Collecting sufficient data for analysis...
          </div>
        </div>
      )}

      {isGenerating && !summary && (
        <div className="shift-forecast">
          <div className="shift-forecast-header">
            ✨ Shift Forecast
          </div>
          <div className="shift-forecast-text">
            <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
