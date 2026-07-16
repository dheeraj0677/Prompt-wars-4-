// Synthetic fan query generator — simulates a live stream of multilingual fan interactions
import { ZONES } from './stadium';

const QUERY_TEMPLATES = {
  en: {
    wayfinding: [
      'How do I get to {zone} from here?',
      'Where is the nearest entrance to {zone}?',
      'Can you show me the way to {zone}?',
      "I'm lost, trying to find {zone}",
      'Which direction is {zone}?',
      'Is there a shortcut to {zone}?',
    ],
    accessibility: [
      'Where is the nearest wheelchair ramp?',
      'Is there an elevator near {zone}?',
      'Where is the sensory-friendly zone?',
      'I need an accessible restroom near {zone}',
      'Can I get wheelchair assistance at {zone}?',
      'Where is the nearest accessible entrance?',
    ],
    transport: [
      'When is the next shuttle from {zone}?',
      'Where is the closest parking lot?',
      'How do I get to the metro station?',
      'What time is the last train after the match?',
      'Is there a taxi stand near {zone}?',
      'Where can I find ride-share pickup?',
    ],
    food_drink: [
      "What's open at the Food Court?",
      'Where can I get water near {zone}?',
      'Are there halal food options?',
      'Where is the nearest concession stand?',
      'Can I find vegetarian food near {zone}?',
      'Where can I refill my water bottle?',
    ],
    restroom: [
      'Where is the nearest restroom?',
      'Are the restrooms near {zone} crowded?',
      'Where is the family restroom?',
      'I need a restroom urgently near {zone}',
      'Accessible restroom near {zone}?',
    ],
    safety: [
      'Where is the first aid station?',
      'I need medical help at {zone}',
      'Where is the nearest emergency exit?',
      'Who do I contact for a security issue?',
      'Is there a lost child station?',
    ],
    emergency: [
      'There is a medical emergency at {zone}!',
      'I see smoke near {zone}',
      'Someone collapsed near {zone}',
      'Fight breaking out at {zone}',
    ],
    lost_found: [
      'I lost my bag near {zone}',
      'Where is lost and found?',
      'Has anyone turned in a phone?',
      'I lost my ticket, what do I do?',
    ],
    schedule: [
      'What time does the match start?',
      'When do gates open?',
      'Is there a halftime show?',
      'What time should I leave to catch my train?',
    ],
    general: [
      "What's the Wi-Fi password?",
      'Can I bring my camera inside?',
      'Where can I buy merchandise?',
      'Is there a fan zone?',
      'How can I report an issue?',
    ],
  },
  es: {
    wayfinding: [
      '¿Cómo llego a {zone} desde aquí?',
      '¿Dónde está la entrada más cercana a {zone}?',
      'Estoy perdido, busco {zone}',
      '¿Dónde está la salida más cercana a {zone}?',
    ],
    accessibility: [
      '¿Dónde hay una rampa para silla de ruedas?',
      '¿Hay ascensor cerca de {zone}?',
      'Necesito un baño accesible cerca de {zone}',
    ],
    transport: [
      '¿Cuándo sale el próximo shuttle de {zone}?',
      '¿Dónde está el estacionamiento más cercano?',
      '¿A qué hora es el último tren?',
    ],
    food_drink: [
      '¿Qué hay abierto en la zona de comida?',
      '¿Dónde puedo conseguir agua cerca de {zone}?',
      '¿Hay opciones halal?',
    ],
    restroom: [
      '¿Dónde está el baño más cercano?',
      '¿Los baños de {zone} están llenos?',
    ],
    safety: [
      '¿Dónde está la estación de primeros auxilios?',
      'Necesito ayuda médica en {zone}',
    ],
    emergency: [
      '¡Hay una emergencia médica en {zone}!',
    ],
    lost_found: [
      'Perdí mi bolso cerca de {zone}',
      '¿Dónde está objetos perdidos?',
    ],
    schedule: [
      '¿A qué hora empieza el partido?',
      '¿Cuándo abren las puertas?',
    ],
    general: [
      '¿Cuál es la clave del Wi-Fi?',
      '¿Dónde puedo comprar recuerdos?',
    ],
  },
  pt: {
    wayfinding: [
      'Como chego ao {zone} daqui?',
      'Onde fica a entrada mais próxima do {zone}?',
      'Estou perdido, procuro o {zone}',
    ],
    accessibility: [
      'Onde tem rampa para cadeira de rodas?',
      'Tem elevador perto do {zone}?',
    ],
    transport: [
      'Quando sai o próximo ônibus do {zone}?',
      'Onde é o estacionamento mais perto?',
    ],
    food_drink: [
      'O que tem aberto na praça de alimentação?',
      'Onde posso pegar água perto do {zone}?',
    ],
    restroom: [
      'Onde fica o banheiro mais próximo?',
      'Os banheiros do {zone} estão cheios?',
    ],
    safety: [
      'Onde fica o posto médico?',
      'Preciso de ajuda médica no {zone}',
    ],
    emergency: [
      'Emergência médica no {zone}!',
    ],
    lost_found: [
      'Perdi minha bolsa perto do {zone}',
    ],
    schedule: [
      'Que horas começa o jogo?',
    ],
    general: [
      'Qual a senha do Wi-Fi?',
    ],
  },
  fr: {
    wayfinding: [
      'Comment aller à {zone} depuis ici?',
      "Où est l'entrée la plus proche de {zone}?",
      'Je suis perdu, je cherche {zone}',
    ],
    accessibility: [
      "Où est la rampe d'accès la plus proche?",
      'Y a-t-il un ascenseur près de {zone}?',
    ],
    transport: [
      'Quand part la prochaine navette de {zone}?',
      'Où est le parking le plus proche?',
    ],
    food_drink: [
      "Qu'est-ce qui est ouvert au food court?",
      "Où puis-je trouver de l'eau près de {zone}?",
    ],
    restroom: [
      'Où sont les toilettes les plus proches?',
    ],
    safety: [
      'Où est le poste de secours?',
    ],
    emergency: [
      'Urgence médicale à {zone}!',
    ],
    lost_found: [
      "J'ai perdu mon sac près de {zone}",
    ],
    schedule: [
      'À quelle heure commence le match?',
    ],
    general: [
      'Quel est le mot de passe Wi-Fi?',
    ],
  },
  ar: {
    wayfinding: [
      'كيف أصل إلى {zone} من هنا؟',
      'أين أقرب مدخل إلى {zone}؟',
      'أنا ضائع، أبحث عن {zone}',
    ],
    accessibility: [
      'أين أقرب منحدر لكرسي متحرك؟',
      'هل يوجد مصعد بالقرب من {zone}؟',
    ],
    transport: [
      'متى الحافلة القادمة من {zone}؟',
      'أين أقرب موقف سيارات؟',
    ],
    food_drink: [
      'ماذا يوجد في منطقة الطعام؟',
      'أين يمكنني الحصول على ماء بالقرب من {zone}؟',
    ],
    restroom: [
      'أين أقرب حمام؟',
    ],
    safety: [
      'أين محطة الإسعافات الأولية؟',
    ],
    emergency: [
      'حالة طوارئ طبية في {zone}!',
    ],
    lost_found: [
      'فقدت حقيبتي بالقرب من {zone}',
    ],
    schedule: [
      'متى تبدأ المباراة؟',
    ],
    general: [
      'ما هي كلمة مرور الواي فاي؟',
    ],
  },
};

const LANGUAGE_WEIGHTS = [
  { code: 'en', weight: 0.40 },
  { code: 'es', weight: 0.25 },
  { code: 'pt', weight: 0.15 },
  { code: 'fr', weight: 0.10 },
  { code: 'ar', weight: 0.10 },
];

const INTENT_WEIGHTS = [
  { intent: 'wayfinding', weight: 0.25 },
  { intent: 'food_drink', weight: 0.15 },
  { intent: 'restroom', weight: 0.15 },
  { intent: 'transport', weight: 0.12 },
  { intent: 'accessibility', weight: 0.08 },
  { intent: 'safety', weight: 0.07 },
  { intent: 'schedule', weight: 0.06 },
  { intent: 'lost_found', weight: 0.05 },
  { intent: 'general', weight: 0.05 },
  { intent: 'emergency', weight: 0.02 },
];

function weightedRandom(items) {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let queryCounter = 0;

export function generateSyntheticQuery(hotZoneId = null) {
  const lang = weightedRandom(LANGUAGE_WEIGHTS).code;
  const intent = weightedRandom(INTENT_WEIGHTS).intent;

  // If there's a hot zone, bias toward it 40% of the time
  let zone;
  if (hotZoneId && Math.random() < 0.4) {
    zone = ZONES.find(z => z.id === hotZoneId) || randomItem(ZONES);
  } else {
    zone = randomItem(ZONES);
  }

  const templates = QUERY_TEMPLATES[lang]?.[intent] || QUERY_TEMPLATES.en[intent] || QUERY_TEMPLATES.en.general;
  const template = randomItem(templates);
  const message = template.replace('{zone}', zone.name);

  queryCounter++;
  return {
    id: `sim-${Date.now()}-${queryCounter}`,
    message,
    language: lang,
    intent,
    zoneId: zone.id,
    zoneName: zone.name,
    timestamp: new Date().toISOString(),
    isSimulated: true,
    urgency: intent === 'emergency' ? 'critical' : intent === 'safety' ? 'high' : 'normal',
  };
}

// Generate a burst of queries for initial dashboard population
export function generateInitialBatch(count = 40) {
  const queries = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const q = generateSyntheticQuery();
    // Spread over last 15 minutes
    q.timestamp = new Date(now - Math.random() * 15 * 60 * 1000).toISOString();
    queries.push(q);
  }
  return queries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
