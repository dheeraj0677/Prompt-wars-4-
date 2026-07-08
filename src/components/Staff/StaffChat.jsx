import { useState, useRef, useEffect } from 'react';
import { useQueryStore } from '../../store/queryStore';
import { staffAnalystChat, getMockStaffResponse } from '../../services/ai';
import { buildStaffPrompt } from '../../services/prompts';

export default function StaffChat() {
  const { staffMessages, addStaffMessage, getQueryLogSummary } = useQueryStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [staffMessages, isLoading]);

  // Welcome message
  const welcomeSent = useRef(false);
  useEffect(() => {
    if (staffMessages.length === 0 && !welcomeSent.current) {
      welcomeSent.current = true;
      addStaffMessage({
        id: `staff-welcome-${Date.now()}`,
        role: 'assistant',
        content: "Welcome back, Commander. I'm monitoring live fan interaction streams across all zones. Ask me about crowd patterns, anomalies, or request a shift summary.",
        timestamp: new Date().toISOString(),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `staff-user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    addStaffMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const summary = getQueryLogSummary();
      const { system, userMessage } = buildStaffPrompt(text.trim(), summary);

      let response;
      try {
        response = await staffAnalystChat(system, userMessage);
      } catch {
        response = getMockStaffResponse(text.trim(), summary);
      }

      addStaffMessage({
        id: `staff-ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Staff chat error:', err);
      addStaffMessage({
        id: `staff-error-${Date.now()}`,
        role: 'assistant',
        content: 'Analysis temporarily unavailable. Manual situation check recommended.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="staff-chat">
      <div className="staff-chat-header">
        <span className="section-title">🤖 AI Staff Analyst</span>
        <span style={{ fontSize: 10, color: 'var(--accent-emerald)', fontWeight: 600, padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-full)' }}>
          Intelligence
        </span>
      </div>

      <div className="staff-chat-messages">
        {staffMessages.map((msg) => (
          <div key={msg.id} className={`staff-message ${msg.role}`}>
            {msg.content.split('\n').map((line, i) => (
              <span key={i}>
                {line.startsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : line}
                {i < msg.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        ))}

        {isLoading && (
          <div className="staff-message assistant" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            Analyzing real-time tagged logs...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="staff-chat-input">
        <input
          type="text"
          placeholder="Ask about fan sentiment, anomalies, or shift summaries..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          style={{ width: 36, height: 36, fontSize: 14 }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
