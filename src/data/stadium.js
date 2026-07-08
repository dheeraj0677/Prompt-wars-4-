// Stadium zone definitions for Lusail Stadium — FIFA World Cup 2026
export const STADIUM_NAME = 'Lusail Stadium';
export const MATCH_TIME = '20:00';
export const VENUE_CITY = 'Lusail, Qatar';

export const ZONES = [
  {
    id: 'gate-a',
    name: 'Gate A (Main)',
    shortName: 'Gate A',
    type: 'gate',
    level: 1,
    x: 15, y: 10,
    width: 22, height: 14,
    color: '#3b82f6',
    amenities: ['Information Desk', 'First Aid', 'Security Check'],
    accessibility: { wheelchair: true, elevator: 'Elevator 1', ramp: true, sensoryRoom: false },
    transport: { shuttle: 'Shuttle Stop A — every 8 min', parking: 'Lot A (500m)', train: 'Lusail Metro — 3 min walk' },
    adjacent: ['west-concourse', 'section-102'],
    capacity: 4000,
  },
  {
    id: 'gate-b',
    name: 'Gate B (West)',
    shortName: 'Gate B',
    type: 'gate',
    level: 1,
    x: 5, y: 35,
    width: 22, height: 14,
    color: '#ef4444',
    amenities: ['Information Desk', 'Lost & Found', 'ATM'],
    accessibility: { wheelchair: true, elevator: 'Elevator 2', ramp: true, sensoryRoom: false },
    transport: { shuttle: 'Shuttle Stop B — every 10 min', parking: 'Lot B (300m)', train: 'Lusail Metro — 7 min walk' },
    adjacent: ['west-concourse', 'east-plaza', 'section-108'],
    capacity: 3500,
  },
  {
    id: 'gate-c',
    name: 'Gate C (North)',
    shortName: 'Gate C',
    type: 'gate',
    level: 1,
    x: 60, y: 72,
    width: 22, height: 14,
    color: '#10b981',
    amenities: ['Information Desk', 'Family Zone', 'Prayer Room'],
    accessibility: { wheelchair: true, elevator: 'Elevator 3', ramp: true, sensoryRoom: true },
    transport: { shuttle: 'Shuttle Stop C — every 12 min', parking: 'Lot C (400m)', train: 'Lusail Metro — 5 min walk' },
    adjacent: ['food-court', 'section-108'],
    capacity: 3000,
  },
  {
    id: 'west-concourse',
    name: 'West Concourse',
    shortName: 'W. Concourse',
    type: 'concourse',
    level: 1,
    x: 5, y: 10,
    width: 22, height: 18,
    color: '#8b5cf6',
    amenities: ['Restrooms', 'Water Stations', 'Merchandise Shop'],
    accessibility: { wheelchair: true, elevator: 'Elevator 1', ramp: true, sensoryRoom: false },
    transport: null,
    adjacent: ['gate-a', 'gate-b', 'vip-lounge'],
    capacity: 2000,
  },
  {
    id: 'east-plaza',
    name: 'East Plaza',
    shortName: 'E. Plaza',
    type: 'concourse',
    level: 1,
    x: 38, y: 35,
    width: 22, height: 14,
    color: '#f59e0b',
    amenities: ['Fan Zone', 'Live Screen', 'Food Trucks', 'Restrooms'],
    accessibility: { wheelchair: true, elevator: null, ramp: true, sensoryRoom: false },
    transport: { shuttle: 'Shuttle Stop D — every 6 min', parking: null, train: null },
    adjacent: ['gate-b', 'section-102', 'food-court'],
    capacity: 5000,
  },
  {
    id: 'section-102',
    name: 'Section 102',
    shortName: 'Sec 102',
    type: 'seating',
    level: 2,
    x: 38, y: 10,
    width: 22, height: 14,
    color: '#06b6d4',
    amenities: ['Concessions', 'Restrooms'],
    accessibility: { wheelchair: true, elevator: 'Elevator 4', ramp: true, sensoryRoom: false },
    transport: null,
    adjacent: ['gate-a', 'east-plaza', 'section-108'],
    capacity: 6000,
  },
  {
    id: 'section-108',
    name: 'Section 108',
    shortName: 'Sec 108',
    type: 'seating',
    level: 2,
    x: 60, y: 35,
    width: 22, height: 14,
    color: '#ec4899',
    amenities: ['Concessions', 'Restrooms'],
    accessibility: { wheelchair: true, elevator: 'Elevator 5', ramp: false, sensoryRoom: false },
    transport: null,
    adjacent: ['gate-b', 'gate-c', 'section-102'],
    capacity: 6000,
  },
  {
    id: 'food-court',
    name: 'Food Court North',
    shortName: 'Food Court',
    type: 'amenity',
    level: 1,
    x: 38, y: 55,
    width: 22, height: 14,
    color: '#f97316',
    amenities: ['International Food Court', 'Halal Options', 'Vegetarian Corner', 'Water Refill Station'],
    accessibility: { wheelchair: true, elevator: null, ramp: true, sensoryRoom: false },
    transport: null,
    adjacent: ['east-plaza', 'gate-c', 'vip-lounge'],
    capacity: 1500,
  },
  {
    id: 'vip-lounge',
    name: 'VIP Lounge',
    shortName: 'VIP',
    type: 'vip',
    level: 3,
    x: 5, y: 55,
    width: 22, height: 14,
    color: '#a855f7',
    amenities: ['Premium Dining', 'Private Restrooms', 'Lounge Seating', 'Concierge Desk'],
    accessibility: { wheelchair: true, elevator: 'Elevator 6', ramp: true, sensoryRoom: true },
    transport: { shuttle: 'VIP Shuttle — on demand', parking: 'VIP Lot (100m)', train: null },
    adjacent: ['west-concourse', 'food-court'],
    capacity: 500,
  },
];

export const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]));

export function getZoneById(id) {
  return ZONE_MAP[id] || null;
}

export function getAdjacentZones(zoneId) {
  const zone = ZONE_MAP[zoneId];
  if (!zone) return [];
  return zone.adjacent.map(id => ZONE_MAP[id]).filter(Boolean);
}

export function getZonesByType(type) {
  return ZONES.filter(z => z.type === type);
}

// Intent categories for tagging
export const INTENT_CATEGORIES = [
  'wayfinding',
  'accessibility',
  'transport',
  'food_drink',
  'restroom',
  'safety',
  'emergency',
  'lost_found',
  'schedule',
  'general',
];

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];
