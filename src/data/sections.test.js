import { describe, expect, it } from 'vitest';
import {
  PRICE_TIERS,
  SECTIONS,
  TIERS,
  getAvailableSections,
  getBestViewSections,
  getSectionLiveData,
  getStadiumTotals,
  refreshSectionLiveData,
} from './sections';

describe('stadium section data', () => {
  it('defines all bowl sections and pricing tiers', () => {
    expect(SECTIONS).toHaveLength(24);
    expect(TIERS.LOWER.priceMultiplier).toBeGreaterThan(TIERS.UPPER.priceMultiplier);
    expect(PRICE_TIERS.ULTRA_VIP.basePrice).toBeGreaterThan(PRICE_TIERS.ECONOMY.basePrice);
  });

  it('generates cached live data for every section', () => {
    const first = refreshSectionLiveData();
    const second = getSectionLiveData();

    expect(second).toBe(first);
    expect(Object.keys(second)).toHaveLength(SECTIONS.length);
    expect(second.L101).toEqual(expect.objectContaining({
      occupancy: expect.any(Number),
      ticketsSold: expect.any(Number),
      ticketsAvailable: expect.any(Number),
      currentAttendance: expect.any(Number),
      crowdDensity: expect.stringMatching(/low|medium|high|critical/),
    }));
  });

  it('computes stadium totals from live section data', () => {
    refreshSectionLiveData();
    const totals = getStadiumTotals();

    expect(totals.totalCapacity).toBe(SECTIONS.reduce((sum, section) => sum + section.capacity, 0));
    expect(totals.totalSold).toBeGreaterThan(0);
    expect(totals.occupancyRate).toBeGreaterThan(0);
    expect(totals.avgTicketPrice).toBeGreaterThan(0);
  });

  it('sorts best-view and available sections', () => {
    refreshSectionLiveData();
    const best = getBestViewSections(3);
    const available = getAvailableSections();

    expect(best).toHaveLength(3);
    expect(best[0].viewRating).toBeGreaterThanOrEqual(best[1].viewRating);
    expect(available.length).toBeGreaterThan(0);
    expect(available[0].ticketsAvailable).toBeGreaterThanOrEqual(available.at(-1).ticketsAvailable);
  });
});
