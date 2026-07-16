// Fan Engagement Hub — polls, predictions, trivia, mood
import { useState, useEffect } from 'react';

const POLLS = [
  { id: 'p1', question: 'Who will score next?', options: [
    { label: '🇧🇷 Vinicius Jr.', votes: 342 }, { label: '🇧🇷 Rodrygo', votes: 189 },
    { label: '🇫🇷 Mbappé', votes: 456 }, { label: '🇫🇷 Griezmann', votes: 134 },
  ]},
  { id: 'p2', question: 'Rate the atmosphere!', options: [
    { label: '🔥 Electric!', votes: 823 }, { label: '👍 Great', votes: 412 },
    { label: '😐 Average', votes: 67 }, { label: '👎 Flat', votes: 12 },
  ]},
  { id: 'p3', question: 'Best food at the stadium?', options: [
    { label: '🌯 Shawarma', votes: 534 }, { label: '🍔 Burger', votes: 421 },
    { label: '🧆 Falafel', votes: 298 }, { label: '🍕 Pizza', votes: 187 },
  ]},
];

const TRIVIA = [
  { q: 'Which country has won the most World Cups?', options: ['Germany', 'Brazil', 'Italy', 'Argentina'], answer: 1 },
  { q: 'How many teams compete in the 2026 World Cup?', options: ['32', '40', '48', '64'], answer: 2 },
  { q: 'Which stadium has the largest capacity?', options: ['Wembley', 'Maracanã', 'Azteca', 'Lusail'], answer: 3 },
  { q: 'Who scored the fastest World Cup goal ever?', options: ['Hakan Şükür', 'Pelé', 'Ronaldo', 'Klose'], answer: 0 },
];

const MOODS = [
  { emoji: '🤩', label: 'Ecstatic', count: 12453 },
  { emoji: '😊', label: 'Happy', count: 18234 },
  { emoji: '😐', label: 'Neutral', count: 3421 },
  { emoji: '😤', label: 'Frustrated', count: 1876 },
  { emoji: '🎉', label: 'Celebrating', count: 8934 },
];

export default function FanEngagement() {
  const [activePoll, setActivePoll] = useState(0);
  const [voted, setVoted] = useState({});
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaAnswer, setTriviaAnswer] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [pollData, setPollData] = useState(POLLS);

  // Simulate live vote updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPollData(prev => prev.map(poll => ({
        ...poll,
        options: poll.options.map(opt => ({
          ...opt,
          votes: opt.votes + Math.floor(Math.random() * 5),
        })),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPoll = pollData[activePoll];
  const totalVotes = currentPoll.options.reduce((s, o) => s + o.votes, 0);
  const totalMoods = MOODS.reduce((s, m) => s + m.count, 0);

  const handleVote = (pollId, optIndex) => {
    if (voted[pollId]) return;
    setVoted(prev => ({ ...prev, [pollId]: optIndex }));
    setPollData(prev => prev.map(p => p.id === pollId ? {
      ...p, options: p.options.map((o, i) => i === optIndex ? { ...o, votes: o.votes + 1 } : o),
    } : p));
  };

  const currentTrivia = TRIVIA[triviaIndex];

  return (
    <div className="fan-engagement">
      {/* Live Poll */}
      <div className="engagement-card">
        <div className="engagement-header">
          <span>📊 Live Poll</span>
          <div className="poll-nav">
            {POLLS.map((_, i) => (
              <button key={i} className={`poll-dot ${i === activePoll ? 'active' : ''}`} onClick={() => setActivePoll(i)} />
            ))}
          </div>
        </div>
        <div className="poll-question">{currentPoll.question}</div>
        <div className="poll-options">
          {currentPoll.options.map((opt, i) => {
            const percent = Math.round((opt.votes / totalVotes) * 100);
            const isVoted = voted[currentPoll.id] === i;
            return (
              <button key={i} className={`poll-option ${isVoted ? 'voted' : ''} ${voted[currentPoll.id] !== undefined ? 'revealed' : ''}`}
                onClick={() => handleVote(currentPoll.id, i)}>
                <div className="poll-bar" style={{ width: voted[currentPoll.id] !== undefined ? `${percent}%` : '0%' }} />
                <span className="poll-label">{opt.label}</span>
                {voted[currentPoll.id] !== undefined && <span className="poll-percent">{percent}%</span>}
              </button>
            );
          })}
        </div>
        <div className="poll-total">{totalVotes.toLocaleString()} votes · Live</div>
      </div>

      {/* Trivia */}
      <div className="engagement-card">
        <div className="engagement-header">
          <span>🧠 World Cup Trivia</span>
          <span className="trivia-counter">{triviaIndex + 1}/{TRIVIA.length}</span>
        </div>
        <div className="trivia-question">{currentTrivia.q}</div>
        <div className="trivia-options">
          {currentTrivia.options.map((opt, i) => (
            <button key={i}
              className={`trivia-option ${triviaAnswer === i ? (i === currentTrivia.answer ? 'correct' : 'wrong') : ''} ${triviaAnswer !== null && i === currentTrivia.answer ? 'correct' : ''}`}
              onClick={() => {
                if (triviaAnswer !== null) return;
                setTriviaAnswer(i);
                setTimeout(() => {
                  setTriviaAnswer(null);
                  setTriviaIndex(prev => (prev + 1) % TRIVIA.length);
                }, 2000);
              }}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Stadium Mood */}
      <div className="engagement-card">
        <div className="engagement-header"><span>😊 Stadium Mood</span></div>
        <div className="mood-grid">
          {MOODS.map((mood, i) => (
            <button key={i} className={`mood-btn ${selectedMood === i ? 'selected' : ''}`}
              onClick={() => setSelectedMood(i)}>
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
              <span className="mood-count">{Math.round((mood.count / totalMoods) * 100)}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
