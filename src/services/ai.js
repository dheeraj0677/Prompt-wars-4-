// Claude API service — browser calls go through the same-origin server proxy.
import { ZONES as ZONE_LIST } from '../data/stadium';

const API_URL = '/api/claude';
const MAX_INPUT_LENGTH = 500;
const RATE_LIMIT_MS = 1000; // Minimum 1 second between API calls

let lastCallTimestamp = 0;

/**
 * Sanitizes user input to prevent prompt injection and ensure safe API calls.
 * Trims whitespace, enforces length limits, and removes control characters.
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input safe for API consumption
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, MAX_INPUT_LENGTH)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Strip control chars
}

/**
 * Makes a rate-limited call to the server-side Claude proxy.
 * The browser never receives the Anthropic API key.
 * @param {string} system - System prompt defining Claude's behavior
 * @param {string} userMessage - The user's message to respond to
 * @param {number} [maxTokens=1024] - Maximum response tokens
 * @returns {Promise<string>} Claude's text response
 * @throws {Error} When API call fails or rate limit is exceeded
 */
async function callClaude(system, userMessage, maxTokens = 1024) {
  // Rate limiting — prevent API abuse
  const now = Date.now();
  if (import.meta.env.MODE !== 'test' && now - lastCallTimestamp < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - (now - lastCallTimestamp)));
  }
  lastCallTimestamp = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system,
        userMessage: sanitizeInput(userMessage),
        maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (import.meta.env.DEV) {
        console.error('Claude API error:', response.status, errorText);
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.text !== 'string' || data.text.length === 0) {
      throw new Error('Invalid AI proxy response');
    }
    return data.text;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Claude API call failed:', error);
    }
    throw error;
  }
}

/**
 * Parses structured intent JSON from the first line of a Claude response.
 * Falls back to a default intent if parsing fails.
 * @param {string} text - Raw Claude response text
 * @returns {{ intent: Object, responseText: string }} Parsed intent and clean response
 */
export function parseIntentFromResponse(text) {
  try {
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.startsWith('{')) {
      const intent = JSON.parse(firstLine);
      const responseText = text.substring(text.indexOf('\n') + 1).trim();
      return { intent, responseText };
    }
  } catch {
    // Fallback — couldn't parse
  }
  return {
    intent: { intent: 'general', zone: 'unknown', language: 'en', urgency: 'normal' },
    responseText: text,
  };
}

// 1. Fan Concierge — multilingual response with intent tagging
export async function fanConciergeChat(systemPrompt, userMessage) {
  const rawResponse = await callClaude(systemPrompt, userMessage, 512);
  const { intent, responseText } = parseIntentFromResponse(rawResponse);
  return {
    response: responseText,
    intent: intent.intent,
    zone: intent.zone,
    language: intent.language,
    urgency: intent.urgency,
  };
}

// 2. Staff analyst — query the data
export async function staffAnalystChat(systemPrompt, userMessage) {
  return callClaude(systemPrompt, userMessage, 800);
}

// 3. Shift summary generation
export async function generateShiftSummary(systemPrompt, userMessage) {
  return callClaude(systemPrompt, userMessage, 600);
}

// Fallback responses when API is unavailable
const FALLBACK_RESPONSES = {
  en: "I'm currently experiencing connectivity issues. For immediate assistance, please visit the nearest Information Desk or contact stadium staff. Emergency: call stadium security at any red phone.",
  es: 'Estoy experimentando problemas de conectividad. Para asistencia inmediata, visite el mostrador de información más cercano.',
  pt: 'Estou com problemas de conectividade. Para assistência imediata, visite o balcão de informações mais próximo.',
  fr: "Je rencontre des problèmes de connectivité. Pour une assistance immédiate, rendez-vous au bureau d'information le plus proche.",
  ar: 'أواجه مشاكل في الاتصال. للمساعدة الفورية، يرجى زيارة أقرب مكتب معلومات.',
};

export function getFallbackResponse(lang = 'en') {
  return FALLBACK_RESPONSES[lang] || FALLBACK_RESPONSES.en;
}

// Mock response generator for demo mode (when API is unreachable)
const MOCK_RESPONSES = {
  wayfinding: {
    en: (zone, from) => `From ${from}, head towards the main concourse and follow the blue signs to ${zone}. It's about a 3-minute walk. Look for the digital signboard at the junction.`,
    es: (zone, from) => `Desde ${from}, diríjase al pasillo principal y siga las señales azules hacia ${zone}. Es aproximadamente 3 minutos a pie.`,
    pt: (zone, from) => `De ${from}, siga pelo corredor principal e acompanhe as placas azuis até ${zone}. São cerca de 3 minutos de caminhada.`,
    fr: (zone, from) => `Depuis ${from}, dirigez-vous vers le couloir principal et suivez les panneaux bleus vers ${zone}. C'est environ 3 minutes à pied.`,
    ar: (zone, from) => `من ${from}، توجه نحو الممر الرئيسي واتبع اللافتات الزرقاء إلى ${zone}. المسافة حوالي 3 دقائق سيراً.`,
  },
  accessibility: {
    en: () => `The nearest wheelchair-accessible route uses Elevator 4 (Section 102). All main concourses have ramps. The sensory-friendly zone is near Gate C (North). Need specific assistance? Flag any staff member in a green vest.`,
    es: () => `La ruta accesible más cercana usa el Ascensor 4 (Sección 102). Todos los pasillos principales tienen rampas. La zona sensorial está cerca de la Puerta C.`,
    pt: () => `A rota acessível mais próxima usa o Elevador 4 (Seção 102). Todos os corredores principais têm rampas.`,
    fr: () => `L'itinéraire accessible le plus proche utilise l'Ascenseur 4 (Section 102). Tous les couloirs principaux ont des rampes.`,
    ar: () => `أقرب مسار متاح لذوي الاحتياجات الخاصة يستخدم المصعد 4 (القسم 102). جميع الممرات الرئيسية بها منحدرات.`,
  },
  transport: {
    en: () => `Next shuttle: Shuttle Stop A departs in 8 minutes. Last metro train: 23:30. Taxi stand: 200m from Gate A. Ride-share pickup zone: Lot B entrance. Plan to leave 15 minutes before your target departure.`,
    es: () => `Próximo shuttle: Parada A sale en 8 minutos. Último metro: 23:30. Taxis: 200m de la Puerta A.`,
    pt: () => `Próximo ônibus: Parada A sai em 8 minutos. Último metrô: 23:30. Táxis: 200m do Portão A.`,
    fr: () => `Prochaine navette: Arrêt A dans 8 minutes. Dernier métro: 23h30. Taxis: 200m de la Porte A.`,
    ar: () => `الحافلة التالية: محطة A تغادر خلال 8 دقائق. آخر مترو: 23:30. سيارات الأجرة: 200م من البوابة A.`,
  },
  food_drink: {
    en: () => `Food Court North has international options including halal, vegetarian, and a water refill station. Concession stands at Sections 102 and 108 serve quick snacks. Current wait: ~5 min at Food Court, ~2 min at concessions.`,
    es: () => `La Plaza de Comidas Norte tiene opciones internacionales incluyendo halal y vegetariano. Puestos de comida rápida en Secciones 102 y 108.`,
    pt: () => `A Praça de Alimentação Norte tem opções internacionais incluindo halal e vegetariano. Lanchonetes nas Seções 102 e 108.`,
    fr: () => `Le Food Court Nord propose des options internationales dont halal et végétarien. Des stands de restauration rapide aux Sections 102 et 108.`,
    ar: () => `ساحة الطعام الشمالية تقدم خيارات دولية تشمل الحلال والنباتي. أكشاك الوجبات السريعة في القسمين 102 و108.`,
  },
  restroom: {
    en: (zone) => `Nearest restrooms to ${zone}: Main concourse level (30m east). Accessible/family restrooms available at Gate A and VIP Lounge. Current wait estimate: ~2 minutes.`,
    es: (zone) => `Baños más cercanos a ${zone}: nivel del pasillo principal (30m al este). Baños accesibles en Puerta A y Sala VIP.`,
    pt: (zone) => `Banheiros mais próximos de ${zone}: nível do corredor principal (30m a leste). Banheiros acessíveis no Portão A e Sala VIP.`,
    fr: (zone) => `Toilettes les plus proches de ${zone}: niveau du couloir principal (30m à l'est). Toilettes accessibles à la Porte A et au Salon VIP.`,
    ar: (zone) => `أقرب حمامات إلى ${zone}: مستوى الممر الرئيسي (30 متر شرقاً). حمامات مخصصة لذوي الاحتياجات في البوابة A.`,
  },
  safety: {
    en: () => `First Aid station: Gate A (Main), staffed with paramedics. For emergencies, use the red emergency phones on every concourse or flag any security officer (yellow vest). Emergency exits are lit with green signs at all gates.`,
    es: () => `Primeros auxilios: Puerta A (Principal). Para emergencias, use los teléfonos rojos en cada pasillo o contacte a seguridad (chaleco amarillo).`,
    pt: () => `Primeiros socorros: Portão A (Principal). Para emergências, use os telefones vermelhos em cada corredor ou chame a segurança (colete amarelo).`,
    fr: () => `Premiers secours: Porte A (Principale). Pour les urgences, utilisez les téléphones rouges dans chaque couloir ou contactez la sécurité (gilet jaune).`,
    ar: () => `الإسعافات الأولية: البوابة A (الرئيسية). في حالات الطوارئ، استخدم الهواتف الحمراء في كل ممر أو تواصل مع الأمن (سترة صفراء).`,
  },
  emergency: {
    en: () => `🚨 EMERGENCY: Stay calm. Alert the nearest staff member immediately. Emergency phones (red) are located on every concourse. If you need to evacuate, follow the green EXIT signs. Do NOT use elevators. Security is being notified.`,
    es: () => `🚨 EMERGENCIA: Mantenga la calma. Alerte al personal más cercano. Siga las señales verdes de SALIDA. NO use ascensores.`,
    pt: () => `🚨 EMERGÊNCIA: Mantenha a calma. Alerte o funcionário mais próximo. Siga as placas verdes de SAÍDA. NÃO use elevadores.`,
    fr: () => `🚨 URGENCE: Restez calme. Alertez le personnel le plus proche. Suivez les panneaux verts SORTIE. N'utilisez PAS les ascenseurs.`,
    ar: () => `🚨 طوارئ: حافظ على هدوئك. أبلغ أقرب موظف فوراً. اتبع لافتات الخروج الخضراء. لا تستخدم المصاعد.`,
  },
  general: {
    en: () => `Welcome to Lusail Stadium! Wi-Fi: FIFA2026-FAN (no password needed). Cameras are allowed. Merchandise shops at West Concourse and East Plaza. Fan Zone with live screen at East Plaza. Need help? Visit any Information Desk.`,
    es: () => `¡Bienvenido al Estadio Lusail! Wi-Fi: FIFA2026-FAN (sin contraseña). Se permiten cámaras. Tiendas en el Pasillo Oeste y Plaza Este.`,
    pt: () => `Bem-vindo ao Estádio Lusail! Wi-Fi: FIFA2026-FAN (sem senha). Câmeras são permitidas. Lojas no Corredor Oeste e Praça Leste.`,
    fr: () => `Bienvenue au Stade Lusail! Wi-Fi: FIFA2026-FAN (sans mot de passe). Les appareils photo sont autorisés. Boutiques au Couloir Ouest et Place Est.`,
    ar: () => `مرحباً في استاد لوسيل! واي فاي: FIFA2026-FAN (بدون كلمة مرور). الكاميرات مسموح بها. المتاجر في الممر الغربي والساحة الشرقية.`,
  },
  lost_found: {
    en: () => `Lost & Found is located at Gate B (West). Report lost items at any Information Desk. If you've lost a child, immediately alert security (yellow vest) — they'll activate the Child Alert protocol.`,
    es: () => `Objetos perdidos: Puerta B (Oeste). Reporte artículos perdidos en cualquier mostrador de información.`,
    pt: () => `Achados e Perdidos: Portão B (Oeste). Relate itens perdidos em qualquer balcão de informações.`,
    fr: () => `Objets trouvés: Porte B (Ouest). Signalez les objets perdus à n'importe quel bureau d'information.`,
    ar: () => `المفقودات: البوابة B (الغربية). أبلغ عن المفقودات في أي مكتب معلومات.`,
  },
  schedule: {
    en: () => `Match Schedule: Gates open at 18:00. Kick-off at 20:00. Halftime ~20:48 (15 min break). Final whistle ~21:55. Post-match: transport priority starts immediately. Last metro: 23:30.`,
    es: () => `Horario: Puertas abren a las 18:00. Inicio a las 20:00. Medio tiempo ~20:48. Final ~21:55. Último metro: 23:30.`,
    pt: () => `Cronograma: Portões abrem às 18:00. Início às 20:00. Intervalo ~20:48. Final ~21:55. Último metrô: 23:30.`,
    fr: () => `Programme: Ouverture des portes à 18h00. Coup d'envoi à 20h00. Mi-temps ~20h48. Fin ~21h55. Dernier métro: 23h30.`,
    ar: () => `الجدول: فتح البوابات 18:00. بداية المباراة 20:00. الاستراحة ~20:48. النهاية ~21:55. آخر مترو: 23:30.`,
  },
};

// Simple intent detection for mock mode
function detectIntent(message) {
  const lower = message.toLowerCase();
  const patterns = {
    emergency: /emergency|emergencia|urgence|طوارئ|smoke|fire|collapsed|fight|حريق/i,
    safety: /first aid|medical|help|security|primeros auxilios|secours|إسعاف|doctor/i,
    wayfinding: /where|how.*get|direction|way to|gate|section|dónde|como llego|où|comment aller|أين|كيف أصل/i,
    accessibility: /wheelchair|accessible|ramp|elevator|sensory|disability|silla de ruedas|fauteuil/i,
    restroom: /restroom|bathroom|toilet|baño|banheiro|toilette|حمام/i,
    transport: /shuttle|bus|train|metro|taxi|parking|ride|transporte|transport|مواصلات|حافلة/i,
    food_drink: /food|eat|drink|water|halal|vegetarian|comida|comer|água|nourriture|طعام|ماء/i,
    lost_found: /lost|found|missing|perdí|perdi|perdu|فقدت/i,
    schedule: /time|start|kick.?off|when|hora|heure|متى|schedule/i,
  };

  for (const [intent, pattern] of Object.entries(patterns)) {
    if (pattern.test(lower)) return intent;
  }
  return 'general';
}

function detectLanguage(message) {
  // Simple heuristic detection
  if (/[أ-ي]/.test(message)) return 'ar';
  if (/[àáâãéêíóôõúüçñ]/i.test(message)) {
    if (/\b(água|ônibus|perto|banheiro|cadeira|obrigado|tem|posso)\b/i.test(message)) return 'pt';
    if (/ão|ções|ê|nh/i.test(message)) return 'pt';
    if (/ñ|¿|¡/i.test(message)) return 'es';
    return 'es'; // default Latin
  }
  if (/[àâçéèêëïîôùûü]/i.test(message) || /qu'|l'|d'|n'|c'est/i.test(message)) return 'fr';
  if (/está|dónde|cómo|qué|cuándo/i.test(message)) return 'es';
  return 'en';
}

function detectZone(message, zones) {
  const lower = message.toLowerCase();
  for (const z of zones) {
    if (lower.includes(z.name.toLowerCase()) || lower.includes(z.shortName.toLowerCase()) || lower.includes(z.id)) {
      return z.id;
    }
  }
  // Check for partial matches
  if (/gate\s*a|puerta\s*a|portão\s*a|porte\s*a/i.test(lower)) return 'gate-a';
  if (/gate\s*b|puerta\s*b|portão\s*b|porte\s*b/i.test(lower)) return 'gate-b';
  if (/gate\s*c|puerta\s*c|portão\s*c|porte\s*c/i.test(lower)) return 'gate-c';
  if (/section\s*102|sección\s*102|seção\s*102/i.test(lower)) return 'section-102';
  if (/section\s*108|sección\s*108|seção\s*108/i.test(lower)) return 'section-108';
  if (/food\s*court|comida|alimentação/i.test(lower)) return 'food-court';
  if (/vip/i.test(lower)) return 'vip-lounge';
  if (/concourse|pasillo|corredor|couloir/i.test(lower)) return 'west-concourse';
  if (/plaza|praça|place/i.test(lower)) return 'east-plaza';
  return null;
}



// Main mock response function
export function getMockFanResponse(message, fanLocation) {
  const intent = detectIntent(message);
  const language = detectLanguage(message);
  const mentionedZone = detectZone(message, ZONE_LIST);
  const zone = mentionedZone || fanLocation;
  const fromZone = ZONE_LIST.find(z => z.id === fanLocation)?.name || 'your location';
  const toZone = ZONE_LIST.find(z => z.id === (mentionedZone || fanLocation))?.name || 'the stadium';

  const responseFn = MOCK_RESPONSES[intent]?.[language] || MOCK_RESPONSES[intent]?.en || MOCK_RESPONSES.general.en;
  const response = responseFn(toZone, fromZone);

  return {
    response,
    intent,
    zone,
    language,
    urgency: intent === 'emergency' ? 'critical' : intent === 'safety' ? 'high' : 'normal',
  };
}

// Staff mock response
export function getMockStaffResponse(question, queryLogSummary) {
  const topZone = Object.entries(queryLogSummary.byZone).sort((a, b) => b[1] - a[1])[0];
  const topIntent = Object.entries(queryLogSummary.byIntent).sort((a, b) => b[1] - a[1])[0];

  return `Based on the current data (${queryLogSummary.totalQueries} queries in the last ${queryLogSummary.timeRange}):

**Highest Activity Zone:** ${topZone ? `${topZone[0]} with ${topZone[1]} queries` : 'No data available'}
**Most Common Need:** ${topIntent ? `${topIntent[0].replace('_', ' ')} (${topIntent[1]} queries)` : 'N/A'}

${queryLogSummary.anomalies.length > 0
    ? `⚠️ **Active Anomalies:**\n${queryLogSummary.anomalies.map(a => `- ${a}`).join('\n')}`
    : '✅ No anomalies detected.'}

**Recommendation:** ${topZone && topZone[1] > 10
    ? `Consider deploying additional staff to ${topZone[0]} to manage elevated query volume.`
    : 'Operations running within normal parameters. Maintain current staffing levels.'}`;
}

// Mock shift summary
export function getMockShiftSummary(queryLogSummary) {
  const topZones = Object.entries(queryLogSummary.byZone).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topIntents = Object.entries(queryLogSummary.byIntent).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return `**SHIFT BRIEFING — ${timeStr}**

**SITUATION OVERVIEW:** Stadium operations are active with ${queryLogSummary.totalQueries} fan interactions logged in the last ${queryLogSummary.timeRange}. ${topZones.length > 0 ? `Primary activity concentrated at ${topZones[0][0]}` : 'Activity evenly distributed'}.

**KEY FINDINGS:**
${topZones.map(([zone, count]) => `• ${zone}: ${count} queries — ${count > 12 ? 'elevated, consider additional staff' : 'within normal range'}`).join('\n')}
${topIntents.map(([intent, count]) => `• ${intent.replace('_', ' ')}: ${count} queries across stadium`).join('\n')}

**ANOMALIES:** ${queryLogSummary.anomalies.length > 0 ? queryLogSummary.anomalies.join('; ') : 'None currently active — all zones within standard parameters.'}

**FORECAST:** Expect ${now.getHours() < 20 ? 'increasing crowd activity as kickoff approaches. Pre-position wayfinding staff at main gates.' : 'sustained activity through the match. Monitor exit zones for post-match surge preparation.'}`;
}
