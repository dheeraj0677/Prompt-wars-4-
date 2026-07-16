import { describe, it, expect } from 'vitest';
import {
  getMockFanResponse,
  getMockStaffResponse,
  getMockShiftSummary,
} from './ai';

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
