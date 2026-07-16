// 24 Stadium Sections — detailed bowl layout for heatmap visualization
// Lusail Stadium (80,000 capacity) — FIFA World Cup 2026

export const TIERS = {
  LOWER: { name: 'Lower Tier', level: 1, priceMultiplier: 1.5 },
  MIDDLE: { name: 'Middle Tier', level: 2, priceMultiplier: 1.0 },
  UPPER: { name: 'Upper Tier', level: 3, priceMultiplier: 0.7 },
  VIP: { name: 'VIP / Hospitality', level: 0, priceMultiplier: 4.0 },
};

export const PRICE_TIERS = {
  ECONOMY: { name: 'Economy', color: '#6b7280', basePrice: 120 },
  STANDARD: { name: 'Standard', color: '#3b82f6', basePrice: 250 },
  PREMIUM: { name: 'Premium', color: '#f59e0b', basePrice: 480 },
  VIP: { name: 'VIP', color: '#a855f7', basePrice: 950 },
  ULTRA_VIP: { name: 'Ultra VIP', color: '#ec4899', basePrice: 2200 },
};

// Each section positioned around an oval stadium bowl
// angle: position around the oval (0=north, 90=east, 180=south, 270=west)
// tier: lower/middle/upper/vip
export const SECTIONS = [
  // ── Lower Tier (closest to pitch) ──
  { id: 'L101', name: 'Section 101', tier: 'LOWER', angle: 0, capacity: 3200, viewRating: 8.5, priceTier: 'PREMIUM', rows: 28, features: ['Corner Flag View', 'Close to Pitch'] },
  { id: 'L102', name: 'Section 102', tier: 'LOWER', angle: 30, capacity: 3400, viewRating: 9.1, priceTier: 'PREMIUM', rows: 30, features: ['Midfield Adjacent', 'Player Tunnel View'] },
  { id: 'L103', name: 'Section 103', tier: 'LOWER', angle: 60, capacity: 3400, viewRating: 9.5, priceTier: 'VIP', rows: 30, features: ['Center Midfield', 'Best Lower Tier View'] },
  { id: 'L104', name: 'Section 104', tier: 'LOWER', angle: 90, capacity: 3200, viewRating: 9.2, priceTier: 'PREMIUM', rows: 28, features: ['Midfield', 'Bench Side'] },
  { id: 'L105', name: 'Section 105', tier: 'LOWER', angle: 120, capacity: 3400, viewRating: 8.8, priceTier: 'PREMIUM', rows: 30, features: ['Goal End View'] },
  { id: 'L106', name: 'Section 106', tier: 'LOWER', angle: 150, capacity: 3200, viewRating: 8.3, priceTier: 'STANDARD', rows: 28, features: ['Corner View'] },
  { id: 'L107', name: 'Section 107', tier: 'LOWER', angle: 180, capacity: 3400, viewRating: 8.6, priceTier: 'PREMIUM', rows: 30, features: ['South Goal End'] },
  { id: 'L108', name: 'Section 108', tier: 'LOWER', angle: 210, capacity: 3400, viewRating: 9.0, priceTier: 'PREMIUM', rows: 30, features: ['Midfield Adjacent'] },
  { id: 'L109', name: 'Section 109', tier: 'LOWER', angle: 240, capacity: 3400, viewRating: 9.4, priceTier: 'VIP', rows: 30, features: ['Center Midfield', 'Camera Side', 'TV View'] },
  { id: 'L110', name: 'Section 110', tier: 'LOWER', angle: 270, capacity: 3200, viewRating: 9.3, priceTier: 'VIP', rows: 28, features: ['Midfield', 'Main Camera'] },
  { id: 'L111', name: 'Section 111', tier: 'LOWER', angle: 300, capacity: 3400, viewRating: 8.9, priceTier: 'PREMIUM', rows: 30, features: ['Goal End'] },
  { id: 'L112', name: 'Section 112', tier: 'LOWER', angle: 330, capacity: 3200, viewRating: 8.4, priceTier: 'STANDARD', rows: 28, features: ['Corner View'] },

  // ── Upper Tier ──
  { id: 'U201', name: 'Section 201', tier: 'UPPER', angle: 0, capacity: 4000, viewRating: 7.2, priceTier: 'STANDARD', rows: 35, features: ['Panoramic View', 'Covered'] },
  { id: 'U202', name: 'Section 202', tier: 'UPPER', angle: 45, capacity: 4200, viewRating: 7.8, priceTier: 'STANDARD', rows: 38, features: ['Wide Angle View'] },
  { id: 'U203', name: 'Section 203', tier: 'UPPER', angle: 90, capacity: 4200, viewRating: 8.0, priceTier: 'STANDARD', rows: 38, features: ['Midfield Elevated', 'Full Pitch View'] },
  { id: 'U204', name: 'Section 204', tier: 'UPPER', angle: 135, capacity: 4000, viewRating: 7.5, priceTier: 'ECONOMY', rows: 35, features: ['Goal End Elevated'] },
  { id: 'U205', name: 'Section 205', tier: 'UPPER', angle: 180, capacity: 4200, viewRating: 7.3, priceTier: 'ECONOMY', rows: 38, features: ['South View'] },
  { id: 'U206', name: 'Section 206', tier: 'UPPER', angle: 225, capacity: 4200, viewRating: 7.9, priceTier: 'STANDARD', rows: 38, features: ['Wide Angle View'] },
  { id: 'U207', name: 'Section 207', tier: 'UPPER', angle: 270, capacity: 4200, viewRating: 8.1, priceTier: 'STANDARD', rows: 38, features: ['Midfield Elevated', 'Camera Side'] },
  { id: 'U208', name: 'Section 208', tier: 'UPPER', angle: 315, capacity: 4000, viewRating: 7.6, priceTier: 'ECONOMY', rows: 35, features: ['Corner Elevated'] },

  // ── VIP / Hospitality ──
  { id: 'V301', name: 'VIP West', tier: 'VIP', angle: 270, capacity: 1200, viewRating: 9.8, priceTier: 'ULTRA_VIP', rows: 12, features: ['Premium Dining', 'Private Lounge', 'Best View in Stadium'] },
  { id: 'V302', name: 'VIP East', tier: 'VIP', angle: 90, capacity: 1200, viewRating: 9.6, priceTier: 'ULTRA_VIP', rows: 12, features: ['Premium Dining', 'Skybox Access'] },
  { id: 'V303', name: 'VIP North', tier: 'VIP', angle: 0, capacity: 800, viewRating: 9.0, priceTier: 'VIP', rows: 8, features: ['Corner Hospitality', 'Open Bar'] },
  { id: 'V304', name: 'VIP South', tier: 'VIP', angle: 180, capacity: 800, viewRating: 8.8, priceTier: 'VIP', rows: 8, features: ['Goal End Hospitality', 'Premium Catering'] },
];

// Generate simulated live data for each section
let _sectionLiveData = null;

export function getSectionLiveData() {
  if (!_sectionLiveData) {
    _sectionLiveData = {};
    SECTIONS.forEach(sec => {
      const occupancyBase = sec.tier === 'VIP' ? 0.92 : sec.tier === 'LOWER' ? 0.88 : 0.78;
      const occupancy = Math.min(1, occupancyBase + (Math.random() * 0.15 - 0.05));
      const ticketsSold = Math.floor(sec.capacity * (occupancy + Math.random() * 0.05));

      _sectionLiveData[sec.id] = {
        occupancy: Math.round(occupancy * 100),
        ticketsSold: Math.min(ticketsSold, sec.capacity),
        ticketsAvailable: Math.max(0, sec.capacity - ticketsSold),
        currentAttendance: Math.floor(ticketsSold * (0.85 + Math.random() * 0.12)),
        temperature: Math.round(28 + Math.random() * 8), // 28-36°C
        noiseLevel: Math.round(70 + Math.random() * 25), // 70-95 dB
        crowdDensity: occupancy > 0.9 ? 'critical' : occupancy > 0.75 ? 'high' : occupancy > 0.5 ? 'medium' : 'low',
        revenue: Math.round(ticketsSold * (PRICE_TIERS[sec.priceTier]?.basePrice || 250)),
      };
    });
  }
  return _sectionLiveData;
}

// Refresh live data (simulate changes)
export function refreshSectionLiveData() {
  _sectionLiveData = null;
  return getSectionLiveData();
}

// Get total stadium stats
export function getStadiumTotals() {
  const live = getSectionLiveData();
  let totalCapacity = 0, totalSold = 0, totalAttendance = 0, totalRevenue = 0;
  SECTIONS.forEach(sec => {
    totalCapacity += sec.capacity;
    totalSold += live[sec.id].ticketsSold;
    totalAttendance += live[sec.id].currentAttendance;
    totalRevenue += live[sec.id].revenue;
  });
  return {
    totalCapacity,
    totalSold,
    totalAttendance,
    totalRevenue,
    occupancyRate: Math.round((totalSold / totalCapacity) * 100),
    attendanceRate: Math.round((totalAttendance / totalSold) * 100),
    noShowRate: Math.round(((totalSold - totalAttendance) / totalSold) * 100),
    avgTicketPrice: Math.round(totalRevenue / totalSold),
  };
}

// Best view sections sorted by rating
export function getBestViewSections(limit = 5) {
  return [...SECTIONS]
    .sort((a, b) => b.viewRating - a.viewRating)
    .slice(0, limit);
}

// Sections with availability
export function getAvailableSections() {
  const live = getSectionLiveData();
  return SECTIONS
    .filter(sec => live[sec.id].ticketsAvailable > 0)
    .map(sec => ({ ...sec, ...live[sec.id] }))
    .sort((a, b) => b.ticketsAvailable - a.ticketsAvailable);
}
