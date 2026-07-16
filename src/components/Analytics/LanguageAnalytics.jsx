// Language Analytics — distribution, volume trends, common queries per language
import { useQueryStore } from '../../store/queryStore';

const LANG_META = {
  en: { name: 'English', flag: '🇬🇧', color: '#3b82f6' },
  es: { name: 'Spanish', flag: '🇪🇸', color: '#f59e0b' },
  pt: { name: 'Portuguese', flag: '🇧🇷', color: '#10b981' },
  fr: { name: 'French', flag: '🇫🇷', color: '#8b5cf6' },
  ar: { name: 'Arabic', flag: '🇸🇦', color: '#ef4444' },
};

export default function LanguageAnalytics() {
  const { queries } = useQueryStore();

  // Count by language
  const langCounts = {};
  queries.forEach(q => {
    const lang = q.language || 'en';
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const totalQueries = queries.length || 1;
  const langEntries = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(langCounts), 1);

  // Common intents per language
  const langIntents = {};
  queries.forEach(q => {
    const lang = q.language || 'en';
    if (!langIntents[lang]) langIntents[lang] = {};
    const intent = q.intent || 'general';
    langIntents[lang][intent] = (langIntents[lang][intent] || 0) + 1;
  });

  const topIntentsPerLang = {};
  Object.entries(langIntents).forEach(([lang, intents]) => {
    topIntentsPerLang[lang] = Object.entries(intents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([intent, count]) => ({ intent, count }));
  });

  return (
    <div className="language-analytics">
      <div className="section-header"><span className="section-title">🌍 Language Distribution</span></div>

      {/* Pie-chart-like distribution */}
      <div className="lang-distribution">
        <div className="lang-pie-container">
          <svg viewBox="0 0 120 120" className="lang-pie">
            {(() => {
              let offset = 0;
              const circumference = 2 * Math.PI * 50;
              return langEntries.map(([lang, count]) => {
                const percent = count / totalQueries;
                const dashArray = `${percent * circumference} ${circumference}`;
                const dashOffset = -offset * circumference;
                offset += percent;
                const meta = LANG_META[lang] || { color: '#6b7280' };
                return (
                  <circle key={lang} cx="60" cy="60" r="50" fill="none" stroke={meta.color} strokeWidth="18"
                    strokeDasharray={dashArray} strokeDashoffset={dashOffset} opacity="0.8" />
                );
              });
            })()}
          </svg>
          <div className="lang-pie-center">
            <div className="lang-pie-total">{totalQueries}</div>
            <div className="lang-pie-label">Queries</div>
          </div>
        </div>
        <div className="lang-legend">
          {langEntries.map(([lang, count]) => {
            const meta = LANG_META[lang] || { name: lang, flag: '🏳️', color: '#6b7280' };
            return (
              <div key={lang} className="lang-legend-item">
                <div className="lang-legend-dot" style={{ background: meta.color }} />
                <span className="lang-legend-flag">{meta.flag}</span>
                <span className="lang-legend-name">{meta.name}</span>
                <span className="lang-legend-count">{count}</span>
                <span className="lang-legend-percent">{Math.round((count / totalQueries) * 100)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume bars */}
      <div className="lang-bars">
        <div className="engagement-header" style={{ marginTop: 16 }}><span>📊 Volume by Language</span></div>
        {langEntries.map(([lang, count]) => {
          const meta = LANG_META[lang] || { name: lang, color: '#6b7280' };
          return (
            <div key={lang} className="lang-bar-row">
              <span className="lang-bar-name">{meta.name}</span>
              <div className="lang-bar-track">
                <div className="lang-bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: meta.color }} />
              </div>
              <span className="lang-bar-value">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Top intents per language */}
      <div className="lang-intents">
        <div className="engagement-header" style={{ marginTop: 16 }}><span>🎯 Top Needs by Language</span></div>
        <div className="lang-intent-grid">
          {langEntries.slice(0, 4).map(([lang]) => {
            const meta = LANG_META[lang] || { name: lang, flag: '🏳️' };
            const intents = topIntentsPerLang[lang] || [];
            return (
              <div key={lang} className="lang-intent-card">
                <div className="lang-intent-header">{meta.flag} {meta.name}</div>
                {intents.map(({ intent, count }) => (
                  <div key={intent} className="lang-intent-item">
                    <span>{intent}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
