const PROJECT_ID = 'brjqcwkq';
const DATASET = 'production';
const API_VERSION = '2025-02-19';

function clean(value, maxLength) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function allowedOrigin(origin) {
  if (!origin) return true;
  return [
    'https://argentinabyagustina.com',
    'https://www.argentinabyagustina.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ].includes(origin);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (!allowedOrigin(origin)) return res.status(403).json({success: false, message: 'Origin not allowed.'});
  if (origin && allowedOrigin(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).end(); }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({success: false, message: 'Method not allowed.'});
  }

  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) return res.status(500).json({success: false, message: 'Review service is not configured yet.'});

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch { return res.status(400).json({success: false, message: 'Invalid request.'}); }
  if (JSON.stringify(body).length > 5000) return res.status(413).json({success: false, message: 'Request too large.'});
  if (clean(body.website, 200)) return res.status(200).json({success: true});

  const name = clean(body.name, 100);
  const country = clean(body.country, 80);
  const email = clean(body.email, 160).toLowerCase();
  const comment = String(body.comment || '').trim().slice(0, 1200);
  const rating = Number(body.rating);
  const consent = body.consent === true || body.consent === 'on';
  const formStartedAt = Number(body.formStartedAt || 0);

  if (!consent || (formStartedAt && Date.now() - formStartedAt < 1500)) return res.status(400).json({success: false, message: 'Please review the form and try again.'});
  if (name.length < 2 || country.length < 2 || comment.length < 20 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({success: false, message: 'Please complete all required fields correctly.'});
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({success: false, message: 'Please enter a valid email address.'});
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
    const responseText = await response.text();
    let result = {};
    try { result = responseText ? JSON.parse(responseText) : {}; }
    catch { result = {message: responseText || 'Invalid response from Sanity.'}; }
    if (!response.ok) {
      console.error('Sanity mutation failed:', result);
      return res.status(502).json({success: false, message: 'The review could not be saved. Please try again.'});
    }
    return res.status(201).json({success: true, message: 'Thank you! Your review is awaiting approval.'});
  } catch (error) {
    console.error('Review endpoint error:', error);
    return res.status(500).json({success: false, message: 'The review could not be saved. Please try again.'});
  }
}
