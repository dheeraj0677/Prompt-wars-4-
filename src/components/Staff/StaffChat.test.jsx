import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StaffChat from './StaffChat';
import { useQueryStore } from '../../store/queryStore';
import { getMockStaffResponse, staffAnalystChat } from '../../services/ai';

vi.mock('../../store/queryStore', () => ({
  useQueryStore: vi.fn(),
}));

vi.mock('../../services/ai', () => ({
  staffAnalystChat: vi.fn(),
  getMockStaffResponse: vi.fn(),
}));

vi.mock('../../services/prompts', () => ({
  buildStaffPrompt: vi.fn((question) => ({ system: 'staff-system', userMessage: question })),
}));

const summary = {
  totalQueries: 5,
  byZone: { 'Gate A': 3 },
  byIntent: { wayfinding: 2 },
  byLanguage: { en: 5 },
  anomalies: [],
  timeRange: '15 minutes',
};

const baseStore = {
  staffMessages: [],
  addStaffMessage: vi.fn(),
  getQueryLogSummary: vi.fn(() => summary),
};

describe('StaffChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryStore.mockReturnValue(baseStore);
    staffAnalystChat.mockResolvedValue('**Action:** Deploy two staff to Gate A.');
    getMockStaffResponse.mockReturnValue('Mock operations summary.');
  });

  it('renders welcome state and sends staff analyst requests', async () => {
    render(<StaffChat />);

    expect(screen.getByText(/AI Staff Analyst/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/ask the staff ai analyst/i), { target: { value: 'Where is pressure rising?' } });
    fireEvent.click(screen.getByRole('button', { name: /send message to ai analyst/i }));

    await waitFor(() => expect(staffAnalystChat).toHaveBeenCalledWith('staff-system', 'Where is pressure rising?'));
    expect(baseStore.addStaffMessage).toHaveBeenCalledWith(expect.objectContaining({
      role: 'assistant',
      content: '**Action:** Deploy two staff to Gate A.',
    }));
  });

  it('falls back to mock response when the proxy fails', async () => {
    staffAnalystChat.mockRejectedValue(new Error('offline'));
    render(<StaffChat />);

    fireEvent.change(screen.getByLabelText(/ask the staff ai analyst/i), { target: { value: 'Status?' } });
    fireEvent.keyDown(screen.getByLabelText(/ask the staff ai analyst/i), { key: 'Enter' });

    await waitFor(() => expect(getMockStaffResponse).toHaveBeenCalledWith('Status?', summary));
    expect(baseStore.addStaffMessage).toHaveBeenCalledWith(expect.objectContaining({
      role: 'assistant',
      content: 'Mock operations summary.',
    }));
  });

  it('sanitizes assistant messages before rendering simple markdown emphasis', () => {
    useQueryStore.mockReturnValue({
      ...baseStore,
      staffMessages: [{
        id: 'unsafe',
        role: 'assistant',
        content: '<img src=x onerror=alert(1)>**Safe:** clear',
        timestamp: new Date().toISOString(),
      }],
    });

    render(<StaffChat />);

    expect(screen.getByText('Safe: clear')).toBeInTheDocument();
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });
});
