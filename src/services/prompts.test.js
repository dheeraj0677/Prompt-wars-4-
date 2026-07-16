import { describe, expect, it } from 'vitest';
import {
  FAN_CONCIERGE_SYSTEM,
  STAFF_ANALYST_SYSTEM,
  SHIFT_SUMMARY_SYSTEM,
  buildFanPrompt,
  buildStaffPrompt,
  buildShiftSummaryPrompt,
} from './prompts';

describe('AI prompt construction', () => {
  it('includes safety, toxicity, and stadium context in the fan system prompt', () => {
    expect(FAN_CONCIERGE_SYSTEM).toContain('TOXICITY/ABUSE');
    expect(FAN_CONCIERGE_SYSTEM).toContain('EXTREME EMERGENCIES');
    expect(FAN_CONCIERGE_SYSTEM).toContain('Gate A (Main)');
    expect(FAN_CONCIERGE_SYSTEM).toContain('Supported languages');
  });

  it('adds hot-zone crowd context to fan prompts', () => {
    const { system, userMessage } = buildFanPrompt('Where should I go?', 'gate-a', {
      'gate-b': { level: 'high' },
      'gate-c': { level: 'critical' },
      'food-court': { level: 'low' },
    });

    expect(system).toContain('CROWD STATUS');
    expect(system).toContain('Gate B (West)');
    expect(system).toContain('Gate C (North)');
    expect(userMessage).toContain('[Fan Location: Gate A (Main)]');
    expect(userMessage).toContain('Where should I go?');
  });

  it('omits crowd context when every zone is normal', () => {
    const { system } = buildFanPrompt('Hello', 'unknown-zone', {
      'gate-a': { level: 'low' },
    });

    expect(system).not.toContain('CROWD STATUS');
  });

  it('builds staff analyst and shift summary snapshots from query aggregates', () => {
    const summary = {
      totalQueries: 12,
      byZone: { 'Gate A': 7 },
      byIntent: { wayfinding: 5 },
      byLanguage: { en: 9, es: 3 },
      anomalies: ['FLOW BREACH at Gate A'],
      timeRange: '15 minutes',
    };

    const staffPrompt = buildStaffPrompt('What needs attention?', summary);
    const shiftPrompt = buildShiftSummaryPrompt(summary);

    expect(STAFF_ANALYST_SYSTEM).toContain('stadium operations staff');
    expect(SHIFT_SUMMARY_SYSTEM).toContain('SITUATION OVERVIEW');
    expect(staffPrompt.userMessage).toContain('Total queries (last 15 minutes): 12');
    expect(staffPrompt.userMessage).toContain('FLOW BREACH at Gate A');
    expect(shiftPrompt.userMessage).toContain('Generate a shift briefing');
    expect(shiftPrompt.userMessage).toContain('"wayfinding":5');
  });
});
