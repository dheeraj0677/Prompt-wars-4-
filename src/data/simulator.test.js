import { describe, it, expect } from 'vitest';
import { generateSyntheticQuery, generateInitialBatch } from './simulator';

// ── generateSyntheticQuery ──────────────────────────────────

describe('generateSyntheticQuery', () => {
  it('returns a well-formed query object', () => {
    const query = generateSyntheticQuery();
    expect(query).toHaveProperty('id');
    expect(query).toHaveProperty('message');
    expect(query).toHaveProperty('language');
    expect(query).toHaveProperty('intent');
    expect(query).toHaveProperty('zoneId');
    expect(query).toHaveProperty('zoneName');
    expect(query).toHaveProperty('timestamp');
    expect(query).toHaveProperty('isSimulated');
    expect(query).toHaveProperty('urgency');
  });

  it('always marks queries as simulated', () => {
    const query = generateSyntheticQuery();
    expect(query.isSimulated).toBe(true);
  });

  it('generates a valid ISO timestamp', () => {
    const query = generateSyntheticQuery();
    const parsed = new Date(query.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it('generates unique IDs across multiple calls', () => {
    const ids = new Set();
    for (let i = 0; i < 50; i++) {
      ids.add(generateSyntheticQuery().id);
    }
    expect(ids.size).toBe(50);
  });

  it('uses one of the supported languages', () => {
    const supportedLangs = ['en', 'es', 'pt', 'fr', 'ar'];
    for (let i = 0; i < 20; i++) {
      const query = generateSyntheticQuery();
      expect(supportedLangs).toContain(query.language);
    }
  });

  it('uses one of the valid intent categories', () => {
    const validIntents = [
      'wayfinding', 'accessibility', 'transport', 'food_drink',
      'restroom', 'safety', 'emergency', 'lost_found', 'schedule', 'general',
    ];
    for (let i = 0; i < 20; i++) {
      const query = generateSyntheticQuery();
      expect(validIntents).toContain(query.intent);
    }
  });

  it('assigns correct urgency based on intent', () => {
    // Generate enough queries to hit emergency and safety
    for (let i = 0; i < 200; i++) {
      const query = generateSyntheticQuery();
      if (query.intent === 'emergency') {
        expect(query.urgency).toBe('critical');
      } else if (query.intent === 'safety') {
        expect(query.urgency).toBe('high');
      } else {
        expect(query.urgency).toBe('normal');
      }
    }
  });

  it('generates a non-empty message string', () => {
    const query = generateSyntheticQuery();
    expect(typeof query.message).toBe('string');
    expect(query.message.length).toBeGreaterThan(0);
  });

  it('does not contain {zone} template placeholder in message', () => {
    for (let i = 0; i < 50; i++) {
      const query = generateSyntheticQuery();
      expect(query.message).not.toContain('{zone}');
    }
  });
});

// ── generateInitialBatch ────────────────────────────────────

describe('generateInitialBatch', () => {
  it('generates the default number of queries (40)', () => {
    const batch = generateInitialBatch();
    expect(batch).toHaveLength(40);
  });

  it('generates the requested number of queries', () => {
    const batch = generateInitialBatch(10);
    expect(batch).toHaveLength(10);
  });

  it('returns queries sorted by timestamp (oldest first)', () => {
    const batch = generateInitialBatch(20);
    for (let i = 1; i < batch.length; i++) {
      const prev = new Date(batch[i - 1].timestamp).getTime();
      const curr = new Date(batch[i].timestamp).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it('generates timestamps within the last 15 minutes', () => {
    const now = Date.now();
    const batch = generateInitialBatch(20);
    for (const q of batch) {
      const age = now - new Date(q.timestamp).getTime();
      expect(age).toBeLessThanOrEqual(15 * 60 * 1000 + 1000); // Allow 1s margin
      expect(age).toBeGreaterThanOrEqual(0);
    }
  });

  it('all queries in batch are marked as simulated', () => {
    const batch = generateInitialBatch(10);
    for (const q of batch) {
      expect(q.isSimulated).toBe(true);
    }
  });

  it('all queries in batch have required properties', () => {
    const batch = generateInitialBatch(5);
    const requiredProps = ['id', 'message', 'language', 'intent', 'zoneId', 'zoneName', 'timestamp', 'isSimulated', 'urgency'];
    for (const q of batch) {
      for (const prop of requiredProps) {
        expect(q).toHaveProperty(prop);
      }
    }
  });
});
