// Social Media Simulation — generates fake social posts with sentiment
import { ZONES } from './stadium';

const HASHTAGS = ['#FIFA2026', '#WorldCup', '#FanPulse', '#LusailStadium', '#BRAvsFRA', '#WorldCup2026', '#FIFAWorldCup'];

const POSITIVE_POSTS = {
  en: [
    'Incredible atmosphere at Lusail Stadium! Best World Cup ever! 🏟️🎉',
    'Just got to my seat in {zone} — the view is UNREAL 😍',
    'The FanPulse concierge helped me find my gate in seconds! Amazing tech 🤖',
    'Food at {zone} is actually really good! Shawarma 10/10 🌯',
    'This stadium is absolutely breathtaking. Bucket list moment! ✨',
    'Staff here are so helpful, found wheelchair access immediately ♿👏',
    'GOAAAAAL! The crowd just erupted! 🔥⚽',
    'Best organized event I have ever attended. Kudos FIFA! 👏',
    'The metro to the stadium was so smooth. Great planning! 🚇',
    'VIP lounge is next level luxury 🥂',
  ],
  es: [
    '¡Increíble atmósfera en el estadio! ¡El mejor mundial! 🏟️🎉',
    'Acabo de llegar a mi asiento en {zone} — ¡la vista es INCREÍBLE! 😍',
    '¡El asistente FanPulse me ayudó a encontrar mi puerta en segundos! 🤖',
    '¡La comida en {zone} está muy buena! 🌯',
    '¡GOOOL! ¡La multitud estalló! 🔥⚽',
  ],
  pt: [
    'Atmosfera incrível no estádio! Melhor Copa do Mundo! 🏟️🎉',
    'Acabei de chegar ao meu lugar em {zone} — a vista é INACREDITÁVEL! 😍',
    'O assistente FanPulse me ajudou a achar meu portão rapidamente! 🤖',
    'GOOOL! A torcida explodiu! 🔥⚽',
  ],
  fr: [
    "Ambiance incroyable au stade ! Le meilleur Mondial ! 🏟️🎉",
    "Je viens d'arriver à ma place à {zone} — la vue est DINGUE ! 😍",
    "BUUUT ! La foule a explosé ! 🔥⚽",
  ],
  ar: [
    'أجواء مذهلة في الاستاد! أفضل كأس عالم على الإطلاق! 🏟️🎉',
    'وصلت للتو إلى مقعدي في {zone} - المنظر لا يصدق! 😍',
    'هدف! الجماهير انفجرت! 🔥⚽',
  ],
};

const NEGATIVE_POSTS = {
  en: [
    'Been waiting 20 minutes for water at {zone}. Not acceptable 😤',
    'The queue at {zone} is insane. Need more staff here ASAP',
    'WiFi keeps dropping. How is this 2026? 📶❌',
    "Can't find any signage near {zone}. Super confusing layout",
    'Restrooms at {zone} are disgusting. Please clean them 🤢',
    'Got pushed in the crowd at {zone}. Safety concern! ⚠️',
    'Prices are absolutely ridiculous. $15 for water?! 💸',
    'My kid is scared of the noise. Where is the sensory room? 😟',
  ],
  es: [
    'Llevo 20 minutos esperando agua en {zone}. Inaceptable 😤',
    'La fila en {zone} es una locura. Necesitan más personal',
    'El WiFi no funciona. ¿Cómo es posible en 2026? 📶❌',
  ],
  pt: [
    'Esperando há 20 minutos por água em {zone}. Inaceitável 😤',
    'A fila em {zone} é absurda. Precisam de mais funcionários',
  ],
  fr: [
    "J'attends depuis 20 minutes pour de l'eau à {zone}. Inacceptable 😤",
    "La file à {zone} est folle. Il faut plus de personnel",
  ],
  ar: [
    'أنتظر منذ 20 دقيقة للحصول على الماء في {zone}. غير مقبول 😤',
    'الطابور في {zone} جنوني. نحتاج المزيد من الموظفين',
  ],
};

const NEUTRAL_POSTS = {
  en: [
    'Just arrived at {zone}. Getting settled in 📍',
    'Anyone know what time halftime is?',
    'The stadium looks so different in person vs TV',
    "First World Cup game! Don't know what to expect 🏟️",
    'Taking photos of everything lol 📸',
  ],
  es: ['Acabo de llegar a {zone}. Acomodándome 📍', '¿Alguien sabe a qué hora es el medio tiempo?'],
  pt: ['Acabei de chegar em {zone}. Me acomodando 📍'],
  fr: ["Juste arrivé à {zone}. Je m'installe 📍"],
  ar: ['وصلت للتو إلى {zone}. أتأقلم 📍'],
};

const USERNAMES = [
  'FootballFan2026', 'MundialVibes', 'StadiumHopper', 'GoalMachine', 'FIFALover',
  'WCPFanatic', 'SoccerDreams', 'MatchDay_Maria', 'GolazoKing', 'StadiumSelfie',
  'PitchPerfect', 'FanZoneFred', 'CornerKickKate', 'HalfTimeHero', 'WorldCupWanderer',
  'GoalRush_22', 'CrowdSurfer', 'BootRoom_Ben', 'ScoreLine_Sara', 'TheStands',
  'FútbolForever', 'TorcidaBR', 'AlbicelesteFan', 'LesBleusLife', 'SelecaoSoul',
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const LANG_WEIGHTS = [
  { code: 'en', weight: 0.45 },
  { code: 'es', weight: 0.25 },
  { code: 'pt', weight: 0.13 },
  { code: 'fr', weight: 0.10 },
  { code: 'ar', weight: 0.07 },
];

function weightedLang() {
  let r = Math.random();
  for (const l of LANG_WEIGHTS) { r -= l.weight; if (r <= 0) return l.code; }
  return 'en';
}

let postCounter = 0;

export function generateSocialPost() {
  const lang = weightedLang();
  const sentimentRoll = Math.random();
  let sentiment, pool;

  if (sentimentRoll < 0.55) {
    sentiment = 'positive';
    pool = POSITIVE_POSTS[lang] || POSITIVE_POSTS.en;
  } else if (sentimentRoll < 0.80) {
    sentiment = 'neutral';
    pool = NEUTRAL_POSTS[lang] || NEUTRAL_POSTS.en;
  } else {
    sentiment = 'negative';
    pool = NEGATIVE_POSTS[lang] || NEGATIVE_POSTS.en;
  }

  const zone = randomItem(ZONES);
  const text = randomItem(pool).replace('{zone}', zone.name);
  const hashtags = [randomItem(HASHTAGS), randomItem(HASHTAGS)].filter((v, i, a) => a.indexOf(v) === i);

  postCounter++;
  return {
    id: `social-${Date.now()}-${postCounter}`,
    username: randomItem(USERNAMES),
    text,
    hashtags,
    sentiment,
    sentimentScore: sentiment === 'positive' ? 0.6 + Math.random() * 0.4 : sentiment === 'negative' ? -(0.3 + Math.random() * 0.5) : Math.random() * 0.3 - 0.1,
    language: lang,
    zone: zone.id,
    zoneName: zone.name,
    likes: Math.floor(Math.random() * 200),
    retweets: Math.floor(Math.random() * 50),
    timestamp: new Date().toISOString(),
    platform: Math.random() > 0.3 ? 'twitter' : Math.random() > 0.5 ? 'instagram' : 'tiktok',
  };
}

export function generateSocialBatch(count = 25) {
  const posts = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const post = generateSocialPost();
    post.timestamp = new Date(now - Math.random() * 30 * 60 * 1000).toISOString();
    posts.push(post);
  }
  return posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Compute sentiment aggregates
export function computeSentimentStats(posts) {
  if (posts.length === 0) return { overall: 0, positive: 0, neutral: 0, negative: 0, total: 0 };
  const positive = posts.filter(p => p.sentiment === 'positive').length;
  const negative = posts.filter(p => p.sentiment === 'negative').length;
  const neutral = posts.filter(p => p.sentiment === 'neutral').length;
  const avgScore = posts.reduce((s, p) => s + p.sentimentScore, 0) / posts.length;
  return {
    overall: Math.round(avgScore * 100) / 100,
    positive: Math.round((positive / posts.length) * 100),
    neutral: Math.round((neutral / posts.length) * 100),
    negative: Math.round((negative / posts.length) * 100),
    total: posts.length,
    topHashtags: getTopHashtags(posts, 5),
  };
}

function getTopHashtags(posts, limit) {
  const counts = {};
  posts.forEach(p => p.hashtags.forEach(h => { counts[h] = (counts[h] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag, count]) => ({ tag, count }));
}

// Weather data (mock)
export const WEATHER_DATA = {
  temperature: 32,
  feelsLike: 36,
  humidity: 45,
  windSpeed: 12,
  windDirection: 'NE',
  uvIndex: 7,
  condition: 'Clear',
  icon: '☀️',
  roofStatus: 'Partially Open',
  heatStressIndex: 'Moderate',
  sunset: '18:42',
  sunrise: '05:15',
  alerts: [
    { type: 'UV', message: 'High UV index in Upper Tier — recommend sunscreen advisory for exposed sections' },
  ],
};

// Food menu data
export const FOOD_MENU = [
  { id: 'f1', name: 'Classic Burger', price: 12, category: 'Main', zone: 'food-court', waitTime: 5, emoji: '🍔', popular: true },
  { id: 'f2', name: 'Chicken Shawarma', price: 10, category: 'Main', zone: 'food-court', waitTime: 7, emoji: '🌯', popular: true },
  { id: 'f3', name: 'Margherita Pizza', price: 14, category: 'Main', zone: 'food-court', waitTime: 10, emoji: '🍕', popular: false },
  { id: 'f4', name: 'Fish & Chips', price: 13, category: 'Main', zone: 'east-plaza', waitTime: 8, emoji: '🐟', popular: false },
  { id: 'f5', name: 'Falafel Wrap', price: 9, category: 'Main', zone: 'food-court', waitTime: 4, emoji: '🧆', popular: true },
  { id: 'f6', name: 'Nachos Grande', price: 11, category: 'Snack', zone: 'section-102', waitTime: 3, emoji: '🌮', popular: false },
  { id: 'f7', name: 'Hot Dog', price: 8, category: 'Snack', zone: 'section-108', waitTime: 2, emoji: '🌭', popular: true },
  { id: 'f8', name: 'Pretzel', price: 6, category: 'Snack', zone: 'west-concourse', waitTime: 2, emoji: '🥨', popular: false },
  { id: 'f9', name: 'French Fries', price: 5, category: 'Snack', zone: 'east-plaza', waitTime: 3, emoji: '🍟', popular: true },
  { id: 'f10', name: 'Ice Cream', price: 7, category: 'Dessert', zone: 'food-court', waitTime: 2, emoji: '🍦', popular: true },
  { id: 'f11', name: 'Water Bottle', price: 4, category: 'Drink', zone: 'all', waitTime: 1, emoji: '💧', popular: true },
  { id: 'f12', name: 'Soft Drink', price: 5, category: 'Drink', zone: 'all', waitTime: 1, emoji: '🥤', popular: true },
  { id: 'f13', name: 'Fresh Juice', price: 8, category: 'Drink', zone: 'food-court', waitTime: 3, emoji: '🧃', popular: false },
  { id: 'f14', name: 'Arabic Coffee', price: 6, category: 'Drink', zone: 'vip-lounge', waitTime: 4, emoji: '☕', popular: false },
  { id: 'f15', name: 'Team Jersey', price: 89, category: 'Merchandise', zone: 'west-concourse', waitTime: 5, emoji: '👕', popular: true },
  { id: 'f16', name: 'Match Program', price: 15, category: 'Merchandise', zone: 'gate-a', waitTime: 1, emoji: '📖', popular: false },
  { id: 'f17', name: 'Scarf', price: 25, category: 'Merchandise', zone: 'east-plaza', waitTime: 2, emoji: '🧣', popular: true },
  { id: 'f18', name: 'Cap', price: 30, category: 'Merchandise', zone: 'west-concourse', waitTime: 2, emoji: '🧢', popular: false },
];

// Incident templates
export const INCIDENT_TYPES = [
  { type: 'medical', icon: '🏥', severity: 'high', label: 'Medical Emergency' },
  { type: 'security', icon: '🛡️', severity: 'high', label: 'Security Incident' },
  { type: 'facility', icon: '🔧', severity: 'medium', label: 'Facility Issue' },
  { type: 'crowd', icon: '👥', severity: 'high', label: 'Crowd Control' },
  { type: 'lost_child', icon: '👶', severity: 'critical', label: 'Lost Child' },
  { type: 'vandalism', icon: '💔', severity: 'medium', label: 'Vandalism' },
  { type: 'spill', icon: '💦', severity: 'low', label: 'Spill/Cleanup' },
  { type: 'power', icon: '⚡', severity: 'high', label: 'Power Issue' },
];

let incidentCounter = 0;
export function generateIncident() {
  const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  const staffNames = ['Officer Martinez', 'Medic Patel', 'Supervisor Chen', 'Guard Okonkwo', 'Tech Müller', 'Coord. Silva'];
  incidentCounter++;
  return {
    id: `inc-${Date.now()}-${incidentCounter}`,
    ...type,
    zone: zone.id,
    zoneName: zone.name,
    status: 'active',
    assignedTo: staffNames[Math.floor(Math.random() * staffNames.length)],
    reportedAt: new Date().toISOString(),
    description: `${type.label} reported at ${zone.name}. ${type.severity === 'critical' ? 'IMMEDIATE response required.' : 'Staff dispatched.'}`,
  };
}

export function generateInitialIncidents(count = 4) {
  const incidents = [];
  const statuses = ['active', 'active', 'in_progress', 'resolved'];
  for (let i = 0; i < count; i++) {
    const inc = generateIncident();
    inc.status = statuses[i % statuses.length];
    inc.reportedAt = new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString();
    if (inc.status === 'resolved') {
      inc.resolvedAt = new Date(new Date(inc.reportedAt).getTime() + Math.random() * 20 * 60 * 1000).toISOString();
    }
    incidents.push(inc);
  }
  return incidents;
}
