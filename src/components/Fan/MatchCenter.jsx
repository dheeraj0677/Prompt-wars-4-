// Live Match Center — score, stats, timeline
import { useMatchData } from '../../data/matchData';

export default function MatchCenter() {
  const match = useMatchData();
  const { teams, minute, period, stats, events, isLive } = match;

  const recentEvents = [...events].reverse().slice(0, 6);

  return (
    <div className="match-center">
      {/* Scoreboard */}
      <div className="scoreboard">
        <div className="score-team">
          <span className="team-flag">{teams.home.flag}</span>
          <span className="team-name">{teams.home.code}</span>
        </div>
        <div className="score-display">
          <span className="score-num">{stats.home.goals}</span>
          <span className="score-divider">—</span>
          <span className="score-num">{stats.away.goals}</span>
        </div>
        <div className="score-team">
          <span className="team-name">{teams.away.code}</span>
          <span className="team-flag">{teams.away.flag}</span>
        </div>
      </div>

      <div className="match-time-bar">
        <span className={`match-period ${isLive ? 'live' : ''}`}>
          {isLive && <span className="live-dot" />}
          {period}
        </span>
        <span className="match-minute">{minute}'</span>
      </div>

      {/* Stats Grid */}
      <div className="match-stats-grid">
        {[
          { label: 'Possession', home: `${stats.possession.home}%`, away: `${stats.possession.away}%`, homeVal: stats.possession.home },
          { label: 'Shots', home: stats.home.shots, away: stats.away.shots, homeVal: stats.home.shots },
          { label: 'On Target', home: stats.home.shotsOnTarget, away: stats.away.shotsOnTarget, homeVal: stats.home.shotsOnTarget },
          { label: 'Corners', home: stats.home.corners, away: stats.away.corners, homeVal: stats.home.corners },
          { label: 'Yellow Cards', home: stats.home.yellowCards, away: stats.away.yellowCards, homeVal: stats.home.yellowCards },
        ].map(stat => {
          const total = (typeof stat.home === 'number' ? stat.home : stat.homeVal) + (typeof stat.away === 'number' ? stat.away : 100 - stat.homeVal);
          const homePercent = total > 0 ? ((typeof stat.home === 'number' ? stat.home : stat.homeVal) / total) * 100 : 50;
          return (
            <div key={stat.label} className="match-stat-row">
              <span className="stat-value-home">{stat.home}</span>
              <div className="stat-bar-container">
                <div className="stat-bar-label">{stat.label}</div>
                <div className="stat-bar-track">
                  <div className="stat-bar-fill home" style={{ width: `${homePercent}%` }} />
                  <div className="stat-bar-fill away" style={{ width: `${100 - homePercent}%` }} />
                </div>
              </div>
              <span className="stat-value-away">{stat.away}</span>
            </div>
          );
        })}
      </div>

      {/* Event Timeline */}
      <div className="match-timeline">
        <div className="timeline-header">Match Events</div>
        <div className="timeline-events">
          {recentEvents.map(event => (
            <div key={event.id} className={`timeline-event ${event.type === 'goal' ? 'goal' : ''}`}>
              <span className="event-minute">{event.minute}'</span>
              <span className="event-icon">{event.icon}</span>
              <span className="event-desc">{event.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
