import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(__dirname, 'dist');
const DIST_ROOT = resolve(DIST_DIR);
const INDEX_FILE = join(DIST_DIR, 'index.html');
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const BODY_LIMIT_BYTES = 32 * 1024;
const MAX_INPUT_LENGTH = 500;
const MAX_SYSTEM_LENGTH = 16000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

const requestLog = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function securityHeaders(contentType = 'application/octet-stream') {
  return {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, securityHeaders('application/json; charset=utf-8'));
  res.end(JSON.stringify(payload));
}

function sanitizeInput(input, maxLength = MAX_INPUT_LENGTH) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function getClientId(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
}

function isRateLimited(clientId) {
  const now = Date.now();
  const current = requestLog.get(clientId) || [];
  const recent = current.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(clientId, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > BODY_LIMIT_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleClaudeProxy(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const clientId = getClientId(req);
  if (isRateLimited(clientId)) {
    sendJson(res, 429, { error: 'Too many AI requests. Please try again shortly.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: 'AI proxy is not configured.' });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const payload = JSON.parse(rawBody || '{}');
    const system = sanitizeInput(payload.system, MAX_SYSTEM_LENGTH);
    const userMessage = sanitizeInput(payload.userMessage);
    const maxTokens = Number.isInteger(payload.maxTokens)
      ? Math.min(Math.max(payload.maxTokens, 1), 2000)
      : 1024;

    if (!system || !userMessage) {
      sendJson(res, 400, { error: 'Missing required AI prompt fields.' });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let upstream;
    try {
      upstream = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      sendJson(res, upstream.status, { error: 'AI provider request failed.' });
      return;
    }

    const data = await upstream.json();
    const text = data?.content?.find(part => part.type === 'text')?.text || data?.content?.[0]?.text || '';
    sendJson(res, 200, { text });
  } catch {
    sendJson(res, 502, { error: 'AI proxy request failed.' });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const requestPath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const filePath = resolve(DIST_DIR, requestPath);

  if (!filePath.toLowerCase().startsWith(`${DIST_ROOT.toLowerCase()}${sep}`)) {
    res.writeHead(403, securityHeaders('text/plain; charset=utf-8'));
    res.end('Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
    const contentType = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
    const body = await readFile(filePath);
    res.writeHead(200, securityHeaders(contentType));
    res.end(body);
  } catch {
    const body = await readFile(INDEX_FILE);
    res.writeHead(200, securityHeaders('text/html; charset=utf-8'));
    res.end(body);
  }
}

const server = createServer(async (req, res) => {
  if (req.url?.startsWith('/api/claude')) {
    await handleClaudeProxy(req, res);
    return;
  }

  await serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`FanPulse server listening on port ${PORT}`);
});
