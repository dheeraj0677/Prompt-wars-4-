// Live Match Data Simulation — auto-advancing match state
import { useState, useEffect, useCallback } from 'react';

const TEAMS = {
  home: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', color: '#f5c518', formation: '4-3-3' },
  away: { name: 'France', code: 'FRA', flag: '🇫🇷', color: '#002654', formation: '4-4-2' },
};

const PLAYER_NAMES = {
  BRA: ['Alisson', 'Militão', 'Marquinhos', 'Beraldo', 'Wendell', 'Casemiro', 'Paquetá', 'Bruno G.', 'Raphinha', 'Rodrygo', 'Vinicius Jr.'],
  FRA: ['Maignan', 'Koundé', 'Upamecano', 'Saliba', 'T. Hernández', 'Tchouaméni', 'Camavinga', 'Griezmann', 'Dembélé', 'Mbappé', 'Thuram'],
};

const EVENT_TYPES = [
  { type: 'goal', icon: '⚽', weight: 3 },
  { type: 'yellow_card', icon: '🟡', weight: 5 },
  { type: 'red_card', icon: '🔴', weight: 1 },
  { type: 'substitution', icon: '🔄', weight: 4 },
  { type: 'corner', icon: '🚩', weight: 8 },
  { type: 'free_kick', icon: '⬆️', weight: 6 },
  { type: 'offside', icon: '🏳️', weight: 4 },
  { type: 'save', icon: '🧤', weight: 5 },
  { type: 'shot_on_target', icon: '🎯', weight: 6 },
  { type: 'shot_off_target', icon: '💨', weight: 7 },
];

function randomPlayer(teamCode) {
  const names = PLAYER_NAMES[teamCode];
  return names[Math.floor(Math.random() * names.length)];
}

function generateEvent(minute, _existingEvents) {
  const totalWeight = EVENT_TYPES.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  let eventType = EVENT_TYPES[0];
  for (const et of EVENT_TYPES) {
    r -= et.weight;
    if (r <= 0) { eventType = et; break; }
  }

  const isHome = Math.random() > 0.45;
  const team = isHome ? 'home' : 'away';
  const teamCode = isHome ? 'BRA' : 'FRA';
  const player = randomPlayer(teamCode);

  let description = '';
  switch (eventType.type) {
    case 'goal':
      description = `GOAL! ${player} scores for ${TEAMS[team].name}!`;
      break;
    case 'yellow_card':
      description = `Yellow card shown to ${player} (${TEAMS[team].name})`;
      break;
    case 'red_card':
      description = `RED CARD! ${player} (${TEAMS[team].name}) is sent off!`;
      break;
    case 'substitution':
      description = `Substitution: ${player} comes on for ${TEAMS[team].name}`;
      break;
    case 'corner':
      description = `Corner kick for ${TEAMS[team].name}`;
      break;
    case 'save':
      description = `Great save denies ${player} (${TEAMS[team].name})`;
      break;
    case 'shot_on_target':
      description = `Shot on target by ${player} (${TEAMS[team].name})`;
      break;
    case 'shot_off_target':
      description = `${player} (${TEAMS[team].name}) fires wide`;
      break;
    default:
      description = `${eventType.type.replace('_', ' ')} — ${TEAMS[team].name}`;
  }

  return {
    id: `evt-${minute}-${Date.now()}`,
    minute,
    type: eventType.type,
    icon: eventType.icon,
    team,
    teamCode,
    player,
    description,
    timestamp: new Date().toISOString(),
  };
}

function computeStats(events) {
  const stats = {
    home: { goals: 0, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, saves: 0 },
    away: { goals: 0, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, saves: 0 },
    possession: { home: 55 + Math.floor(Math.random() * 10 - 5), away: 0 },
  };
  stats.possession.away = 100 - stats.possession.home;

  events.forEach(e => {
    const side = stats[e.team];
    if (!side) return;
    switch (e.type) {
      case 'goal': side.goals++; side.shots++; side.shotsOnTarget++; break;
      case 'shot_on_target': side.shots++; side.shotsOnTarget++; break;
      case 'shot_off_target': side.shots++; break;
      case 'corner': side.corners++; break;
      case 'yellow_card': side.yellowCards++; break;
      case 'red_card': side.redCards++; break;
      case 'save': stats[e.team === 'home' ? 'away' : 'home'].saves++; break;
      default: break;
    }
  });

  return stats;
}

// Initial match state
function createInitialMatch() {
  const events = [];
  // Pre-generate some events for first 35 minutes
  const preMinutes = [3, 8, 12, 18, 22, 27, 31, 34];
  preMinutes.forEach(m => {
    events.push(generateEvent(m, events));
  });
  // Ensure at least 1 goal
  if (!events.some(e => e.type === 'goal')) {
    const goalEvent = generateEvent(23, events);
    goalEvent.type = 'goal';
    goalEvent.icon = '⚽';
    goalEvent.description = `GOAL! ${goalEvent.player} scores for ${TEAMS[goalEvent.team].name}!`;
    events.push(goalEvent);
  }

  return {
    teams: TEAMS,
    minute: 38,
    period: 'First Half',
    isLive: true,
    events: events.sort((a, b) => a.minute - b.minute),
    stats: computeStats(events),
  };
}

// React hook for live match updates
export function useMatchData() {
  const [match, setMatch] = useState(() => createInitialMatch());

  const addEvent = useCallback(() => {
    setMatch(prev => {
      const newMinute = prev.minute + 1;
      let period = prev.period;
      if (newMinute > 45 && newMinute <= 48) period = 'First Half Stoppage';
      else if (newMinute > 48 && newMinute <= 60) period = 'Half Time';
      else if (newMinute > 60 && newMinute <= 90) period = 'Second Half';
      else if (newMinute > 90) period = 'Second Half Stoppage';

      // 30% chance of event each minute
      const newEvents = [...prev.events];
      if (Math.random() < 0.3 && period !== 'Half Time') {
        newEvents.push(generateEvent(newMinute, newEvents));
      }

      return {
        ...prev,
        minute: Math.min(newMinute, 95),
        period,
        events: newEvents,
        stats: computeStats(newEvents),
        isLive: newMinute <= 95,
      };
    });
  }, []);

  // Auto-advance every 20 seconds (simulated time)
  useEffect(() => {
    const interval = setInterval(addEvent, 20000);
    return () => clearInterval(interval);
  }, [addEvent]);

  return match;
}

export { TEAMS, PLAYER_NAMES };
