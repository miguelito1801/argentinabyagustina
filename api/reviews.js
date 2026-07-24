import crypto from 'node:crypto';

const PROJECT_ID = 'brjqcwkq';
const DATASET = 'production';
const API_VERSION = '2025-02-19';
const MAX_BODY_BYTES = 6000;
const MAX_REVIEWS_PER_HOUR = 3;

function clean(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

function allowedOrigin(origin) {
  if (!origin) return false;
  const allowed = new Set([
    'https://argentinabyagustina.com',
    'https://www.argentinabyagustina.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ]);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  return allowed.has(origin);
}

function requestIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function fingerprint(req) {
  const day = new Date().toISOString().slice(0, 10);
  const raw = `${requestIp(req)}|${req.headers['user-agent'] || ''}|${day}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function recentSubmissionCount(token, submissionFingerprint) {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const query = 'count(*[_type == "review" && submissionFingerprint == $fingerprint && submittedAt > $cutoff])';
  const params = new URLSearchParams({
    query,
    '$fingerprint': JSON.stringify(submissionFingerprint),
    '$cutoff': JSON.stringify(cutoff),
  });
  const endpoint = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?${params}`;
  const response = await fetch(endpoint, {
    headers: {Authorization: `Bearer ${token}`, Accept: 'application/json'},
  });
  if (!response.ok) throw new Error(`Rate-limit query failed (${response.status})`);
  const result = await response.json();
  return Number(result.result || 0);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (!allowedOrigin(origin)) return res.status(403).json({success: false, message: 'Origin not allowed.'});

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({success: false, message: 'Method not allowed.'});
  }

  const fetchSite = String(req.headers['sec-fetch-site'] || '');
  if (fetchSite && !['same-origin', 'same-site'].includes(fetchSite)) {
    return res.status(403).json({success: false, message: 'Request not allowed.'});
  }
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return res.status(415).json({success: false, message: 'JSON content required.'});
  }
  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return res.status(413).json({success: false, message: 'Request too large.'});
  }

  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) return res.status(500).json({success: false, message: 'Review service is not configured yet.'});

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch { return res.status(400).json({success: false, message: 'Invalid request.'}); }
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
    return res.status(413).json({success: false, message: 'Request too large.'});
  }

  // Honeypot: bots commonly fill fields hidden from human visitors.
  if (clean(body.website, 200)) return res.status(200).json({success: true});

  const name = clean(body.name, 100);
  const country = clean(body.country, 80);
  const email = clean(body.email, 160).toLowerCase();
  const comment = String(body.comment || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 1200);
  const rating = Number(body.rating);
  const consent = body.consent === true || body.consent === 'on';
  const formStartedAt = Number(body.formStartedAt || 0);

  if (!consent || !formStartedAt || Date.now() - formStartedAt < 1500 || Date.now() - formStartedAt > 2 * 60 * 60 * 1000) {
    return res.status(400).json({success: false, message: 'Please review the form and try again.'});
  }
  if (name.length < 2 || country.length < 2 || comment.length < 20 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({success: false, message: 'Please complete all required fields correctly.'});
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({success: false, message: 'Please enter a valid email address.'});
  }

  const submissionFingerprint = fingerprint(req);
  try {
    const recentCount = await recentSubmissionCount(token, submissionFingerprint);
    if (recentCount >= MAX_REVIEWS_PER_HOUR) {
      res.setHeader('Retry-After', '3600');
      return res.status(429).json({success: false, message: 'Too many reviews were sent from this device. Please try again later.'});
    }
  } catch (error) {
    // Do not block legitimate visitors if the auxiliary rate-limit check is temporarily unavailable.
    console.warn('Review rate-limit check unavailable:', error.message);
  }

  const document = {
    _type: 'review',
    name,
    country,
    ...(email ? {email} : {}),
    rating,
    comment,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    source: 'website',
    featured: false,
    submissionFingerprint,
  };

  try {
    const endpoint = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}?returnIds=true`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({mutations: [{create: document}]}),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Sanity mutation failed:', {status: response.status, error: result?.error?.description || result?.message});
      return res.status(502).json({success: false, message: 'The review could not be saved. Please try again.'});
    }
    return res.status(201).json({success: true, message: 'Thank you! Your review is awaiting approval.'});
  } catch (error) {
    console.error('Review endpoint error:', error.message);
    return res.status(500).json({success: false, message: 'The review could not be saved. Please try again.'});
  }
}
