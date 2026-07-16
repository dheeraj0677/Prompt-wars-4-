import { describe, expect, it } from 'vitest';
import {
  getAdjacentZones,
  getZoneById,
  getZonesByType,
  INTENT_CATEGORIES,
  SUPPORTED_LANGUAGES,
  ZONES,
} from './stadium';

describe('stadium data helpers', () => {
  it('returns zones by id and handles missing ids', () => {
    expect(getZoneById('gate-a')?.name).toBe('Gate A (Main)');
    expect(getZoneById('missing-zone')).toBeNull();
  });

  it('returns adjacent zone objects and filters unknown zones', () => {
    const adjacent = getAdjacentZones('gate-a').map(zone => zone.id);
    expect(adjacent).toEqual(expect.arrayContaining(['west-concourse', 'section-102']));
    expect(getAdjacentZones('missing-zone')).toEqual([]);
  });

  it('groups zones by type', () => {
    expect(getZonesByType('gate')).toHaveLength(3);
    expect(getZonesByType('seating').map(zone => zone.id)).toEqual(['section-102', 'section-108']);
  });

  it('defines complete operating metadata', () => {
    expect(ZONES).toHaveLength(9);
    expect(INTENT_CATEGORIES).toContain('emergency');
    expect(SUPPORTED_LANGUAGES.map(lang => lang.code)).toEqual(['en', 'es', 'pt', 'fr', 'ar']);
  });
});
