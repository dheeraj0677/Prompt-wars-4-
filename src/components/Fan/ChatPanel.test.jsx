import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ChatPanel from './ChatPanel';
import { useQueryStore } from '../../store/queryStore';
import { fanConciergeChat, getMockFanResponse } from '../../services/ai';

vi.mock('../../store/queryStore', () => ({
  useQueryStore: vi.fn(),
}));

vi.mock('../../services/ai', () => ({
  fanConciergeChat: vi.fn(),
  getMockFanResponse: vi.fn(),
}));

vi.mock('../../services/prompts', () => ({
  buildFanPrompt: vi.fn((text) => ({ system: 'system', userMessage: text })),
}));

const baseStore = {
  fanMessages: [],
  addFanMessage: vi.fn(),
  recordFanQuery: vi.fn(),
  fanLocation: 'gate-a',
  zoneStats: {},
  getHotZones: vi.fn(() => []),
};

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryStore.mockReturnValue(baseStore);
    fanConciergeChat.mockResolvedValue({
      response: 'Go through the main concourse.',
      intent: 'wayfinding',
      zone: 'gate-c',
      language: 'en',
      urgency: 'normal',
    });
    getMockFanResponse.mockReturnValue({
      response: 'Fallback directions ready.',
      intent: 'wayfinding',
      zone: 'gate-c',
      language: 'en',
      urgency: 'normal',
    });
  });

  test('renders header and concierge controls correctly', () => {
    render(<ChatPanel />);

    expect(screen.getByText('Stadium Concierge')).toBeInTheDocument();
    expect(screen.getByText('Multilingual AI Active')).toBeInTheDocument();
    expect(screen.getByText(/End-to-end encrypted · Data anonymized/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /report an incident/i })).toBeInTheDocument();
  });

  test('records classified fan queries after a successful AI response', async () => {
    render(<ChatPanel />);

    fireEvent.change(screen.getByLabelText(/type your question/i), { target: { value: 'How do I get to Gate C?' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(baseStore.recordFanQuery).toHaveBeenCalledWith(expect.objectContaining({
      message: 'How do I get to Gate C?',
      intent: 'wayfinding',
      zoneId: 'gate-c',
      zoneName: 'Gate C (North)',
      urgency: 'normal',
    })));
    expect(baseStore.addFanMessage).toHaveBeenCalledWith(expect.objectContaining({
      role: 'assistant',
      content: 'Go through the main concourse.',
    }));
  });

  test('uses mock fallback when the proxy is unavailable', async () => {
    fanConciergeChat.mockRejectedValue(new Error('offline'));
    render(<ChatPanel />);

    fireEvent.click(screen.getByRole('button', { name: /ask about transport/i }));

    await waitFor(() => expect(getMockFanResponse).toHaveBeenCalled());
    expect(baseStore.recordFanQuery).toHaveBeenCalledWith(expect.objectContaining({
      intent: 'wayfinding',
      zoneId: 'gate-c',
    }));
  });

  test('sanitizes rendered message text', () => {
    useQueryStore.mockReturnValue({
      ...baseStore,
      fanMessages: [{
        id: 'unsafe',
        role: 'assistant',
        content: '<img src=x onerror=alert(1)>Safe text',
        timestamp: new Date().toISOString(),
        intent: 'general',
        language: 'en',
      }],
    });

    render(<ChatPanel />);

    expect(screen.getByText('Safe text')).toBeInTheDocument();
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });
});
