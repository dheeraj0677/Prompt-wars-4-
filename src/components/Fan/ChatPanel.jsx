import { useState, useRef, useEffect } from 'react';
import { useQueryStore } from '../../store/queryStore';
import { fanConciergeChat, getMockFanResponse } from '../../services/ai';
import { buildFanPrompt } from '../../services/prompts';
import { ZONE_MAP } from '../../data/stadium';

const QUICK_ACTIONS = [
  { icon: '🧭', label: 'Wayfinding', prompt: 'How do I get to Gate C from here?' },
  { icon: '♿', label: 'Accessibility', prompt: 'Where is the nearest wheelchair ramp?' },
  { icon: '🚌', label: 'Transport', prompt: 'When is the next shuttle?' },
  { icon: '🍔', label: 'Food & Drinks', prompt: "What's open at the Food Court?" },
  { icon: '🚨', label: 'Emergency', prompt: 'Where is the nearest emergency exit?' },
];

export default function ChatPanel() {
  const { fanMessages, addFanMessage, fanLocation, zoneStats, getHotZones } = useQueryStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownNudge, setHasShownNudge] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [fanMessages, isLoading]);

  // Crowd nudge check — Part 3
  useEffect(() => {
    if (hasShownNudge) return;
    const hotZones = getHotZones();
    if (hotZones.includes(fanLocation) && fanMessages.length > 0) {
      const currentZone = ZONE_MAP[fanLocation];
      const adjacentLowZones = (currentZone?.adjacent || [])
        .filter(id => zoneStats[id]?.level === 'low' || zoneStats[id]?.level === 'med')
        .map(id => ZONE_MAP[id]?.name)
        .filter(Boolean);

      if (adjacentLowZones.length > 0) {
        setTimeout(() => {
          addFanMessage({
            id: `nudge-${Date.now()}`,
            role: 'nudge',
            content: `📢 ${currentZone.name} is getting busy! ${adjacentLowZones[0]} nearby has shorter lines and less crowding. Consider heading there for a quicker experience!`,
            timestamp: new Date().toISOString(),
          });
          setHasShownNudge(true);
        }, 8000);
      }
    }
  }, [fanLocation, zoneStats, fanMessages.length, hasShownNudge, getHotZones, addFanMessage]);

  // Welcome message on first load
  const welcomeSent = useRef(false);
  useEffect(() => {
    if (fanMessages.length === 0 && !welcomeSent.current) {
      welcomeSent.current = true;
      addFanMessage({
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Welcome to Lusail Stadium! I'm your FanPulse Concierge. How can I help you enjoy the match today? Ask me anything — directions, food, accessibility, transport — in any language! 🏟️",
        timestamp: new Date().toISOString(),
        intent: 'general',
        language: 'en',
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      zoneId: fanLocation,
      zoneName: ZONE_MAP[fanLocation]?.name || '',
    };

    addFanMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const { system, userMessage } = buildFanPrompt(text.trim(), fanLocation, zoneStats);
      let result;

      try {
        result = await fanConciergeChat(system, userMessage);
      } catch {
        // Fallback to mock response
        result = getMockFanResponse(text.trim(), fanLocation);
      }

      // Update the user message with detected intent/zone
      userMsg.intent = result.intent;
      userMsg.language = result.language;

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        intent: result.intent,
        language: result.language,
        zone: result.zone,
        urgency: result.urgency,
      };

      addFanMessage(aiMsg);
    } catch (err) {
      console.error('Chat error:', err);
      addFanMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm experiencing a brief connectivity issue. For immediate help, please visit the nearest Information Desk or contact any staff member in a green vest.",
        timestamp: new Date().toISOString(),
        intent: 'general',
        language: 'en',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">🤖</div>
          <div className="chat-header-info">
            <h3>Stadium Concierge</h3>
            <span>Multilingual AI Active</span>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {fanMessages.map((msg) => {
          if (msg.role === 'nudge') {
            return (
              <div key={msg.id} className="crowd-nudge">
                <span className="nudge-icon">🔀</span>
                <span className="nudge-text">{msg.content}</span>
              </div>
            );
          }
          return (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div>
                <div className="message-bubble">{msg.content}</div>
                <div className="message-meta">
                  <span>{formatTime(msg.timestamp)}</span>
                  {msg.intent && msg.role === 'assistant' && (
                    <span className={`intent-badge ${msg.intent}`}>
                      {msg.intent.replace('_', ' ')}
                    </span>
                  )}
                  {msg.language && msg.role === 'assistant' && (
                    <span className="lang-badge">{msg.language.toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="typing-indicator">
            <div className="message-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🤖
            </div>
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="quick-chip"
            onClick={() => sendMessage(action.prompt)}
            disabled={isLoading}
          >
            <span className="chip-icon">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask in any language (e.g., Where is Gate B?)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            ➤
          </button>
        </div>
        <div className="chat-footer-info">
          <span>🔒 End-to-end encrypted · Data anonymized</span>
          <span style={{ color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 600 }}>
            Report Incident
          </span>
        </div>
      </div>
    </div>
  );
}
