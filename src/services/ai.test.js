import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  fanConciergeChat,
  staffAnalystChat,
  generateShiftSummary,
  getFallbackResponse,
  getMockFanResponse,
  getMockStaffResponse,
  getMockShiftSummary,
} from './ai';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ── getMockFanResponse ──────────────────────────────────────

describe('getMockFanResponse', () => {
  it('returns a well-formed response object', () => {
    const result = getMockFanResponse('Where is the nearest restroom?', 'gate-a');
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('zone');
    expect(result).toHaveProperty('language');
    expect(result).toHaveProperty('urgency');
  });

  it('detects English wayfinding intent', () => {
    const result = getMockFanResponse('How do I get to Gate C?', 'gate-a');
    expect(result.intent).toBe('wayfinding');
    expect(result.language).toBe('en');
  });

  it('detects Spanish language', () => {
    const result = getMockFanResponse('¿Los baños están llenos?', 'gate-a');
    expect(result.language).toBe('es');
    expect(result.intent).toBe('restroom');
  });

  it('detects Arabic language', () => {
    const result = getMockFanResponse('الحمام ممتلئ', 'gate-a');
    expect(result.language).toBe('ar');
    expect(result.intent).toBe('restroom');
  });

  it('detects emergency intent with critical urgency', () => {
    const result = getMockFanResponse('There is a fire emergency!', 'gate-a');
    expect(result.intent).toBe('emergency');
    expect(result.urgency).toBe('critical');
  });

  it('detects safety intent with high urgency', () => {
    const result = getMockFanResponse('I need medical help', 'gate-a');
    expect(result.intent).toBe('safety');
    expect(result.urgency).toBe('high');
  });

  it('defaults to general intent for unknown queries', () => {
    const result = getMockFanResponse('Hello there', 'gate-a');
    expect(result.intent).toBe('general');
    expect(result.urgency).toBe('normal');
  });

  it('detects transport intent', () => {
    const result = getMockFanResponse('When is the next shuttle bus?', 'gate-a');
    expect(result.intent).toBe('transport');
  });

  it('detects food_drink intent', () => {
    const result = getMockFanResponse('I want to eat halal food', 'gate-a');
    expect(result.intent).toBe('food_drink');
  });

  it('detects accessibility intent', () => {
    const result = getMockFanResponse('I need wheelchair assistance', 'gate-a');
    expect(result.intent).toBe('accessibility');
  });

  it('detects mentioned zone in message', () => {
    const result = getMockFanResponse('How do I get to VIP Lounge?', 'gate-a');
    expect(result.zone).toBe('vip-lounge');
  });

  it('uses fan location as zone when no zone is mentioned', () => {
    const result = getMockFanResponse('What time does the match start?', 'section-102');
    expect(result.zone).toBe('section-102');
  });

  it('detects lost-and-found and schedule in supported languages', () => {
    expect(getMockFanResponse('J’ai perdu mon sac', 'gate-a').intent).toBe('lost_found');
    expect(getMockFanResponse('À quelle heure commence le match?', 'gate-a').intent).toBe('schedule');
    expect(getMockFanResponse('Onde posso pegar água perto do Gate C?', 'gate-a').language).toBe('pt');
  });

  it('falls back to English text for unknown fallback language codes', () => {
    expect(getFallbackResponse('xx')).toBe(getFallbackResponse('en'));
  });

  it('returns non-empty response string', () => {
    const result = getMockFanResponse('Hello', 'gate-a');
    expect(typeof result.response).toBe('string');
    expect(result.response.length).toBeGreaterThan(0);
  });
});

// ── getMockStaffResponse ────────────────────────────────────

describe('getMockStaffResponse', () => {
  const mockSummary = {
    totalQueries: 50,
    byZone: { 'Gate A (Main)': 15, 'Gate B (West)': 8, 'VIP Lounge': 3 },
    byIntent: { wayfinding: 20, restroom: 10, transport: 5 },
    byLanguage: { en: 30, es: 15, ar: 5 },
    anomalies: ['VOLUME SPIKE at Gate A: 15 queries in 5 min'],
    timeRange: '15 minutes',
  };

  it('returns a non-empty string', () => {
    const result = getMockStaffResponse('What is happening?', mockSummary);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes zone information', () => {
    const result = getMockStaffResponse('Where is the highest activity?', mockSummary);
    expect(result).toContain('Gate A');
  });

  it('includes anomaly information when present', () => {
    const result = getMockStaffResponse('Any issues?', mockSummary);
    expect(result).toContain('Anomal');
  });

  it('handles empty anomalies', () => {
    const noAnomalySummary = { ...mockSummary, anomalies: [] };
    const result = getMockStaffResponse('Status?', noAnomalySummary);
    expect(result).toContain('No anomalies');
  });

  it('handles empty operational summaries without top zones or intents', () => {
    const result = getMockStaffResponse('Status?', {
      totalQueries: 0,
      byZone: {},
      byIntent: {},
      byLanguage: {},
      anomalies: [],
      timeRange: '15 minutes',
    });

    expect(result).toContain('No data available');
    expect(result).toContain('N/A');
  });
});

// ── getMockShiftSummary ─────────────────────────────────────

describe('getMockShiftSummary', () => {
  const mockSummary = {
    totalQueries: 40,
    byZone: { 'East Plaza': 12, 'Gate B (West)': 8, 'Food Court North': 5 },
    byIntent: { wayfinding: 15, food_drink: 10, restroom: 8 },
    byLanguage: { en: 25, es: 10, pt: 5 },
    anomalies: [],
    timeRange: '15 minutes',
  };

  it('returns a string containing SHIFT BRIEFING', () => {
    const result = getMockShiftSummary(mockSummary);
    expect(result).toContain('SHIFT BRIEFING');
  });

  it('includes total query count', () => {
    const result = getMockShiftSummary(mockSummary);
    expect(result).toContain('40');
  });

  it('includes top zone information', () => {
    const result = getMockShiftSummary(mockSummary);
    expect(result).toContain('East Plaza');
  });

  it('includes forecast section', () => {
    const result = getMockShiftSummary(mockSummary);
    expect(result).toContain('FORECAST');
  });
});

// ── sanitizeInput ───────────────────────────────────────────

import { sanitizeInput, parseIntentFromResponse } from './ai';

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('   hello   ')).toBe('hello');
  });

  it('removes control characters', () => {
    expect(sanitizeInput('hello\x00world\x0B!')).toBe('helloworld!');
  });

  it('limits input to 500 characters', () => {
    const longInput = 'a'.repeat(600);
    expect(sanitizeInput(longInput).length).toBe(500);
  });

  it('handles non-string inputs safely', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });
});

// ── parseIntentFromResponse ─────────────────────────────────

describe('parseIntentFromResponse', () => {
  it('parses structured JSON on the first line', () => {
    const rawResponse = '{"intent":"wayfinding","zone":"gate-a","language":"en","urgency":"normal"}\nHere is how to get there...';
    const parsed = parseIntentFromResponse(rawResponse);
    expect(parsed.intent.intent).toBe('wayfinding');
    expect(parsed.responseText).toBe('Here is how to get there...');
  });

  it('handles a JSON-only response without natural language content', () => {
    const rawResponse = '{"intent":"general","zone":"gate-a","language":"en","urgency":"normal"}';
    const parsed = parseIntentFromResponse(rawResponse);
    expect(parsed.intent.zone).toBe('gate-a');
    expect(parsed.responseText).toBe(rawResponse);
  });

  it('falls back to default intent if parsing fails', () => {
    const rawResponse = 'Just a regular text response without JSON\nSecond line';
    const parsed = parseIntentFromResponse(rawResponse);
    expect(parsed.intent.intent).toBe('general');
    expect(parsed.intent.zone).toBe('unknown');
    expect(parsed.responseText).toBe(rawResponse);
  });
});

// ── server proxy client ─────────────────────────────────────

describe('Claude proxy client calls', () => {
  it('calls the same-origin proxy and parses fan concierge metadata', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        text: '{"intent":"wayfinding","zone":"gate-c","language":"en","urgency":"normal"}\nTake the blue concourse signs to Gate C.',
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fanConciergeChat('system prompt', 'hello\x00world', 512);

    expect(fetchMock).toHaveBeenCalledWith('/api/claude', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request).toEqual({
      system: 'system prompt',
      userMessage: 'helloworld',
      maxTokens: 512,
    });
    expect(result).toEqual({
      response: 'Take the blue concourse signs to Gate C.',
      intent: 'wayfinding',
      zone: 'gate-c',
      language: 'en',
      urgency: 'normal',
    });
  });

  it('returns staff and shift text from the proxy', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ text: 'Operational summary ready.' }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(staffAnalystChat('system', 'question')).resolves.toBe('Operational summary ready.');
    await expect(generateShiftSummary('system', 'shift')).resolves.toBe('Operational summary ready.');
  });

  it('throws when the proxy returns an invalid payload', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ text: '' }),
    })));

    await expect(staffAnalystChat('system', 'question')).rejects.toThrow('Invalid AI proxy response');
  });

  it('throws generic errors for failed proxy responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 503,
      text: async () => 'not configured',
    })));

    await expect(staffAnalystChat('system', 'question')).rejects.toThrow('API error: 503');
  });
});
